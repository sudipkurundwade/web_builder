import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/app_sidebar';

/**
 * MainLayout — used by public pages (/, /about).
 * Renders AppSidebar as a shell; page content flows into <Outlet />.
 *
 * NOTE: AppSidebar already renders the full SidebarProvider + SidebarInset
 * wrapper itself. We render <Outlet /> as the content slot *inside* the
 * SidebarInset by passing it as children to AppSidebar.
 */
const MainLayout: React.FC = () => {
    return (
        <AppSidebar>
            <Outlet />
        </AppSidebar>
    );
};

export default MainLayout;
