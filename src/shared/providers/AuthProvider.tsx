"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
    api,
    AUTH_STORAGE_KEY,
    AUTH_UPDATED_EVENT,
    clearStoredAuth,
    getStoredAuth,
    setStoredAuth,
    type StoredAuth,
} from "../utils/apiClient";
import { getErrorMessage } from "../utils/error-handler";

interface User {
    _id: string; // id do Django (UUID)
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role: string;
    token: string; // JWT access
    refreshToken?: string;
    avatarUrl?: string;
    phone?: string;
    isStaff?: boolean;
    permissions?: string[];
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
    logout: () => void;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Restaurar sessão do storage e validar via /auth/me/
    useEffect(() => {
        const stored = getStoredAuth();
        if (!stored) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setIsLoading(false);
            return;
        }
        api.auth
            .me(stored.token)
            .then(profile => {
                const currentAuth = getStoredAuth() ?? stored;
                setUser({
                    _id: profile.id as string,
                    email: profile.email as string,
                    name: `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || (profile.email as string),
                    firstName: profile.firstName as string | undefined,
                    lastName: profile.lastName as string | undefined,
                    role: profile.role as string,
                    token: currentAuth.token,
                    refreshToken: currentAuth.refreshToken,
                    phone: (profile.phone as string | undefined) ?? "",
                    isStaff: Boolean(profile.isStaff),
                    permissions: profile.permissions as string[] | undefined,
                    createdAt: (profile.createdAt as string | undefined) ?? (profile.created_at as string | undefined),
                });
            })
            .catch(() => {
                clearStoredAuth();
                setUser(null);
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        const handleAuthUpdated = (event: Event) => {
            const auth = (event as CustomEvent<StoredAuth | null>).detail;
            if (!auth) {
                setUser(null);
                return;
            }
            setUser(current => current ? {
                ...current,
                token: auth.token,
                refreshToken: auth.refreshToken,
            } : current);
        };
        window.addEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);
        return () => window.removeEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);
    }, []);

    // Persistência da sessão (tab atual) + sync cookie para preview staff (?preview=true via cookies)
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (user?.token) {
            const payload = JSON.stringify({ token: user.token, refreshToken: user.refreshToken });
            sessionStorage.setItem(AUTH_STORAGE_KEY, payload);
            try {
                document.cookie = `${AUTH_STORAGE_KEY}=${encodeURIComponent(payload)}; path=/; max-age=604800; SameSite=Lax`;
                document.cookie = `token=${encodeURIComponent(user.token)}; path=/; max-age=604800; SameSite=Lax`;
            } catch {}
        } else {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
            try {
                document.cookie = `${AUTH_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
                document.cookie = `token=; path=/; max-age=0; SameSite=Lax`;
            } catch {}
        }
    }, [user?.token, user?.refreshToken]);

    const login = async (email: string, password: string) => {
        setError(null);
        setIsLoading(true);
        try {
            const { access, refresh } = await api.auth.login(email, password);
            const profile = await api.auth.me(access);
            setStoredAuth({ token: access, refreshToken: refresh });
            const userData: User = {
                _id: profile.id as string,
                email: profile.email as string,
                name: `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || (profile.email as string),
                firstName: profile.firstName as string | undefined,
                lastName: profile.lastName as string | undefined,
                role: profile.role as string,
                token: access,
                refreshToken: refresh,
                phone: (profile.phone as string | undefined) ?? "",
                isStaff: Boolean(profile.isStaff),
                permissions: profile.permissions as string[] | undefined,
                createdAt: (profile.createdAt as string | undefined) ?? (profile.created_at as string | undefined),
            };
            setUser(userData);
            return userData;
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, name: string, phone?: string) => {
        setError(null);
        setIsLoading(true);
        try {
            const [firstName = "", lastName = ""] = name.split(" ").filter(Boolean);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100"}/api/v1/auth/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName.slice(0, 80) || "", phone: phone ?? "" }),
            });
            const data = await res.json();
            if (!res.ok) {
                const first = Array.isArray(data.email) ? data.email[0] : data.detail;
                throw new Error(typeof first === "string" ? first : "Registo falhou");
            }
            await login(email, password);
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        const refreshToken = user?.refreshToken ?? getStoredAuth()?.refreshToken;
        if (refreshToken) {
            void api.auth.logout(refreshToken).catch(() => undefined);
        }
        setUser(null);
        clearStoredAuth();
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                token: user?.token || null,
                isLoading,
                isAuthenticated: !!user,
                isAdmin: user?.role === "admin",
                login,
                register,
                logout,
                error,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
