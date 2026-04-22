import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Displayed after a user signs up. Prompts them to verify their email.
 */
const EmailVerification: React.FC = () => {
    const location = useLocation();
    const email = (location.state as { email?: string })?.email;

    // If a user navigates here directly without state, send them to login.
    if (!email) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
            <Card className="w-full max-w-md mx-auto relative overflow-hidden text-center shadow-lg">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Check your email
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-2">
                        We have sent you a verification email to <span className="font-medium text-foreground">{email}</span>. Please verify it and log in.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-8 space-y-4">
                    <Link to={ROUTES.LOGIN} className="w-full sm:w-auto inline-block">
                        <Button className="w-full sm:w-auto px-8">
                            Log in
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmailVerification;
