import React, { useState } from 'react';
import { LoginForm } from '@/components/login-form';
import { SignupForm } from '@/components/signup-form';

/**
 * Auth page containing login and signup flows using Shadcn UI forms.
 */
const Login: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <>
            {isSignUp ? (
                <SignupForm onSignInClick={() => setIsSignUp(false)} />
            ) : (
                <LoginForm onSignUpClick={() => setIsSignUp(true)} />
            )}
        </>
    );
};

export default Login;
