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
import { Loader2, Rocket, Save, RotateCw, RotateCcw, Check, XCircle, Eye, EyeOff, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useGrapesEditor } from "@/editor/context/EditorContext";
import { publishProject } from "@/services/projectService";
import { shareProjectAsTemplate } from "@/services/templateService";

export interface TopToolbarProps {
    projectId: string;
    projectName: string;
    onProjectNameChange: (value: string) => void;
    /** Optional: run after logging (e.g. saveProject) */
    onPersist?: (payload: {
        html: string;
        css: string;
        projectData: Record<string, unknown>;
        pages?: { id: string; name: string; html: string; css: string }[];
    }) => Promise<void>;
    isSaving?: boolean;
    disabled?: boolean;
}

type PublishState = "idle" | "saving" | "publishing" | "success" | "error";

export function TopToolbar({
    projectId,
    projectName,
    onProjectNameChange,
    onPersist,
    isSaving = false,
    disabled = false,
}: TopToolbarProps) {
    const { editor, isReady, isPreview, setIsPreview } =
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

    /**
     * Reusable async save utility function.
     * Throws an error if the save process fails.
     */
    const saveProjectData = async (): Promise<void> => {
        if (!editor || !onPersist) return;
        
        // We want to export ALL pages concurrently
        const originalPage = editor.Pages.getSelected();
        const pagesData: { id: string; name: string; html: string; css: string }[] = [];
        const pages = editor.Pages.getAll();
        
        for (const page of pages) {
            editor.Pages.select(page);
            pagesData.push({
                id: (page.get("id") as string) || "unknown-id",
                name: (page.get("name") as string) || (page.get("id") as string) || "unknown-page",
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
