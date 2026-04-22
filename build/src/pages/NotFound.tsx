import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

/**
 * NotFound — rendered for all unmatched routes (*).
 */
const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
            <div className="space-y-2">
                <h1 className="text-8xl font-extrabold tracking-tighter text-muted-foreground/30">
                    404
                </h1>
                <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                    The page you're looking for doesn't exist or may have been moved.
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-md border px-5 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
                >
                    Go back
                </button>
                <Link
                    to={ROUTES.HOME}
                    className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                    Go home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
