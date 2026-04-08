import React, { useState } from 'react';
import { LoginForm } from '@/components/login-form';
import { SignupForm } from '@/components/signup-form';

/**
 * Auth page containing login and signup flows using Shadcn UI forms.
 */
const Login: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-0 m-0 bg-background">
            <div className="w-full h-full max-w-5xl">
                {isSignUp ? (
                    <SignupForm onSignInClick={() => setIsSignUp(false)} />
                ) : (
                    <LoginForm onSignUpClick={() => setIsSignUp(true)} />
                )}
            </div>
        </div>
    );
};

export default Login;
