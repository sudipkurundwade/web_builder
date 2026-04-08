import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

/**
 * DashboardSettings page — nested protected route stub (/dashboard/settings).
 * Replace the content below with your real settings UI.
 */
const DashboardSettings: React.FC = () => {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Nested protected route — /dashboard/settings. Build your settings UI here.
                </p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                <h2 className="text-base font-semibold">General</h2>
                <div className="grid gap-3 text-sm text-muted-foreground">
                    {['Profile', 'Notifications', 'Billing', 'Security'].map((section) => (
                        <div key={section} className="flex items-center justify-between rounded-lg border px-4 py-3">
                            <span className="font-medium text-foreground">{section}</span>
                            <span className="text-xs">Coming soon</span>
                        </div>
                    ))}
                </div>
            </div>

            <Link
                to={ROUTES.DASHBOARD}
                className="text-sm text-primary underline-offset-4 hover:underline w-fit"
            >
                ← Back to Dashboard
            </Link>
        </div>
    );
};

export default DashboardSettings;
