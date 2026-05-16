// ─── Route Constants ────────────────────────────────────────────────────────────
// Centralizing all route paths prevents typos and makes refactoring easy.

export const ROUTES = {
    HOME: '/',
    ABOUT: '/about',
    LOGIN: '/login',
    SIGNUP: '/signup',
    LANDING: '/landing',

    // Editor (full-screen, standalone)
    EDITOR: '/editor/:projectId',

    // Protected
    DASHBOARD: '/dashboard',
    PROJECTS: '/projects',
    COMMUNITY_TEMPLATES: '/templates',
    DASHBOARD_SETTINGS: '/dashboard/settings',
    PROFILE: '/profile',

    // Verification
    VERIFY_EMAIL: '/verify-email',

    // Fallback
    NOT_FOUND: '*',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
