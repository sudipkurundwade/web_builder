// src/types/auth.types.ts

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    plan?: string;
    photoURL?: string;
    bio?: string;
    avatarUrl?: string;
    location?: string;
    socialLinks?: {
        github?: string;
        linkedin?: string;
        website?: string;
    };
    role?: 'admin' | 'user';
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => void;
}
