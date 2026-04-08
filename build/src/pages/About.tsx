import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

/**
 * About page — public route (/about).
 * AppSidebar is rendered by MainLayout; no need to import it here.
 */
const About: React.FC = () => {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">About</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    This is the public About page. Build your content here.
                </p>
            </div>
            <Link
                to={ROUTES.HOME}
                className="text-sm text-primary underline-offset-4 hover:underline w-fit"
            >
                ← Back to Home
            </Link>
        </div>
    );
};

export default About;
