"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface User {
    _id: Id<"users">;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
    logout: () => void;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "vitaleevo_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loginMutation = useMutation(api.auth.login);
    const registerMutation = useMutation(api.auth.register);

    const dbUser = useQuery(api.auth.getById, user?._id ? { userId: user._id } : "skip");

    // Sync with database updates
    useEffect(() => {
        if (dbUser === null && user?._id && !isLoading) {
            // User exists locally but not found in DB (or invalid ID) -> Logout
            console.warn("User not found in DB or invalid ID. Logging out.");
            logout();
            return;
        }

        if (dbUser) {
            setUser(prev => {
                if (!prev) return dbUser as any;
                // Only update if something changed to avoid potential loops/renders
                if (JSON.stringify(prev) !== JSON.stringify(dbUser)) {
                    return { ...prev, ...dbUser };
                }
                return prev;
            });
        }
    }, [dbUser, user?._id, isLoading]);

    // Load user from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed);
            } catch (e) {
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    // Save user to localStorage when it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }, [user]);

    const login = async (email: string, password: string) => {
        setError(null);
        setIsLoading(true);
        try {
            const result = await loginMutation({ email, password });
            setUser({
                _id: result.userId as Id<"users">,
                email: result.email,
                name: result.name,
                role: result.role,
                avatarUrl: result.avatarUrl,
                phone: result.phone,
            });
        } catch (err: any) {
            const message = err.message || "Erro ao fazer login";
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
            await registerMutation({ email, password, name, phone });
            // Auto-login after registration
            await login(email, password);
        } catch (err: any) {
            const message = err.message || "Erro ao criar conta";
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
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
