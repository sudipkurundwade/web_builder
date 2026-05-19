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
    ADMIN: '/admin',
    ANALYTICS: '/analytics',
    PROJECTS: '/projects',
    COMMUNITY_TEMPLATES: '/templates',
    TEMPLATE_DETAIL: '/templates/:templateId',
    COLLECTIONS: '/collections',
    DASHBOARD_SETTINGS: '/dashboard/settings',
    PROFILE: '/profile',
    USER_PROFILE: '/users/:userId',

    // Verification
    VERIFY_EMAIL: '/verify-email',

    // Fallback
    NOT_FOUND: '*',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
