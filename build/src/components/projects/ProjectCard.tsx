import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Copy, Trash2, Edit2, Pencil, ExternalLink, Loader2, Github, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GitHubStarsButton } from "@/components/animate-ui/components/buttons/github-stars";
import type { Project } from "@/types/project";

export interface ProjectItemProps {
    project: Project;
    formatDate: (date: Date | null) => string;
    onRename: (id: string, newName: string) => Promise<void>;
    onDuplicate: (id: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onSetGithubRepo?: (id: string, repo: string | null) => Promise<void>;
}

// Simple hash to generated a persistent color based on project name
function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${Math.abs(hash) % 360}, 70%, 80%)`;
    return color;
}

export function ProjectCard({ project, formatDate, onRename, onDuplicate, onDelete, onSetGithubRepo }: ProjectItemProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [nameInput, setNameInput] = useState(project.name);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // GitHub repo linking state
    const [isLinkingRepo, setIsLinkingRepo] = useState(false);
    const [repoInput, setRepoInput] = useState(project.githubRepo ?? "");
    const [isSavingRepo, setIsSavingRepo] = useState(false);

    // Mongoose documents append _id, and our frontend type has _id
    const projectId = project._id || project.id;

    // Calculate dummy thumbnail
    const initials = project.name.substring(0, 2).toUpperCase();
    const bgColor = stringToColor(project.name);

    const isLive = project.isPublished && project.liveUrl;

    // Parse githubRepo for display
    const repoSlug = project.githubRepo ?? null;
    const [ghUser, ghRepo] = repoSlug ? repoSlug.split("/") : ["", ""];

    // Confirm rename
    const handleRenameSubmit = async () => {
        if (!nameInput.trim() || nameInput === project.name) {
            setIsRenaming(false);
            return;
        }
        setIsSaving(true);
        try {
            await onRename(projectId as string, nameInput);
            setIsRenaming(false);
        } catch (error) {
            console.error("Rename failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleRenameSubmit();
        if (e.key === "Escape") {
            setNameInput(project.name);
            setIsRenaming(false);
        }
    };

    const handleDeleteSubmit = async () => {
        setIsSaving(true);
        try {
            await onDelete(projectId as string);
            setIsFadingOut(true);
            // The parent will remove it from the list shortly, the fadeout provides visual feedback
        } catch (error) {
            console.error("Delete failed", error);
            setIsSaving(false);
            setIsDeleting(false);
        }
    };

    // GitHub repo linking
    const handleRepoKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleRepoSave();
        if (e.key === "Escape") {
            setRepoInput(project.githubRepo ?? "");
            setIsLinkingRepo(false);
        }
    };

    const handleRepoSave = async () => {
        if (!onSetGithubRepo) return;
        const trimmed = repoInput.trim();
        // Validate format: must be "username/repo" or empty (to clear)
        if (trimmed && !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
            return; // Silently ignore invalid format, placeholder shows the required format
        }
        setIsSavingRepo(true);
        try {
            await onSetGithubRepo(projectId as string, trimmed || null);
            setIsLinkingRepo(false);
        } catch (error) {
            console.error("Failed to link repo", error);
        } finally {
            setIsSavingRepo(false);
        }
    };

    const handleUnlinkRepo = async () => {
        if (!onSetGithubRepo) return;
        setIsSavingRepo(true);
        try {
            await onSetGithubRepo(projectId as string, null);
            setRepoInput("");
        } catch (error) {
            console.error("Failed to unlink repo", error);
        } finally {
            setIsSavingRepo(false);
        }
    };

    if (isFadingOut) {
        return (
            <Card className="flex h-64 items-center justify-center opacity-0 transition-opacity duration-300">
                <p className="text-muted-foreground text-sm">Deleting...</p>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md group">
            {/* Thumbnail */}
            <Link to={`/editor/${projectId}`} target="_blank" className="relative h-32 w-full flex items-center justify-center border-b" style={{ backgroundColor: bgColor }}>
                 <span className="text-4xl font-bold text-black/20 tracking-widest">{initials}</span>
                 <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
            </Link>

            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between min-h-[40px]">
                    {isRenaming ? (
                       <div className="flex flex-col gap-1 w-full mr-2">
                           <Input
                                autoFocus
                                value={nameInput}
                                onChange={e => setNameInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleRenameSubmit}
                                disabled={isSaving}
                                className="h-7 text-sm font-semibold p-1 px-2"
                            />
                            {isSaving && <Badge variant="outline" className="w-fit text-[10px] animate-pulse">Saving...</Badge>}
                       </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-base font-semibold leading-tight line-clamp-1" title={project.name}>
                                {project.name}
                            </CardTitle>
                            {isLive ? (
                                <Badge className="w-fit bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[10px] border-none px-1.5 font-medium">Live</Badge>
                            ) : (
                                <Badge variant="secondary" className="w-fit text-[10px] px-1.5 font-medium text-muted-foreground">Draft</Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-1 flex-1">
                <p className="text-xs text-muted-foreground">
                    Edited {formatDate(project.updatedAt)}
                </p>

                {/* GitHub Stars display */}
                {repoSlug && !isLinkingRepo && (
                    <div className="mt-2 flex items-center gap-1">
                        <GitHubStarsButton
                            username={ghUser}
                            repo={ghRepo}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2 gap-1.5"
                            inView
                            inViewOnce
                        />
                        {onSetGithubRepo && (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-muted-foreground/50 hover:text-destructive"
                                            onClick={handleUnlinkRepo}
                                            disabled={isSavingRepo}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Unlink repo</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                )}

                {/* Inline GitHub Repo Link Input */}
                {isLinkingRepo && (
                    <div className="mt-2 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1">
                            <Github className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <Input
                                autoFocus
                                value={repoInput}
                                onChange={e => setRepoInput(e.target.value)}
                                onKeyDown={handleRepoKeyDown}
                                placeholder="username/repo"
                                disabled={isSavingRepo}
                                className="h-7 text-xs px-2 font-mono"
                            />
                        </div>
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                className="h-6 text-[11px] flex-1 px-2"
                                onClick={handleRepoSave}
                                disabled={isSavingRepo}
                            >
                                {isSavingRepo ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-[11px] flex-1 px-2"
                                onClick={() => { setRepoInput(project.githubRepo ?? ""); setIsLinkingRepo(false); }}
                                disabled={isSavingRepo}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Inline Delete Confirmation */}
                {isDeleting && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">Are you sure?</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="destructive" onClick={handleDeleteSubmit} disabled={isSaving} className="h-7 text-xs flex-1">
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin"/> : "Yes, Delete"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setIsDeleting(false)} disabled={isSaving} className="h-7 text-xs flex-1">
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Actions Row */}
            <CardFooter className="p-3 border-t bg-muted/20 flex gap-2">
                <Button size="sm" className="h-8 flex-1" asChild>
                    <Link to={`/editor/${projectId}`} target="_blank">
                        <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                    </Link>
                </Button>

                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <span className="flex-1">
                                <Button size="sm" variant="outline" className="h-8 w-full" disabled={!isLive} asChild={!!isLive}>
                                    {isLive ? (
                                        <a href={project.liveUrl!} target="_blank" rel="noreferrer">
                                            <ExternalLink className="mr-1 h-3.5 w-3.5" /> View
                                        </a>
                                    ) : (
                                        <span><ExternalLink className="mr-1 h-3.5 w-3.5" /> View</span>
                                    )}
                                </Button>
                           </span>
                        </TooltipTrigger>
                        {!isLive && (
                             <TooltipContent>
                                <p>Not published</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => { setIsRenaming(true); setNameInput(project.name); }}>
                            <Pencil className="mr-2 h-4 w-4" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(projectId as string)}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        {onSetGithubRepo && (
                            <DropdownMenuItem onClick={() => { setRepoInput(project.githubRepo ?? ""); setIsLinkingRepo(true); }}>
                                <Github className="mr-2 h-4 w-4" />
                                {repoSlug ? "Change Repo" : "Link GitHub Repo"}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleting(true)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}
