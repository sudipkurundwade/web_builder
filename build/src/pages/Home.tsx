import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

/**
 * Home page — public route (/).
 * AppSidebar is rendered by MainLayout; no need to import it here.
 */
const Home: React.FC = () => {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Home</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Welcome! This is the public home page.
                </p>
            </div>
            <div className="flex gap-3">
                <Link
                    to={ROUTES.ABOUT}
                    className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                    About
                </Link>
                <Link
                    to={ROUTES.DASHBOARD}
                    className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                >
                    Go to Dashboard →
                </Link>
            </div>
        </div>
    );
};

export default Home;
