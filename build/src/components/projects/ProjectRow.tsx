import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Copy, Trash2, Edit2, Pencil, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ProjectItemProps } from "./ProjectCard";

export function ProjectRow({ project, formatDate, onRename, onDuplicate, onDelete }: ProjectItemProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [nameInput, setNameInput] = useState(project.name);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const projectId = project._id || project.id; 
    const isLive = project.isPublished && project.liveUrl; 

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
        } catch (error) {
            console.error("Delete failed", error);
            setIsSaving(false);
            setIsDeleting(false);
        }
    };

    if (isFadingOut) {
        return (
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted opacity-0 duration-300">
                <td colSpan={4} className="p-4 text-center text-sm text-muted-foreground">Deleting...</td>
            </tr>
        );
    }

    return (
        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group">
            <td className="p-4 align-middle">
                {isRenaming ? (
                    <div className="flex items-center gap-2 max-w-[250px]">
                        <Input 
                            autoFocus 
                            value={nameInput} 
                            onChange={e => setNameInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleRenameSubmit}
                            disabled={isSaving}
                            className="h-8 text-sm font-semibold p-1 px-2"
                        />
                        {isSaving && <Badge variant="outline" className="text-[10px] animate-pulse">Saving...</Badge>}
                    </div>
                ) : (
                    <Link to={`/editor/${projectId}`} className="font-medium hover:underline flex flex-col">
                        <span className="line-clamp-1" title={project.name}>{project.name}</span>
                        {/* Mobile only status inline to save space if needed, handled via hidden CSS in parent */}
                    </Link>
                )}
            </td>
            
            <td className="p-4 align-middle hidden sm:table-cell">
                {isLive ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[10px] border-none px-1.5 font-medium">Live</Badge>
                ) : (
                    <Badge variant="secondary" className="text-[10px] px-1.5 font-medium text-muted-foreground">Draft</Badge>
                )}
            </td>

            <td className="p-4 align-middle text-sm text-muted-foreground hidden md:table-cell">
                {formatDate(project.updatedAt)}
            </td>

            <td className="p-4 align-middle text-right w-[200px]">
                {isDeleting ? (
                     <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-red-500 font-medium mr-1">Sure?</span>
                        <Button size="sm" variant="destructive" onClick={handleDeleteSubmit} disabled={isSaving} className="h-7 px-2 text-xs">
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin"/> : "Yes"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsDeleting(false)} disabled={isSaving} className="h-7 px-2 text-xs">
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" className="h-8 hidden sm:flex" asChild>
                            <Link to={`/editor/${projectId}`}>
                                <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                            </Link>
                        </Button>
                        
                        {isLive && (
                             <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="sm" variant="outline" className="h-8 hidden sm:flex" asChild>
                                            <a href={project.liveUrl!} target="_blank" rel="noreferrer">
                                                <ExternalLink className="mr-1 h-3.5 w-3.5" /> View
                                            </a>
                                        </Button>
                                    </TooltipTrigger>
                                </Tooltip>
                             </TooltipProvider>
                        )}
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => { setIsRenaming(true); setNameInput(project.name); }}>
                                    <Pencil className="mr-2 h-4 w-4" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDuplicate(projectId as string)}>
                                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleting(true)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </td>
        </tr>
    );
}
