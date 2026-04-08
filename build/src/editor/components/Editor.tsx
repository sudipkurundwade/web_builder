/**
 * Main editor shell: top bar + left blocks + canvas + right styles.
 * GrapesEditorProvider wraps the tree so Canvas and all panels share one editor ref.
 */

import { useEffect, useRef } from "react";
import type { Editor as GrapesEditorInstance } from "grapesjs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { GrapesEditorProvider, useGrapesEditor } from "@/editor/context/EditorContext";
import { Canvas } from "@/editor/components/Canvas";
import { TopToolbar } from "@/editor/components/TopToolbar";
import { Sidebar } from "@/editor/components/Sidebar";
import { RightSidebar } from "@/editor/components/RightSidebar";
import { EditorEventsBridge } from "@/editor/components/EditorEventsBridge";
import { loadProject } from "@/services/projectService";

export interface EditorProps {
    projectId: string;
    userId: string;
    projectName: string;
    onProjectNameChange: (name: string) => void;
    /** Optional persistence after Save logs (e.g. mock Firestore) */
    onPersist?: (payload: {
        html: string;
        css: string;
        projectData: Record<string, unknown>;
    }) => Promise<void>;
    isSaving?: boolean;
    isLoadingProject?: boolean;
    loadError?: string | null;
    /** Fires once project fetch + optional loadProjectData finishes */
    onProjectLoadComplete?: () => void;
    onLoadError?: (message: string) => void;
}

export function Editor(props: EditorProps) {
    return (
        <GrapesEditorProvider>
            <EditorLayout {...props} />
        </GrapesEditorProvider>
    );
}

function EditorLayout({
    projectId,
    userId,
    projectName,
    onProjectNameChange,
    onPersist,
    isSaving,
    isLoadingProject,
    loadError,
    onProjectLoadComplete,
    onLoadError,
}: EditorProps) {
    const loadedKey = useRef<string | null>(null);
    const { isPreview } = useGrapesEditor();

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
            <EditorEventsBridge />
            <ProjectHydration
                projectId={projectId}
                userId={userId}
                onProjectNameChange={onProjectNameChange}
                loadedKeyRef={loadedKey}
                onProjectLoadComplete={onProjectLoadComplete}
                onLoadError={onLoadError}
            />

            <TopToolbar
                projectId={projectId}
                projectName={projectName}
                onProjectNameChange={onProjectNameChange}
                onPersist={onPersist}
                isSaving={isSaving}
                disabled={!!isLoadingProject}
            />

            {loadError && (
                <Alert variant="destructive" className="rounded-none border-x-0 border-t-0 py-2">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{loadError}</AlertDescription>
                </Alert>
            )}

            <div className="relative flex min-h-0 flex-1">
                {isLoadingProject && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm">
                        <Skeleton className="h-10 w-40 rounded-lg" />
                        <Skeleton className="h-2 w-48 rounded-full" />
                        <Skeleton className="h-2 w-32 rounded-full" />
                        <p className="text-xs text-muted-foreground">Loading project…</p>
                    </div>
                )}

                {!isPreview && <Sidebar />}
                <Canvas />
                {!isPreview && <RightSidebar />}
            </div>
        </div>
    );
}

function ProjectHydration({
    projectId,
    userId,
    onProjectNameChange,
    loadedKeyRef,
    onProjectLoadComplete,
    onLoadError,
}: {
    projectId: string;
    userId: string;
    onProjectNameChange: (name: string) => void;
    loadedKeyRef: React.MutableRefObject<string | null>;
    onProjectLoadComplete?: () => void;
    onLoadError?: (message: string) => void;
}) {
    const { editor, isReady } = useGrapesEditor();

    useEffect(() => {
        loadedKeyRef.current = null;
    }, [projectId, loadedKeyRef]);

    useEffect(() => {
        if (!isReady || !editor) return;
        const key = `${userId}:${projectId}`;
        if (loadedKeyRef.current === key) return;

        let cancelled = false;
        (async () => {
            try {
                const project = await loadProject(userId, projectId);
                if (cancelled || !editor) return;
                
                if (project) {
                    const data = project.projectData;
                    if (data && typeof data === "object" && Object.keys(data).length > 0) {
                        editor.loadProjectData(
                            data as Parameters<GrapesEditorInstance["loadProjectData"]>[0],
                        );
                    }
                    onProjectNameChange(project.name || "Project");
                } else {
                    // Start with default project name
                    onProjectNameChange("Project");

                    // Ensure the initial default page is named "Page 1"
                    const pages = editor.Pages.getAll();
                    if (pages.length === 1) {
                        const firstPage = pages[0];
                        if (!firstPage.get("name")) {
                            firstPage.set("name", "Page 1");
                        }
                    }
                }
            } catch (e) {
                console.error("[Editor] loadProject failed", e);
                onLoadError?.("Failed to load project. Please try again.");
            } finally {
                if (!cancelled) {
                    loadedKeyRef.current = key;
                    onProjectLoadComplete?.();
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        isReady,
        editor,
        userId,
        projectId,
        onProjectNameChange,
        loadedKeyRef,
        onProjectLoadComplete,
        onLoadError,
    ]);

    return null;
}
