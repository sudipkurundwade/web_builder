// src/services/projectService.ts
// Real backend API calls replacing the in-memory mock.
// Endpoints: POST/GET /api/projects   PUT/GET /api/projects/:projectId

import api from "@/lib/api";
import type { Project } from "@/types/project";

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates a new project in MongoDB.
 * The owner is resolved from the JWT token on the backend.
 */
export async function createProject(
    name: string = "New Project"
): Promise<Project> {
    const response = await api.post<{ data: Project }>("/projects", { name });
    return response.data.data;
}

// ─── Save ─────────────────────────────────────────────────────────────────────

/**
 * Saves a GrapesJS project to MongoDB.
 */
export async function saveProject(
    _userId: string,
    projectId: string,
    projectData: Record<string, unknown>,
    name: string,
    html?: string,
    css?: string,
    pages?: { id: string, name: string, html: string, css: string }[]
): Promise<void> {
    await api.put(`/projects/${projectId}`, { projectData, name, html, css, pages });
}

// ─── Load ─────────────────────────────────────────────────────────────────────

/**
 * Loads a project by ID. Returns null if not found.
 */
export async function loadProject(
    _userId: string,
    projectId: string
): Promise<Project | null> {
    try {
        const response = await api.get<{ data: Project }>(`/projects/${projectId}`);
        return response.data.data;
    } catch (err: any) {
        if (err?.response?.status === 404) return null;
        throw err;
    }
}

// ─── Publish ───────────────────────────────────────────────────────────────────

/**
 * Publishes a project and returns the live URL string.
 */
export async function publishProject(projectId: string): Promise<string> {
    const response = await api.put<{ data: { liveUrl: string } }>(`/projects/${projectId}/publish`);
    return response.data.data.liveUrl;
}

// ─── Project Management ───────────────────────────────────────────────────────

/**
 * Fetches all projects for the logged-in user.
 */
export async function getUserProjects(): Promise<Project[]> {
    const response = await api.get<{ data: Project[] }>("/projects");
    return response.data.data;
}

/**
 * Renames a project using a partial update.
 */
export async function renameProject(projectId: string, newName: string): Promise<void> {
    await api.put(`/projects/${projectId}`, { name: newName });
}

/**
 * Deletes a project.
 */
export async function deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`);
}

/**
 * Duplicates a project, returning the new newly created project.
 */
export async function duplicateProject(projectId: string): Promise<Project> {
    const response = await api.post<{ data: Project }>(`/projects/${projectId}/duplicate`);
    return response.data.data;
}
