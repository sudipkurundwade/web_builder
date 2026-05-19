import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/progress';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';

const AdminRoute: React.FC = () => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
    }

    if (user?.role !== 'admin') {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <Card className="max-w-md rounded-lg">
                    <CardHeader>
                        <CardTitle>Admin access required</CardTitle>
                        <CardDescription>
                            Your account is authenticated, but it does not have permission to open this admin area.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Ask an existing admin to grant your account the admin role, then sign in again.
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <Outlet />;
};

export default AdminRoute;
