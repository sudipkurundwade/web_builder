import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Project } from "../models/project.model.js";
import { ProjectVersion } from "../models/projectVersion.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { PageBlock } from "../models/block.model.js";
import { buildRemixProject } from "../utils/templateRemix.js";
import { AnalyticsEvent } from "../models/analyticsEvent.model.js";

const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

const slugify = (value = "") =>
    String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const getPageFilename = (page, index) => {
    if (index === 0) return "index.html";

    const slug = slugify(page.slug || page.name || page.id || `page-${index + 1}`);
    const filename = slug && slug !== "index" ? `${slug}.html` : `page-${index + 1}.html`;
    return filename;
};

const getGithubPagesUrl = (repoOwner, repoName) => {
    const owner = String(repoOwner || "").trim();
    const repo = String(repoName || "").trim();

    if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
        return `https://${owner}.github.io`;
    }

    return `https://${owner}.github.io/${repo}`;
};

const copyPages = (pages = []) =>
    pages.map((page) => ({
        id: page.id,
        name: page.name,
        html: page.html,
        css: page.css,
        slug: page.slug,
        title: page.title,
        description: page.description,
        faviconUrl: page.faviconUrl,
        ogImageUrl: page.ogImageUrl,
    }));

const buildVersionLabel = (action) => {
    switch (action) {
        case "publish":
            return "Published version";
        case "restore":
            return "Restored version";
        case "save":
        default:
            return "Manual save";
    }
};

const createProjectVersion = async (project, action = "save") => {
    if (!project?._id || !project?.owner) return null;

    return ProjectVersion.create({
        project: project._id,
        owner: project.owner,
        label: buildVersionLabel(action),
        action,
        name: project.name,
        projectData: project.projectData || {},
        html: project.html || "",
        css: project.css || "",
        pages: copyPages(project.pages || []),
        remixSettings: project.remixSettings || null,
        githubRepo: project.githubRepo || null,
        isPublished: Boolean(project.isPublished),
        liveUrl: project.liveUrl || null,
    });
};

const serializeVersionSummary = (version) => ({
    _id: version._id,
    project: version.project,
    label: version.label,
    action: version.action,
    name: version.name,
    pagesCount: Array.isArray(version.pages) ? version.pages.length : 0,
    htmlSize: String(version.html || "").length,
    cssSize: String(version.css || "").length,
    isPublished: Boolean(version.isPublished),
    liveUrl: version.liveUrl || null,
    createdAt: version.createdAt,
    updatedAt: version.updatedAt,
});

const parseGithubResponse = async (res) => {
    const text = await res.text();
    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch(e) {
        return { message: text };
    }
};

const getGithubErrorMessage = (data) => {
    if (!data) return "";
    if (data.message) return data.message;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors
            .map((error) => error.message || error.code || JSON.stringify(error))
            .filter(Boolean)
            .join(", ");
    }
    return "";
};

const ensureGithubPagesEnabled = async ({ repoOwner, repoName, branch, headers }) => {
    const pagesUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pages`;
    const desiredSource = {
        branch,
        path: "/",
    };
    const pagesBody = {
        build_type: "legacy",
        source: desiredSource,
    };

    const pagesRes = await fetch(pagesUrl, { headers });

    if (pagesRes.status === 404) {
        const createRes = await fetch(pagesUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(pagesBody),
        });
        const createData = await parseGithubResponse(createRes);

        if (!createRes.ok && createRes.status !== 409) {
            const message = getGithubErrorMessage(createData);
            throw new ApiError(
                createRes.status,
                `GitHub Pages: Failed to enable Pages for ${repoOwner}/${repoName}. ${message || "Check that your GitHub token has Pages/Admin write permission."}`
            );
        }

        return createData.html_url || getGithubPagesUrl(repoOwner, repoName);
    }

    const pagesData = await parseGithubResponse(pagesRes);
    if (!pagesRes.ok) {
        const message = getGithubErrorMessage(pagesData);
        throw new ApiError(
            pagesRes.status,
            `GitHub Pages: Failed to read Pages settings for ${repoOwner}/${repoName}. ${message || ""}`
        );
    }

    const source = pagesData.source || {};
    const shouldUpdate =
        source.branch !== desiredSource.branch ||
        source.path !== desiredSource.path ||
        pagesData.build_type === "workflow";

    if (shouldUpdate) {
        const updateRes = await fetch(pagesUrl, {
            method: "PUT",
            headers,
            body: JSON.stringify(pagesBody),
        });
        const updateData = await parseGithubResponse(updateRes);

        if (!updateRes.ok) {
            const message = getGithubErrorMessage(updateData);
            throw new ApiError(
                updateRes.status,
                `GitHub Pages: Failed to update Pages source for ${repoOwner}/${repoName}. ${message || ""}`
            );
        }
    }

    return pagesData.html_url || getGithubPagesUrl(repoOwner, repoName);
};

const putGithubFile = async ({ repoOwner, repoName, branch, path: filePath, content, message, headers }) => {
    let fileSha = undefined;
    const encodedPath = filePath.split("/").map((part) => encodeURIComponent(part)).join("/");
    const fileRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`, { headers });

    if (fileRes.ok) {
        const fileData = await parseGithubResponse(fileRes);
        fileSha = fileData.sha;
    } else if (fileRes.status !== 404) {
        const fileData = await parseGithubResponse(fileRes);
        throw new ApiError(
            fileRes.status,
            `GitHub: Failed to read ${filePath}. ${getGithubErrorMessage(fileData) || ""}`
        );
    }

    const pushRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${encodedPath}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
            message,
            content,
            sha: fileSha,
            branch,
        }),
    });

    const pushData = await parseGithubResponse(pushRes);
    if (!pushRes.ok) {
        throw new ApiError(
            pushRes.status,
            `GitHub: Failed to push ${filePath}. ${getGithubErrorMessage(pushData) || ""}`
        );
    }
};

const requestGithubPagesBuild = async ({ repoOwner, repoName, headers }) => {
    const buildRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pages/builds`, {
        method: "POST",
        headers,
    });

    if ([201, 202, 204, 409, 422].includes(buildRes.status)) return;

    const buildData = await parseGithubResponse(buildRes);
    console.warn("GitHub Pages build trigger failed:", buildRes.status, buildData);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForGithubPagesBuild = async ({ repoOwner, repoName, headers, liveUrl }) => {
    let latestStatus = "queued";
    let latestError = "";

    for (let attempt = 0; attempt < 12; attempt += 1) {
        await wait(attempt < 4 ? 3000 : 5000);

        const buildRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pages/builds/latest`, {
            headers,
        });
        const buildData = await parseGithubResponse(buildRes);

        if (buildRes.ok) {
            latestStatus = buildData.status || latestStatus;
            latestError = buildData.error?.message || "";

            if (latestStatus === "built") {
                return {
                    status: "built",
                    message: "GitHub Pages build finished.",
                };
            }

            if (latestStatus === "errored") {
                throw new ApiError(500, `GitHub Pages build failed. ${latestError || "Check the repository Pages build logs."}`);
            }
        }

        const siteRes = await fetch(liveUrl, { method: "GET" });
        if (siteRes.ok) {
            return {
                status: "built",
                message: "GitHub Pages site is live.",
            };
        }
    }

    return {
        status: latestStatus || "pending",
        message: "GitHub Pages accepted the publish, but the site is still deploying. It can take a minute or two before the URL stops showing 404.",
    };
};

const buildPublishedHtml = ({
    title,
    description = "",
    faviconUrl = "",
    ogImageUrl = "",
    canonicalUrl = "",
    html = "",
    css = "",
}) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>
        (function(){
            try {
                var saved = localStorage.getItem("web-builder-theme");
                var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
                var theme = saved || (prefersDark ? "dark" : "light");
                document.documentElement.setAttribute("data-theme", theme);
                document.documentElement.classList.toggle("dark", theme === "dark");
            } catch (e) {}
        })();
    </script>
    <title>${escapeHtml(title)}</title>
    ${description ? `<meta name="description" content="${escapeHtml(description)}">` : ""}
    ${canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">` : ""}
    ${faviconUrl ? `<link rel="icon" href="${escapeHtml(faviconUrl)}">` : ""}
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)}">
    ${description ? `<meta property="og:description" content="${escapeHtml(description)}">` : ""}
    ${canonicalUrl ? `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">` : ""}
    ${ogImageUrl ? `<meta property="og:image" content="${escapeHtml(ogImageUrl)}">` : ""}
    <meta name="twitter:card" content="${ogImageUrl ? "summary_large_image" : "summary"}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    ${description ? `<meta name="twitter:description" content="${escapeHtml(description)}">` : ""}
    ${ogImageUrl ? `<meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">` : ""}
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            min-height: 100%;
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #ffffff;
            color: #0f172a;
            overflow-x: hidden;
        }

        body {
            min-height: 100vh;
        }

        img,
        video,
        canvas,
        svg {
            max-width: 100%;
        }

        .published-page-root {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            padding: 24px;
        }

        @media (max-width: 640px) {
            .published-page-root {
                padding: 16px;
            }
        }

        ${css || ""}
    </style>
</head>
<body>
    <main class="published-page-root">
        ${html || ""}
    </main>
</body>
</html>`;

const createProject = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        throw new ApiError(400, "Project name is required");
    }

    const project = await Project.create({
        name,
        owner: req.user?._id,
        projectData: {}
    });

    return res.status(201).json(
        new ApiResponse(201, project, "Project created successfully")
    );
});

const createRemixProject = asyncHandler(async (req, res) => {
    const {
        name,
        businessType = "saas",
        tone = "modern",
        palette = "indigo",
        sections,
    } = req.body;

    if (!name || !String(name).trim()) {
        throw new ApiError(400, "Project name is required");
    }

    const pageBlocks = await PageBlock.find({ isActive: true }).select("label category tags html");
    if (!pageBlocks.length) {
        throw new ApiError(404, "No active page blocks found. Run the block seed before creating a remix project.");
    }

    const remix = buildRemixProject(pageBlocks, {
        businessType,
        tone,
        palette,
        sections,
    });

    if (!remix.selectedBlocks.length) {
        throw new ApiError(400, "No matching page blocks found for the selected sections");
    }

    const project = await Project.create({
        name: String(name).trim(),
        owner: req.user?._id,
        html: remix.html,
        css: remix.css,
        pages: [
            {
                id: "home",
                name: "Home",
                slug: "",
                title: String(name).trim(),
                description: "",
                faviconUrl: "",
                ogImageUrl: "",
                html: remix.html,
                css: remix.css,
            },
        ],
        projectData: {},
        remixSettings: {
            ...remix.options,
            selectedBlocks: remix.selectedBlocks,
            createdAt: new Date().toISOString(),
        },
    });

    return res.status(201).json(
        new ApiResponse(201, { project, remix }, "Remix project created successfully")
    );
});

const saveProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    
    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(404, "Invalid project ID format (Project not found)");
    }

    const { projectData, html, css, name, pages, githubRepo } = req.body;

    const updateFields = {};
    if (projectData !== undefined) updateFields.projectData = projectData;
    if (html !== undefined) updateFields.html = html;
    if (css !== undefined) updateFields.css = css;
    if (name !== undefined) updateFields.name = name;
    if (pages !== undefined) updateFields.pages = pages;
    if (githubRepo !== undefined) updateFields.githubRepo = githubRepo;

    const project = await Project.findOneAndUpdate(
        { _id: projectId, owner: req.user?._id },
        {
            $set: updateFields
        },
        { new: true }
    );

    if (!project) {
        throw new ApiError(404, "Project not found or unauthorized");
    }

    const shouldSnapshot = [projectData, html, css, pages].some((value) => value !== undefined);
    if (shouldSnapshot) {
        await createProjectVersion(project, "save");
    }

    return res.status(200).json(
        new ApiResponse(200, project, "Project saved successfully")
    );
});

const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(404, "Invalid project ID format (Project not found)");
    }

    const project = await Project.findOne({
        _id: projectId,
        owner: req.user?._id
    });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res.status(200).json(
        new ApiResponse(200, project, "Project fetched successfully")
    );
});

const getUserProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ owner: req.user?._id }).sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, projects, "Projects fetched successfully")
    );
});

const publishProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(404, "Invalid project ID format (Project not found)");
    }

    const project = await Project.findOne({
        _id: projectId,
        owner: req.user?._id
    });

    if (!project) {
        throw new ApiError(404, "Project not found or unauthorized");
    }

    const { GITHUB_PAT, GITHUB_USERNAME } = process.env;
    if (!GITHUB_PAT || !GITHUB_USERNAME) {
        throw new ApiError(500, "Server missing GitHub credentials. Please configure GITHUB_PAT and GITHUB_USERNAME.");
    }

    const linkedRepo = project.githubRepo ? String(project.githubRepo).trim() : "";
    let repoOwner = GITHUB_USERNAME;
    let repoName = project.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    if (linkedRepo) {
        const repoMatch = linkedRepo.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
        if (!repoMatch) {
            throw new ApiError(400, "Linked GitHub repository must use the format owner/repo.");
        }

        repoOwner = repoMatch[1];
        repoName = repoMatch[2];
    }

    if (!repoName) {
        throw new ApiError(400, "Project name cannot be converted to a valid repository name.");
    }

    const headers = {
        "Authorization": `Bearer ${GITHUB_PAT}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": GITHUB_USERNAME || "Animate-App"
    };

    // 1. Ensure Repo exists
    let defaultBranch = "main";
    const repoRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, { headers });
    
    if (repoRes.status === 404) {
        if (linkedRepo) {
            throw new ApiError(404, `Linked GitHub repository ${repoOwner}/${repoName} was not found or the token cannot access it.`);
        }

        // Create repo
        const createRes = await fetch(`https://api.github.com/user/repos`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: repoName,
                description: `Created via Animate App Editor`,
                private: false,
                auto_init: true
            })
        });
        const createData = await parseGithubResponse(createRes);
        if (!createRes.ok) throw new ApiError(500, `GitHub: Failed to create repository (${createRes.status}): ${createData.message || ''}`);
        defaultBranch = createData.default_branch || "main";
        
        // Wait briefly for GitHub replica propagation
        await new Promise(r => setTimeout(r, 2000));
    } else if (repoRes.ok) {
        const repoData = await parseGithubResponse(repoRes);
        defaultBranch = repoData.default_branch || "main";
    } else {
        const errorData = await parseGithubResponse(repoRes);
        throw new ApiError(500, `GitHub: Failed to verify repository (${repoRes.status}): ${errorData.message || ''}`);
    }

    let liveUrl = getGithubPagesUrl(repoOwner, repoName);

    // 2. Build Multi-Page Export
    const filesToUpload = [];
    filesToUpload.push({
        path: ".nojekyll",
        content: Buffer.from("").toString("base64")
    });

    if (project.pages && project.pages.length > 0) {
        project.pages.forEach((page, index) => {
            const filename = getPageFilename(page, index);
            const pageUrl = `${liveUrl}/${filename === "index.html" ? "" : filename}`;

            const fullHtml = buildPublishedHtml({
                title: page.title || `${project.name} - ${page.name || "Home"}`,
                description: page.description || "",
                faviconUrl: page.faviconUrl || "",
                ogImageUrl: page.ogImageUrl || "",
                canonicalUrl: pageUrl,
                html: page.html,
                css: page.css,
            });
            filesToUpload.push({
                path: filename,
                content: Buffer.from(fullHtml).toString('base64')
            });
        });
    } else {
        // Legacy fallback
        const fullHtml = buildPublishedHtml({
            title: project.name,
            canonicalUrl: liveUrl,
            html: project.html,
            css: project.css,
        });
        filesToUpload.push({
            path: "index.html",
            content: Buffer.from(fullHtml).toString('base64')
        });
    }

    // 3 & 4. Sequence uploads for all pages
    for (const file of filesToUpload) {
        await putGithubFile({
            repoOwner,
            repoName,
            branch: defaultBranch,
            path: file.path,
            content: file.content,
            message: `Publish website file (${file.path}): ${new Date().toISOString()}`,
            headers,
        });
    }

    // 5. Enable branch-based GitHub Pages and wait briefly for the public URL.
    liveUrl = await ensureGithubPagesEnabled({ repoOwner, repoName, branch: defaultBranch, headers });
    await requestGithubPagesBuild({ repoOwner, repoName, headers });
    const pagesDeployment = await waitForGithubPagesBuild({ repoOwner, repoName, headers, liveUrl });

    project.isPublished = true;
    project.liveUrl = liveUrl;
    await project.save();
    await Promise.all([
        createProjectVersion(project, "publish"),
        AnalyticsEvent.create({
            type: "project_publish",
            user: req.user?._id || null,
            project: project._id,
            path: liveUrl,
            device: "unknown",
        }),
    ]);

    return res.status(200).json(
        new ApiResponse(200, { liveUrl, pagesDeployment }, pagesDeployment.message)
    );
});

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(404, "Invalid project ID format");
    }

    const project = await Project.findOneAndDelete({
        _id: projectId,
        owner: req.user?._id
    });

    if (!project) {
        throw new ApiError(404, "Project not found or unauthorized");
    }

    await ProjectVersion.deleteMany({
        project: project._id,
        owner: req.user?._id,
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Project deleted successfully")
    );
});

const getProjectVersions = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(404, "Invalid project ID format");
    }

    const project = await Project.findOne({
        _id: projectId,
        owner: req.user?._id,
    }).select("_id");

    if (!project) {
        throw new ApiError(404, "Project not found or unauthorized");
    }

    const versions = await ProjectVersion.find({
        project: projectId,
        owner: req.user?._id,
    })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("_id project label action name pages html css isPublished liveUrl createdAt updatedAt");

    return res.status(200).json(
        new ApiResponse(200, versions.map(serializeVersionSummary), "Project versions fetched successfully")
    );
});

const restoreProjectVersion = asyncHandler(async (req, res) => {
    const { projectId, versionId } = req.params;

    if (!mongoose.isValidObjectId(projectId) || !mongoose.isValidObjectId(versionId)) {
        throw new ApiError(404, "Invalid project or version ID format");
    }

    const version = await ProjectVersion.findOne({
        _id: versionId,
        project: projectId,
        owner: req.user?._id,
    });

    if (!version) {
        throw new ApiError(404, "Project version not found");
    }

    const project = await Project.findOneAndUpdate(
        {
            _id: projectId,
            owner: req.user?._id,
        },
        {
            $set: {
                name: version.name,
                projectData: version.projectData || {},
                html: version.html || "",
                css: version.css || "",
                pages: copyPages(version.pages || []),
                remixSettings: version.remixSettings || null,
                githubRepo: version.githubRepo || null,
                isPublished: false,
                liveUrl: null,
            },
        },
        { new: true },
    );

    if (!project) {
        throw new ApiError(404, "Project not found or unauthorized");
    }

    await createProjectVersion(project, "restore");

    return res.status(200).json(
        new ApiResponse(200, project, "Project restored from version")
    );
});

const duplicateProjectVersion = asyncHandler(async (req, res) => {
    const { projectId, versionId } = req.params;

    if (!mongoose.isValidObjectId(projectId) || !mongoose.isValidObjectId(versionId)) {
        throw new ApiError(404, "Invalid project or version ID format");
    }

    const version = await ProjectVersion.findOne({
        _id: versionId,
        project: projectId,
        owner: req.user?._id,
    });

    if (!version) {
        throw new ApiError(404, "Project version not found");
    }

    const project = await Project.create({
        name: `${version.name} (Version Copy)`,
        owner: req.user?._id,
        projectData: version.projectData || {},
        html: version.html || "",
        css: version.css || "",
        pages: copyPages(version.pages || []),
        remixSettings: version.remixSettings || null,
        githubRepo: null,
        isPublished: false,
        liveUrl: null,
    });

    await createProjectVersion(project, "save");

    return res.status(201).json(
        new ApiResponse(201, project, "Project duplicated from version")
    );
});

const duplicateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiError(404, "Invalid project ID format");
    }

    const sourceProject = await Project.findOne({
        _id: projectId,
        owner: req.user?._id
    });

    if (!sourceProject) {
        throw new ApiError(404, "Project not found or unauthorized");
    }

    const copiedPages = (sourceProject.pages || []).map((page) => ({
        id: page.id,
        name: page.name,
        html: page.html,
        css: page.css,
        slug: page.slug,
        title: page.title,
        description: page.description,
        faviconUrl: page.faviconUrl,
        ogImageUrl: page.ogImageUrl
    }));

    const newProject = await Project.create({
        name: `${sourceProject.name} (Copy)`,
        owner: req.user?._id,
        projectData: sourceProject.projectData || {},
        html: sourceProject.html,
        css: sourceProject.css,
        pages: copiedPages,
        remixSettings: sourceProject.remixSettings || null,
        githubRepo: null,
        isPublished: false,
        liveUrl: null
        // slug and published states would be reset here.
    });

    return res.status(201).json(
        new ApiResponse(201, newProject, "Project duplicated successfully")
    );
});

export {
    createProject,
    createRemixProject,
    saveProject,
    getProjectById,
    getUserProjects,
    publishProject,
    deleteProject,
    duplicateProject,
    getProjectVersions,
    restoreProjectVersion,
    duplicateProjectVersion
};
