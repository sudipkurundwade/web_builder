// Trigger HMR to resolve the "Failed to fetch dynamically imported module" error.
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import ProtectedRoute from '@/components/router/ProtectedRoute';
import AdminRoute from '@/components/router/AdminRoute';
import { PageLoader } from '@/components/ui/progress';

// ─── Layouts (not lazy — tiny, needed immediately) ───────────────────────────
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// ─── Lazy Pages ───────────────────────────────────────────────────────────────
// Each page is code-split into its own chunk, loaded only when navigated to.
const Home = lazy(() => import('@/pages/Home'));
const Landing = lazy(() => import('@/pages/Landing'));

const About = lazy(() => import('@/pages/About'));
const Login = lazy(() => import('@/pages/Login'));
const EmailVerification = lazy(() => import('@/pages/EmailVerification'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));
const AnalyticsDashboard = lazy(() => import('@/pages/AnalyticsDashboard'));
const Projects = lazy(() => import('@/pages/Projects'));
const CommunityTemplates = lazy(() => import('@/pages/CommunityTemplates'));
const TemplateDetail = lazy(() => import('@/pages/TemplateDetail'));
const Collections = lazy(() => import('@/pages/Collections'));
const DashboardSettings = lazy(() => import('@/pages/DashboardSettings'));
const Profile = lazy(() => import('@/pages/Profile'));
const PublicProfile = lazy(() => import('@/pages/PublicProfile'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const EditorPage = lazy(() => import('@/pages/EditorPage'));

// ─── Route Configuration ─────────────────────────────────────────────────────

/**
 * App is the single source of truth for all routes.
 *
 * Tree:
 *   /                   → MainLayout     → Home
 *   /about              → MainLayout     → About
 *   /login              → AuthLayout     → Login
 *   /dashboard          → ProtectedRoute → DashboardLayout → Dashboard
 *   /dashboard/settings → ProtectedRoute → DashboardLayout → DashboardSettings
 *   *                   → NotFound
 */
const App: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Public routes (with sidebar) ─────────────────────────────── */}
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
        </Route>

        {/* ── Landing page (full screen, no layout) ─────────────────────────── */}
        <Route path={ROUTES.LANDING} element={<Landing />} />

        {/* ── Auth routes (no sidebar, centered card) ───────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<EmailVerification />} />
        </Route>

        {/* ── Protected routes ──────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.PROJECTS} element={<Projects />} />
            <Route path={ROUTES.COMMUNITY_TEMPLATES} element={<CommunityTemplates />} />
            <Route path={ROUTES.TEMPLATE_DETAIL} element={<TemplateDetail />} />
            <Route path={ROUTES.COLLECTIONS} element={<Collections />} />
            <Route path={ROUTES.DASHBOARD_SETTINGS} element={<DashboardSettings />} />
            <Route path={ROUTES.PROFILE} element={<Profile />} />
            <Route path={ROUTES.USER_PROFILE} element={<PublicProfile />} />
          </Route>
          {/* Editor renders without dashboard layout (no sidebar/header) */}
          <Route path={ROUTES.EDITOR} element={<EditorPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.ADMIN} element={<AdminPanel />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsDashboard />} />
          </Route>
        </Route>

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />

      </Routes>
    </Suspense>
  );
};

export default App;
