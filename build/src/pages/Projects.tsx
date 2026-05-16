import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, LayoutGrid, List as ListIcon, FolderOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectRow } from '@/components/projects/ProjectRow';
import { NewProjectRemixDialog } from '@/components/projects/NewProjectRemixDialog';

import { getUserProjects, deleteProject, duplicateProject, renameProject, setGithubRepo } from '@/services/projectService';
import type { Project } from '@/types/project';

function timeAgo(dateInput: Date | string | null): string {
    if (!dateInput) return "Unknown";
    const date = new Date(dateInput);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];

    for (let i = 0; i < intervals.length; i++) {
        const interval = intervals[i];
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
        }
    }
    return "just now";
}

export default function Projects() {

    // Core state
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // UI state
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
        return (localStorage.getItem("projectsViewMode") as "grid" | "list") || "grid";
    });

    // New Project Flow
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    // Initial load
    const fetchProjects = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const data = await getUserProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects", error);
            setFetchError("Failed to load projects from the server.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Filter projects client-side
    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projects;
        const q = searchQuery.toLowerCase();
        return projects.filter(p => p.name?.toLowerCase().includes(q));
    }, [projects, searchQuery]);

    // Handlers
    const handleToggleView = (mode: "grid"|"list") => {
        setViewMode(mode);
        localStorage.setItem("projectsViewMode", mode);
    };

    const handleProjectCreated = (project: Project) => {
        const id = project._id || project.id;
        setProjects((prev) => [project, ...prev]);
        if (id) window.open(`/editor/${id}`, '_blank');
        fetchProjects();
    };

    const handleRename = async (id: string, newName: string) => {
        // Optimistic update
        setProjects(prev => prev.map(p => {
             const pId = p._id || p.id;
             return pId === id ? { ...p, name: newName } : p;
        }));
        await renameProject(id, newName);
    };

    const handleSetGithubRepo = async (id: string, repo: string | null) => {
        // Optimistic update
        setProjects(prev => prev.map(p => {
            const pId = p._id || p.id;
            return pId === id ? { ...p, githubRepo: repo } : p;
        }));
        await setGithubRepo(id, repo);
    };

    const handleDuplicate = async (id: string) => {
        const newProj = await duplicateProject(id);
        // Optimistically add to top of list
        setProjects(prev => [newProj, ...prev]);
    };

    const handleDelete = async (id: string) => {
        await deleteProject(id);
        // Wait briefly to let Card fade out finish (handled visually in Card, but we remove from array after short delay)
        setTimeout(() => {
            setProjects(prev => prev.filter(p => (p._id || p.id) !== id));
        }, 300);
    };

    // Render Skeletons
    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-40 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <Skeleton className="h-10 w-full max-w-sm" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[125px] w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Your Projects</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your websites, landing pages, and components.
                    </p>
                </div>
                <Button onClick={() => setIsNewModalOpen(true)} className="gap-2 shrink-0">
                    <Plus className="size-4" /> New Project
                </Button>
            </div>

            {/* Error State */}
            {fetchError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="flex items-center gap-4">
                        {fetchError}
                        <Button variant="outline" size="sm" onClick={fetchProjects} className="bg-transparent opacity-80 hover:opacity-100">
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Empty State (Global) */}
            {!fetchError && projects.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 mt-12 border border-dashed rounded-xl bg-muted/20 text-center animate-in fade-in zoom-in duration-500">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
                        <FolderOpen className="h-10 w-10 text-muted-foreground/60" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
                    <p className="text-muted-foreground text-sm max-w-sm mb-6">
                        You don't have any projects. Create your first website to get started.
                    </p>
                    <Button onClick={() => setIsNewModalOpen(true)} className="gap-2">
                        <Plus className="size-4" /> Create First Project
                    </Button>
                </div>
            )}

            {/* Content Array */}
            {!fetchError && projects.length > 0 && (
                <>
                    {/* Controls Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search projects..."
                                className="pl-9 h-10 w-full bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border shrink-0 w-full sm:w-auto">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleToggleView('grid')}
                                className={viewMode === 'grid' ? "bg-background shadow-sm" : "text-muted-foreground"}
                            >
                                <LayoutGrid className="size-4 mr-2" /> Grid
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleToggleView('list')}
                                className={viewMode === 'list' ? "bg-background shadow-sm" : "text-muted-foreground"}
                            >
                                <ListIcon className="size-4 mr-2" /> List
                            </Button>
                        </div>
                    </div>

                    {/* Filter Empty State */}
                    {filteredProjects.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                            No projects match your search for "{searchQuery}".
                        </div>
                    )}

                    {/* List/Grid Views */}
                    {filteredProjects.length > 0 && (
                        <div>
                            {viewMode === 'grid' ? (
                                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
                                    {filteredProjects.map(project => (
                                        <ProjectCard 
                                            key={project._id || project.id} 
                                            project={project} 
                                            formatDate={timeAgo}
                                            onRename={handleRename}
                                            onDelete={handleDelete}
                                            onDuplicate={handleDuplicate}
                                            onSetGithubRepo={handleSetGithubRepo}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-md border bg-card overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50 border-b">
                                                <tr>
                                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground max-w-[250px]">Name</th>
                                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden sm:table-cell w-24">Status</th>
                                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden md:table-cell w-32">Last Edited</th>
                                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground w-[200px]">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredProjects.map(project => (
                                                    <ProjectRow 
                                                        key={project._id || project.id} 
                                                        project={project}
                                                        formatDate={timeAgo}
                                                        onRename={handleRename}
                                                        onDelete={handleDelete}
                                                        onDuplicate={handleDuplicate}
                                                        onSetGithubRepo={handleSetGithubRepo}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <NewProjectRemixDialog
                open={isNewModalOpen}
                onOpenChange={setIsNewModalOpen}
                onCreated={handleProjectCreated}
            />

        </div>
    );
}
