/**
 * Primary actions:
 *  - Undo / Redo
 *  - Save (logs HTML/CSS/project JSON + passes to onPersist)
 *  - Publish (Save -> Publish flow)
 *  - Device switcher
 *  - Page selector
 *
 * Project title uses shadcn Input.
 */

import { useState, useEffect } from "react";
import type { Page } from "grapesjs";
import { Copy, GitCompare, History, Loader2, Rocket, Save, RotateCw, RotateCcw, Check, XCircle, Eye, EyeOff, Share2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useGrapesEditor } from "@/editor/context/EditorContext";
import { duplicateProjectVersion, getProjectVersions, publishProject, restoreProjectVersion } from "@/services/projectService";
import { shareProjectAsTemplate } from "@/services/templateService";
import type { ProjectPage, ProjectVersion } from "@/types/project";

export interface TopToolbarProps {
    projectId: string;
    projectName: string;
    onProjectNameChange: (value: string) => void;
    /** Optional: run after logging (e.g. saveProject) */
    onPersist?: (payload: {
        html: string;
        css: string;
        projectData: Record<string, unknown>;
        pages?: ProjectPage[];
    }) => Promise<void>;
    isSaving?: boolean;
    disabled?: boolean;
}

type PublishState = "idle" | "saving" | "publishing" | "success" | "error";

interface PageSeoSettings {
    slug: string;
    title: string;
    description: string;
    faviconUrl: string;
    ogImageUrl: string;
}

const emptySeoSettings: PageSeoSettings = {
    slug: "",
    title: "",
    description: "",
    faviconUrl: "",
    ogImageUrl: "",
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const readPageSeo = (page: Page | null): PageSeoSettings => {
    if (!page) return emptySeoSettings;
    const seo = (page.get("seo") as Partial<PageSeoSettings> | undefined) || {};
    return {
        slug: String(seo.slug || page.get("slug") || ""),
        title: String(seo.title || page.get("title") || ""),
        description: String(seo.description || page.get("description") || ""),
        faviconUrl: String(seo.faviconUrl || page.get("faviconUrl") || ""),
        ogImageUrl: String(seo.ogImageUrl || page.get("ogImageUrl") || ""),
    };
};

export function TopToolbar({
    projectId,
    projectName,
    onProjectNameChange,
    onPersist,
    isSaving = false,
    disabled = false,
}: TopToolbarProps) {
    const { editor, isReady, isPreview, setIsPreview, currentPageId } =
        useGrapesEditor();

    const [publishState, setPublishState] = useState<PublishState>("idle");
    const [publishError, setPublishError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [liveUrl, setLiveUrl] = useState<string | null>(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [shareDescription, setShareDescription] = useState("");
    const [shareCategory, setShareCategory] = useState("Website");
    const [shareTags, setShareTags] = useState("");
    const [isSharingTemplate, setIsSharingTemplate] = useState(false);
    const [shareMessage, setShareMessage] = useState<string | null>(null);
    const [shareError, setShareError] = useState<string | null>(null);
    const [showSeoModal, setShowSeoModal] = useState(false);
    const [seoDraft, setSeoDraft] = useState<PageSeoSettings>(emptySeoSettings);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [versions, setVersions] = useState<ProjectVersion[]>([]);
    const [versionsLoading, setVersionsLoading] = useState(false);
    const [versionsError, setVersionsError] = useState<string | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<ProjectVersion | null>(null);
    const [versionActionId, setVersionActionId] = useState<string | null>(null);

    // Track unsaved changes
    useEffect(() => {
        if (!editor) return;

        const handleDirty = () => setIsDirty(true);
        const handleSaved = () => setIsDirty(false);
        editor.on("change", handleDirty);
        editor.on("component:update", handleDirty);
        editor.on("project:saved", handleSaved);

        return () => {
            editor.off("change", handleDirty);
            editor.off("component:update", handleDirty);
            editor.off("project:saved", handleSaved);
        };
    }, [editor]);

    useEffect(() => {
        if (!showSeoModal) return;
        setSeoDraft(buildSeoDraft(getSelectedPage()));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- currentPageId is the page switch signal here.
    }, [currentPageId, showSeoModal]);

    /**
     * Reusable async save utility function.
     * Throws an error if the save process fails.
     */
    const saveProjectData = async (): Promise<void> => {
        if (!editor || !onPersist) return;
        
        // We want to export ALL pages concurrently
        const originalPage = editor.Pages.getSelected();
        const pagesData: ProjectPage[] = [];
        const pages = editor.Pages.getAll();
        
        for (const page of pages) {
            editor.Pages.select(page);
            const seo = readPageSeo(page);
            pagesData.push({
                id: (page.get("id") as string) || "unknown-id",
                name: (page.get("name") as string) || (page.get("id") as string) || "unknown-page",
                ...seo,
                html: editor.getHtml() ?? "",
                css: editor.getCss() ?? ""
            });
        }
        
        // Restore original active page purely in memory instantly
        if (originalPage) editor.Pages.select(originalPage);

        const projectData = editor.getProjectData() as Record<string, unknown>;

        await onPersist({ 
            // the legacy payload can still contain the currently selected page's HTML
            html: editor.getHtml() ?? "",
            css: editor.getCss() ?? "",
            pages: pagesData,
            projectData 
        });
        
        // Save successful, clear dirty flag
        setIsDirty(false);
        editor.trigger("project:saved");
    };

    const handleSave = async () => {
        try {
            await saveProjectData();
            if (showHistoryModal) void loadVersions();
            // Optional: Show a subtle "Saved" toast here if you implement a toaster
        } catch (e) {
            console.error("Save failed", e);
        }
    };

    /**
     * Save-Then-Publish Flow
     */
    const handlePublish = async () => {
        if (!editor || !projectId) return;

        try {
            // Step 1 & 2: Always synchronize the latest DOM elements to MongoDB before publishing
            setPublishState("saving");
            await saveProjectData();

            // Step 4: Call publish API
            setPublishState("publishing");
            setPublishError(null);
            const url = await publishProject(projectId);
            if (showHistoryModal) void loadVersions();

            // Step 5: Success state
            setLiveUrl(url);
            setPublishState("success");
            setShareDescription("");
            setShareCategory("Website");
            setShareTags("");
            setShareMessage(null);
            setShareError(null);
            setShowPublishModal(true); // Open the success popup
            
            // Revert back to idle after a few seconds so user can publish again
            // In a real app with "Unpublish", you might keep it in success state
            setTimeout(() => {
                setPublishState("idle");
            }, 5000);

        } catch (error: any) {
            console.error("Publish flow failed", error);
            
            // Extract backend error message
            const errMsg = error?.response?.data?.message || "Failed to publish";
            setPublishError(errMsg);
            
            // Step 6: Error state
            setPublishState("error");
            
            // Revert back to idle so they can retry
            setTimeout(() => {
                setPublishState("idle");
                setPublishError(null);
            }, 6000); // Wait 6 seconds to show the actual error message
        }
    };

    const runCommand = (name: string) => {
        if (!editor) return;
        editor.runCommand(name);
    };

    const loadVersions = async () => {
        if (!projectId) return;
        setVersionsLoading(true);
        setVersionsError(null);

        try {
            const data = await getProjectVersions(projectId);
            setVersions(data);
            setSelectedVersion((current) => {
                if (!current) return data[0] ?? null;
                return data.find((version) => version._id === current._id) ?? data[0] ?? null;
            });
        } catch (error: any) {
            setVersionsError(error?.response?.data?.message || "Could not load version history.");
        } finally {
            setVersionsLoading(false);
        }
    };

    const openVersionHistory = () => {
        setShowHistoryModal(true);
        void loadVersions();
    };

    const handleRestoreVersion = async (versionId: string) => {
        const confirmed = window.confirm("Restore this version? Your current project content will be replaced, and a restore snapshot will be created.");
        if (!confirmed) return;

        setVersionActionId(versionId);
        try {
            await restoreProjectVersion(projectId, versionId);
            window.location.reload();
        } catch (error: any) {
            setVersionsError(error?.response?.data?.message || "Could not restore this version.");
        } finally {
            setVersionActionId(null);
        }
    };

    const handleDuplicateVersion = async (versionId: string) => {
        setVersionActionId(versionId);
        try {
            const project = await duplicateProjectVersion(projectId, versionId);
            const id = project._id || project.id;
            if (id) window.open(`/editor/${id}`, "_blank");
        } catch (error: any) {
            setVersionsError(error?.response?.data?.message || "Could not duplicate this version.");
        } finally {
            setVersionActionId(null);
        }
    };

    const getCurrentSnapshotStats = () => ({
        pagesCount: editor?.Pages.getAll().length ?? 0,
        htmlSize: (editor?.getHtml() ?? "").length,
        cssSize: (editor?.getCss() ?? "").length,
    });

    const getSelectedPage = () => {
        if (!editor) return null;
        return editor.Pages.getSelected() || editor.Pages.getAll()[0] || null;
    };

    const buildSeoDraft = (page: Page | null): PageSeoSettings => {
        const pageName = page ? String(page.get("name") || page.get("id") || projectName) : projectName;
        const currentSeo = readPageSeo(page);
        return {
            ...currentSeo,
            slug: currentSeo.slug || slugify(pageName),
            title: currentSeo.title || pageName,
        };
    };

    const openSeoSettings = () => {
        const page = getSelectedPage();
        setSeoDraft(buildSeoDraft(page));
        setShowSeoModal(true);
    };

    const saveSeoSettings = () => {
        const page = getSelectedPage();
        if (!page || !editor) return;

        const nextSeo: PageSeoSettings = {
            slug: slugify(seoDraft.slug),
            title: seoDraft.title.trim(),
            description: seoDraft.description.trim(),
            faviconUrl: seoDraft.faviconUrl.trim(),
            ogImageUrl: seoDraft.ogImageUrl.trim(),
        };

        page.set("seo", nextSeo);
        Object.entries(nextSeo).forEach(([key, value]) => page.set(key, value));
        editor.trigger("change");
        setIsDirty(true);
        setShowSeoModal(false);
    };

    const togglePreview = () => {
        if (!editor) return;
        const newState = !isPreview;
        
        if (newState) {
            // Deselect any active component so properties/toolbar vanish
            editor.select(); 
            // Trigger native GrapesJS preview mode (disables selection, hover borders, etc)
            editor.runCommand('core:preview');
        } else {
            editor.stopCommand('core:preview');
        }
        
        setIsPreview(newState);
    };

    const handleShareTemplate = async () => {
        if (!projectId) return;

        setIsSharingTemplate(true);
        setShareError(null);
        setShareMessage(null);

        try {
            await shareProjectAsTemplate(projectId, {
                name: projectName || "Community Template",
                description: shareDescription,
                category: shareCategory || "Website",
                tags: shareTags.split(",").map((tag) => tag.trim()).filter(Boolean),
            });
            setShareMessage("Shared with the community template library.");
        } catch (error: any) {
            setShareError(error?.response?.data?.message || "Could not share this project as a template.");
        } finally {
            setIsSharingTemplate(false);
        }
    };

    const busy = !isReady || disabled || isSaving || publishState === "saving" || publishState === "publishing";

    // Dynamic Publish Button text based on state
    const getPublishButtonText = () => {
        switch (publishState) {
            case "saving": return "Saving...";
            case "publishing": return "Publishing...";
            case "success": return "Unpublish"; // Per requirements
            case "error": return "Retry";
            default: return "Publish";
        }
    };

    const currentStats = getCurrentSnapshotStats();
    const selectedDiff = selectedVersion
        ? {
            pages: currentStats.pagesCount - selectedVersion.pagesCount,
            html: currentStats.htmlSize - selectedVersion.htmlSize,
            css: currentStats.cssSize - selectedVersion.cssSize,
        }
        : null;

    return (
        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b bg-background px-3">
            <div className="flex min-w-0 items-center gap-2">
                <div
                    className="size-7 shrink-0 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600"
                    aria-hidden
                />
                <Input
                    value={projectName}
                    onChange={(e) => onProjectNameChange(e.target.value)}
                    placeholder="Project name"
                    disabled={disabled}
                    className="h-8 max-w-[220px] text-sm"
                    aria-label="Project name"
                />

                {/* Page selector migrated to canvas chrome */}

                {/* Dirty State Indicator */}
                {isDirty && publishState !== "saving" && (
                    <Badge variant="outline" className="hidden border-yellow-500/50 text-yellow-600 bg-yellow-500/10 md:inline-flex text-[10px]">
                        Unsaved Changes
                    </Badge>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
                {/* Undo / Redo */}
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={busy}
                        onClick={() => runCommand("core:undo")}
                    >
                        <RotateCcw className="size-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={busy}
                        onClick={() => runCommand("core:redo")}
                    >
                        <RotateCw className="size-3.5" />
                    </Button>
                </div>

                {/* Preview Toggle */}
                <Button
                    type="button"
                    variant={isPreview ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    disabled={busy}
                    onClick={togglePreview}
                    title={isPreview ? "Close Preview" : "Preview Website"}
                >
                    {isPreview ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5"
                    disabled={busy}
                    onClick={openSeoSettings}
                    title="SEO and social preview settings"
                >
                    <Search className="size-3.5" />
                    SEO
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5"
                    disabled={busy}
                    onClick={openVersionHistory}
                    title="Version history"
                >
                    <History className="size-3.5" />
                    History
                </Button>

                {/* Device selector migrated to canvas chrome */}

                {/* Live URL / Publish Status Badge */}
                {publishState === "success" && (
                    <div className="flex items-center gap-2 mr-2">
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none text-[10px]">
                            <Check className="mr-1 size-3" /> Live
                        </Badge>
                        {liveUrl && (
                            <a href={liveUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                                View site
                            </a>
                        )}
                    </div>
                )}
                {publishState === "error" && (
                    <Badge variant="destructive" className="mr-2 text-[10px] max-w-[200px] text-wrap text-left leading-tight py-1">
                        <XCircle className="mr-1 size-3 inline-block shrink-0" />
                        <span>{publishError || "Failed"}</span>
                    </Badge>
                )}

                {/* Save Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    disabled={busy || !isDirty} // Only enable save if dirty or not saving
                    onClick={() => void handleSave()}
                >
                    {isSaving && publishState !== "saving" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                        <Save className="size-3.5" />
                    )}
                    Save
                </Button>

                {/* Publish Button */}
                <Button
                    type="button"
                    size="sm"
                    className={[
                        "h-8 gap-1.5 text-white transition-all",
                        publishState === "success" 
                            ? "bg-slate-700 hover:bg-slate-800" 
                            : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                    ].join(" ")}
                    disabled={busy && publishState !== "success"} // allow unpublish click when success
                    onClick={() => {
                        // If it's success (Unpublish), you might want to call unpublish API.
                        // I'm resetting it back to idle for now to act as a toggle.
                        if (publishState === "success") {
                            setLiveUrl(null);
                            setPublishState("idle");
                            return;
                        }
                        void handlePublish();
                    }}
                >
                    {(publishState === "saving" || publishState === "publishing") ? (
                        <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                        <Rocket className="size-3.5" />
                    )}
                    {getPublishButtonText()}
                </Button>
            </div>

            <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Version History</DialogTitle>
                        <DialogDescription>
                            Restore an earlier save, compare it with the current canvas, or duplicate it into a new project.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid min-h-[420px] gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="rounded-md border">
                            <div className="flex items-center justify-between border-b px-3 py-2">
                                <span className="text-xs font-medium text-muted-foreground">Recent snapshots</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => void loadVersions()}
                                    disabled={versionsLoading}
                                >
                                    {versionsLoading ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}
                                    Refresh
                                </Button>
                            </div>

                            {versionsError && (
                                <div className="border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                    {versionsError}
                                </div>
                            )}

                            <ScrollArea className="h-[360px]">
                                {versionsLoading && versions.length === 0 ? (
                                    <div className="flex h-40 items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <Loader2 className="size-4 animate-spin" />
                                        Loading versions...
                                    </div>
                                ) : versions.length === 0 ? (
                                    <div className="flex h-40 items-center justify-center px-6 text-center text-xs text-muted-foreground">
                                        No snapshots yet. Manual saves and publishes will appear here.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {versions.map((version) => {
                                            const selected = selectedVersion?._id === version._id;
                                            const createdAt = new Date(version.createdAt).toLocaleString([], {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            });

                                            return (
                                                <button
                                                    key={version._id}
                                                    type="button"
                                                    onClick={() => setSelectedVersion(version)}
                                                    className={[
                                                        "flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors",
                                                        selected ? "bg-primary/5" : "hover:bg-muted/50",
                                                    ].join(" ")}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant={version.action === "publish" ? "default" : "outline"}
                                                                className="h-5 text-[10px]"
                                                            >
                                                                {version.action}
                                                            </Badge>
                                                            <p className="truncate text-sm font-medium">{version.label}</p>
                                                        </div>
                                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                                            {version.name} · {createdAt}
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                                                        <p>{version.pagesCount} page{version.pagesCount === 1 ? "" : "s"}</p>
                                                        <p>{Math.round((version.htmlSize + version.cssSize) / 1024)} KB</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        <div className="rounded-md border bg-muted/20 p-3">
                            {selectedVersion ? (
                                <div className="flex h-full flex-col">
                                    <div className="space-y-1">
                                        <Badge variant="outline" className="text-[10px]">
                                            {selectedVersion.action}
                                        </Badge>
                                        <h3 className="text-sm font-semibold">{selectedVersion.label}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(selectedVersion.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="mt-4 space-y-2 rounded-md border bg-background/70 p-3 text-xs">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <GitCompare className="size-3.5" />
                                            Compare to current
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                            <span>Pages</span>
                                            <span className="text-right">{selectedDiff?.pages ?? 0}</span>
                                            <span>HTML size</span>
                                            <span className="text-right">{selectedDiff?.html ?? 0} chars</span>
                                            <span>CSS size</span>
                                            <span className="text-right">{selectedDiff?.css ?? 0} chars</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 rounded-md border bg-background/70 p-3 text-xs text-muted-foreground">
                                        <p>Version pages: {selectedVersion.pagesCount}</p>
                                        <p>Published: {selectedVersion.isPublished ? "Yes" : "No"}</p>
                                        {selectedVersion.liveUrl && (
                                            <a
                                                href={selectedVersion.liveUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block truncate text-primary hover:underline"
                                            >
                                                {selectedVersion.liveUrl}
                                            </a>
                                        )}
                                    </div>

                                    <div className="mt-auto flex flex-col gap-2 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="justify-start gap-2"
                                            disabled={versionActionId === selectedVersion._id}
                                            onClick={() => void handleDuplicateVersion(selectedVersion._id)}
                                        >
                                            {versionActionId === selectedVersion._id ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <Copy className="size-4" />
                                            )}
                                            Duplicate as project
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            className="justify-start gap-2"
                                            disabled={versionActionId === selectedVersion._id}
                                            onClick={() => void handleRestoreVersion(selectedVersion._id)}
                                        >
                                            {versionActionId === selectedVersion._id ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <History className="size-4" />
                                            )}
                                            Restore this version
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-xs text-muted-foreground">
                                    Select a version to compare, restore, or duplicate.
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showSeoModal} onOpenChange={setShowSeoModal}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>SEO & Social Preview</DialogTitle>
                        <DialogDescription>
                            Configure the published metadata for the current page.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground" htmlFor="seo-title">
                                Page title
                            </label>
                            <Input
                                id="seo-title"
                                value={seoDraft.title}
                                onChange={(event) => setSeoDraft((prev) => ({ ...prev, title: event.target.value }))}
                                placeholder={projectName}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground" htmlFor="seo-description">
                                Description
                            </label>
                            <Textarea
                                id="seo-description"
                                value={seoDraft.description}
                                onChange={(event) => setSeoDraft((prev) => ({ ...prev, description: event.target.value }))}
                                placeholder="A short summary for search results and link previews."
                                className="min-h-20 resize-none text-sm"
                                maxLength={180}
                            />
                            <p className="text-[11px] text-muted-foreground">
                                {seoDraft.description.length}/180 characters
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground" htmlFor="seo-slug">
                                    Page slug
                                </label>
                                <Input
                                    id="seo-slug"
                                    value={seoDraft.slug}
                                    onChange={(event) => setSeoDraft((prev) => ({ ...prev, slug: event.target.value }))}
                                    onBlur={() => setSeoDraft((prev) => ({ ...prev, slug: slugify(prev.slug) }))}
                                    placeholder="about-us"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground" htmlFor="seo-favicon">
                                    Favicon URL
                                </label>
                                <Input
                                    id="seo-favicon"
                                    value={seoDraft.faviconUrl}
                                    onChange={(event) => setSeoDraft((prev) => ({ ...prev, faviconUrl: event.target.value }))}
                                    placeholder="https://example.com/favicon.png"
                                />
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground" htmlFor="seo-og-image">
                                Social preview image URL
                            </label>
                            <Input
                                id="seo-og-image"
                                value={seoDraft.ogImageUrl}
                                onChange={(event) => setSeoDraft((prev) => ({ ...prev, ogImageUrl: event.target.value }))}
                                placeholder="https://example.com/preview.png"
                            />
                        </div>

                        <div className="rounded-md border bg-muted/30 p-3">
                            <p className="line-clamp-1 text-sm font-semibold">
                                {seoDraft.title || projectName}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {seoDraft.description || "Search engines and social platforms will use this summary when available."}
                            </p>
                            <p className="mt-2 text-[11px] text-emerald-700">
                                /{slugify(seoDraft.slug) || "index"}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowSeoModal(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={saveSeoSettings}>
                            Save SEO Settings
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Publish Modal */}
            <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            🎉 Website Published Successfully
                        </DialogTitle>
                        <DialogDescription>
                            Your website is live. You can keep it private or share this design as a community template.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 mt-4 bg-muted p-2 rounded-md border">
                        <Input
                            readOnly
                            value={liveUrl || ""}
                            className="flex-1 bg-transparent border-none text-sm focus-visible:ring-0 shadow-none px-2"
                        />
                    </div>
                    <div className="mt-4 space-y-3 rounded-md border bg-muted/20 p-3">
                        <div>
                            <p className="text-sm font-medium">Share as community template?</p>
                            <p className="text-xs text-muted-foreground">
                                Other users can copy the design into their own projects. Your original project stays private.
                            </p>
                        </div>
                        <Input
                            value={shareDescription}
                            onChange={(event) => setShareDescription(event.target.value)}
                            placeholder="Short description"
                            className="h-8 text-sm"
                        />
                        <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                            <Input
                                value={shareCategory}
                                onChange={(event) => setShareCategory(event.target.value)}
                                placeholder="Category"
                                className="h-8 text-sm"
                            />
                            <Input
                                value={shareTags}
                                onChange={(event) => setShareTags(event.target.value)}
                                placeholder="Tags, comma separated"
                                className="h-8 text-sm"
                            />
                        </div>
                        {shareMessage && (
                            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">
                                {shareMessage}
                            </div>
                        )}
                        {shareError && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                {shareError}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="mt-6 sm:justify-between w-full">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowPublishModal(false)}
                        >
                            Keep Private
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void handleShareTemplate()}
                                disabled={isSharingTemplate || !!shareMessage}
                            >
                                {isSharingTemplate ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Share2 className="mr-2 size-4" />
                                )}
                                Share Template
                            </Button>
                            <Button type="button" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={liveUrl!} target="_blank" rel="noreferrer">
                                    Open Site
                                </a>
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </header>
    );
}
