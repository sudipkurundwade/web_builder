import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/app_sidebar';

/**
 * DashboardLayout — used by all protected pages (/dashboard, /dashboard/settings, …).
 * Renders AppSidebar as a shell; nested page content flows into <Outlet />.
 */
const DashboardLayout: React.FC = () => {
    return (
        <AppSidebar>
            <Outlet />
        </AppSidebar>
    );
};

export default DashboardLayout;
