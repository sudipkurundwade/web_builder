import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import FilesSection from '@/components/dashboard/FilesSection';
import NotesSection from '@/components/dashboard/NotesSection';
import TeamMembersSection from '@/components/dashboard/TeamMembersSection';

/**
 * Dashboard page — protected route.
 */
const Dashboard: React.FC = () => {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your files, notes, and team members.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FilesSection />
                <NotesSection />
                <TeamMembersSection />
            </div>

            <div className="rounded-xl border bg-muted/40 p-6 text-sm text-muted-foreground mt-8">
                Navigate to{' '}
                <Link
                    to={ROUTES.DASHBOARD_SETTINGS}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                >
                    Dashboard → Settings
                </Link>{' '}
                to test nested routing.
            </div>
        </div>
    );
};

export default Dashboard;
