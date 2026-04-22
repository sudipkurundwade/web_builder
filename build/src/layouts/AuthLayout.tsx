import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * AuthLayout — minimal layout for /login and /signup.
 * No sidebar, centered card style.
 */
const AuthLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <div className="w-full max-w-md">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
