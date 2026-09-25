'use client'

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi, type AuthUser } from "@/lib/api";
import { getToken, setTokens, clearTokens } from "./token";

interface AuthContextValue {
    user: AuthUser | null;
    ready: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    resendOtp: (email: string) => Promise<void>;
    refreshUser: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [ready, setReady] = useState(false);

    const loadUser = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setUser(null);
            return;
        }
        try {
            const me = await authApi.me(token);
            setUser(me);
        } catch {
            clearTokens();
            setUser(null);
        }
    }, []);

    useEffect(() => {
        loadUser().finally(() => setReady(true));
    }, [loadUser]);

    const login = useCallback(async (email: string, password: string) => {
        const tokens = await authApi.login(email, password);
        setTokens(tokens.accessToken, tokens.refreshToken);
        const me = await authApi.me(tokens.accessToken);
        setUser(me);
    }, []);

    const register = useCallback(
        async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
            await authApi.register(data);
        },
        [],
    );

    const verifyEmail = useCallback(async (email: string, code: string) => {
        await authApi.verifyEmail(email, code);
    }, []);

    const resendOtp = useCallback(async (email: string) => {
        await authApi.resendOtp(email);
    }, []);

    const logout = useCallback(() => {
        clearTokens();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                ready,
                isAuthenticated: !!user,
                login,
                register,
                verifyEmail,
                resendOtp,
                refreshUser: loadUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
