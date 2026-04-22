// ─── Project TypeScript Interfaces ──────────────────────────────────────────
// These types are shared across the editor and project service layers.

/**
 * The in-memory representation of a project after loading.
 * `projectData` is the raw GrapesJS project data object (pages, styles, etc.)
 */
export interface Project {
    _id: string; // From MongoDB
    id?: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectData: Record<string, any>;
    pages?: { id: string; name: string; html: string; css: string }[];
    createdAt: Date | null;
    updatedAt: Date | null;
    isPublished?: boolean;
    liveUrl?: string | null;
}

/**
 * Shape of the project document stored at:
 * users/{userId}/projects/{projectId}
 */
export interface FirestoreProjectDoc {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectData: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
