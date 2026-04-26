import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Project } from "../models/project.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    const repoName = project.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!repoName) {
        throw new ApiError(400, "Project name cannot be converted to a valid repository name.");
    }

    const headers = {
        "Authorization": `Bearer ${GITHUB_PAT}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": GITHUB_USERNAME || "Animate-App"
    };

    const parseGithubResponse = async (res) => {
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch(e) {
            return { message: text };
        }
    };

    // 1. Ensure Repo exists
    let defaultBranch = "main";
    const repoRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`, { headers });
    
    if (repoRes.status === 404) {
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

    // 2. Build Multi-Page Export
    const filesToUpload = [];

    if (project.pages && project.pages.length > 0) {
        project.pages.forEach((page, index) => {
            const isFirst = index === 0;
            const rawName = page.name || page.id || `page-${index + 1}`;
            let filename = isFirst ? 'index.html' : `${rawName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.html`;
            
            // Prevent users from breaking sequential naming if they named a secondary page 'index'
            if (filename === 'index.html' && !isFirst) {
               filename = `page-${index + 1}.html`;
            }

            const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - ${page.name || "Home"}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${page.css || ''}</style>
</head>
<body>
    ${page.html || ''}
</body>
</html>`;
            filesToUpload.push({
                path: filename,
                content: Buffer.from(fullHtml).toString('base64')
            });
        });
    } else {
        // Legacy fallback
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${project.css || ''}</style>
</head>
<body>
    ${project.html || ''}
</body>
</html>`;
        filesToUpload.push({
            path: "index.html",
            content: Buffer.from(fullHtml).toString('base64')
        });
    }

    // 3 & 4. Sequence uploads for all pages
    for (const file of filesToUpload) {
        let fileSha = undefined;
        // Check if file exists to grab SHA
        const fileRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${file.path}`, { headers });
        if (fileRes.ok) {
            const fileData = await parseGithubResponse(fileRes);
            fileSha = fileData.sha;
        }

        // Create or Update File
        const pushRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${file.path}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Publish website file (${file.path}): ${new Date().toISOString()}`,
                content: file.content,
                sha: fileSha,
                branch: defaultBranch
            })
        });

        if (!pushRes.ok) {
            const errData = await parseGithubResponse(pushRes);
            console.error(`Github push error on ${file.path}:`, errData);
            throw new ApiError(500, `GitHub: Failed to push ${file.path}: ${errData.message || ''}`);
        }
    }

    // 5. Enable GitHub Pages
    const pagesRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/pages`, { headers });
    if (pagesRes.status === 404 || !pagesRes.ok) {
        // Try enabling
        await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/pages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                source: {
                    branch: defaultBranch,
                    path: "/"
                }
            })
        });
        // 409 usually means already enabled, which is fine
    }

    const liveUrl = `https://${GITHUB_USERNAME}.github.io/${repoName}`;

    project.isPublished = true;
    project.liveUrl = liveUrl;
    await project.save();

    return res.status(200).json(
        new ApiResponse(200, { liveUrl }, "Project published successfully via GitHub Pages")
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

    return res.status(200).json(
        new ApiResponse(200, {}, "Project deleted successfully")
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

    const newProject = await Project.create({
        name: `${sourceProject.name} (Copy)`,
        owner: req.user?._id,
        projectData: sourceProject.projectData || {},
        html: sourceProject.html,
        css: sourceProject.css
        // slug and published states would be reset here.
    });

    return res.status(201).json(
        new ApiResponse(201, newProject, "Project duplicated successfully")
    );
});

export {
    createProject,
    saveProject,
    getProjectById,
    getUserProjects,
    publishProject,
    deleteProject,
    duplicateProject
};
