/**
 * Route shell for /editor/:projectId — auth guard, project name state, and mock persistence.
 * The actual GrapesJS + shadcn UI lives in @/editor/components/Editor.
 */

import React, { useCallback, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Editor } from "@/editor/components/Editor";
import { saveProject, createProject } from "@/services/projectService";
import { useAuth } from "@/context/AuthContext";

const EditorPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { user, isLoading } = useAuth();

    const [projectName, setProjectName] = useState("Project");
    const [isLoadingProject, setIsLoadingProject] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const onProjectLoadComplete = useCallback(() => {
        setIsLoadingProject(false);
    }, []);

    // Intercept "my-project" shortcut to create a new real project
    React.useEffect(() => {
        if (!user || !projectId || projectId !== "my-project") return;
        
        let mounted = true;
        createProject("New Website").then((newProj) => {
            // Re-route to the newly created project's real ObjectId
            if (mounted) window.location.replace(`/editor/${newProj._id}`);
        }).catch((err) => {
            console.error("Failed to auto-create project", err);
            if (mounted) setLoadError("Could not create a new project. Please try again.");
        });

        return () => { mounted = false };
    }, [projectId, user]);

    const onPersist = useCallback(
        async (payload: {
            html: string;
            css: string;
            projectData: Record<string, unknown>;
            pages?: { id: string; name: string; html: string; css: string }[];
        }) => {
            if (!projectId || !user) return;
            setIsSaving(true);
            try {
                await saveProject(
                    user.id,
                    projectId,
                    payload.projectData as Record<string, unknown>,
                    projectName,
                    payload.html,
                    payload.css,
                    payload.pages
                );
            } finally {
                setIsSaving(false);
            }
        },
        [projectId, user, projectName],
    );

    if (isLoading) return <Navigate to="/login" replace />;
    if (!user) return <Navigate to="/login" replace />;
    if (!projectId) return <Navigate to="/" replace />;

    // Stop rendering the Editor shell if we're currently redirecting from 'my-project'
    if (projectId === "my-project") {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <p className="text-sm text-muted-foreground animate-pulse">Initializing new project...</p>
            </div>
        );
    }

    return (
        <div className="h-dvh w-full overflow-hidden">
            <Editor
                projectId={projectId}
                userId={user.id}
                projectName={projectName}
                onProjectNameChange={setProjectName}
                onPersist={onPersist}
                isSaving={isSaving}
                isLoadingProject={isLoadingProject}
                loadError={loadError}
                onProjectLoadComplete={onProjectLoadComplete}
                onLoadError={setLoadError}
            />
        </div>
    );
};

export default EditorPage;
