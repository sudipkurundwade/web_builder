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
    pages?: ProjectPage[];
    createdAt: Date | null;
    updatedAt: Date | null;
    isPublished?: boolean;
    liveUrl?: string | null;
    githubRepo?: string | null; // Format: "username/repo" e.g. "vercel/next.js"
    html?: string;
    css?: string;
    remixSettings?: RemixSettings | null;
}

export interface ProjectPage {
    id: string;
    name: string;
    html: string;
    css: string;
    slug?: string;
    title?: string;
    description?: string;
    faviconUrl?: string;
    ogImageUrl?: string;
}

export interface RemixSettings {
    businessType: string;
    tone: string;
    palette: string;
    sections: string[];
    selectedBlocks?: { section: string; blockId?: string; label: string }[];
    createdAt?: string;
}

export interface CreateRemixProjectInput {
    name: string;
    businessType: string;
    tone: string;
    palette: string;
    sections: string[];
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
