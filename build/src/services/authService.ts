// src/services/authService.ts
// Handles all auth API calls to the backend

import api from "@/lib/api";
import type { AuthUser } from "@/types/auth.types";

export interface SignupPayload {
    name: string;
    email: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

/**
 * Register a new user
 * POST /api/auth/signup
 */
export async function signupUser(payload: SignupPayload): Promise<void> {
    await api.post("/auth/signup", payload);
}

/**
 * Login with email/password — stores token in localStorage
 * POST /api/auth/login
 */
export async function loginUser(payload: LoginPayload): Promise<AuthUser> {
    const response = await api.post<{ data: AuthResponse; message: string }>("/auth/login", payload);
    const { token, user } = response.data.data;

    // Persist token and user for session restoration
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
}

/**
 * Get currently logged-in user from the backend (validates token)
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const response = await api.get<{ data: AuthUser }>("/auth/me");
        return response.data.data;
    } catch {
        return null;
    }
}

/**
 * Logout — clears localStorage
 */
export function logoutUser(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}
