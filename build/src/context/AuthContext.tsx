// src/context/AuthContext.tsx
// Replaces Firebase mock with real JWT-based backend authentication.

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import type { AuthContextType, AuthUser } from '@/types/auth.types';
import {
    loginUser,
    signupUser,
    getCurrentUser,
    logoutUser,
} from '@/services/authService';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an <AuthProvider>');
    }
    return context;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on app boot — validate token with backend
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        restoreSession();
    }, []);

    /**
     * Login with email + password.
     * Stores JWT in localStorage via authService.
     */
    const login = useCallback(async (email: string, password: string) => {
        const user = await loginUser({ email, password });
        setUser(user);
    }, []);

    /**
     * Signup with name + email + password.
     * Does NOT log the user in — they must navigate to /login after.
     */
    const signup = useCallback(async (name: string, email: string, password: string) => {
        await signupUser({ name, email, password });
        // No auto-login — user is redirected to login page
    }, []);

    /**
     * Google login — not supported without Firebase.
     * Shows a friendly error instead of crashing.
     */
    const loginWithGoogle = useCallback(async () => {
        throw new Error('Google sign-in is not available. Please use email and password.');
    }, []);

    /**
     * Logout — clears token from localStorage and resets user state.
     */
    const logout = useCallback(() => {
        logoutUser();
        setUser(null);
    }, []);

    const value: AuthContextType = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
    }), [user, isLoading, login, signup, loginWithGoogle, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
