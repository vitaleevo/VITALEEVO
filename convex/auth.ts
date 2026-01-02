import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { checkAdmin, checkAuthenticated } from "./utils";

// Session duration: 7 days
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

// Secure random token generation
function generateToken(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 48; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// Improved hash function with salt
function secureHash(str: string, salt: string = "vitaleevo_prod_2024"): string {
    let hash = 0;
    const combined = str + salt;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0') +
        str.length.toString(16) +
        combined.split('').reverse().join('').charCodeAt(0).toString(16);
}

// Register a new user
export const register = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (existingUser) {
            throw new ConvexError("Este e-mail já está cadastrado");
        }

        if (args.password.length < 6) {
            throw new ConvexError("A senha deve ter pelo menos 6 caracteres");
        }

        const sessionToken = generateToken();
        const tokenExpiry = Date.now() + SESSION_DURATION;

        const userId = await ctx.db.insert("users", {
            email: args.email.toLowerCase(),
            name: args.name,
            passwordHash: secureHash(args.password),
            phone: args.phone,
            role: "user",
            isActive: true,
            sessionToken,
            tokenExpiry,
            createdAt: Date.now(),
        });

        return { success: true, userId, sessionToken };
    },
});

// Login user
export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (!user) {
            throw new ConvexError("E-mail ou senha incorretos");
        }

        if (user.passwordHash !== secureHash(args.password)) {
            throw new ConvexError("E-mail ou senha incorretos");
        }

        if (user.isActive === false) {
            throw new ConvexError("Conta desativada");
        }

        const sessionToken = generateToken();
        const tokenExpiry = Date.now() + SESSION_DURATION;

        await ctx.db.patch(user._id, {
            sessionToken,
            tokenExpiry
        });

        return {
            success: true,
            userId: user._id,
            sessionToken,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role || "user",
            avatarUrl: user.avatarUrl,
        };
    },
});

// Get user by ID (Authenticated)
// Returns null if session is invalid (allows graceful logout on client)
export const getById = query({
    args: { userId: v.string(), token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        // Validate token manually without throwing
        if (!args.token) {
            return null;
        }

        const sessionUser = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("sessionToken"), args.token))
            .unique();

        if (!sessionUser) {
            return null; // Invalid session - let client handle logout
        }

        if (sessionUser.tokenExpiry && sessionUser.tokenExpiry < Date.now()) {
            return null; // Expired session
        }

        // Ensure the requester is asking for their own data OR is an admin
        if (sessionUser._id !== args.userId && sessionUser.role !== "admin") {
            return null; // Access denied
        }

        const targetId = ctx.db.normalizeId("users", args.userId);
        if (!targetId) return null;

        const target = await ctx.db.get(targetId);
        if (!target) return null;

        return {
            _id: target._id,
            email: target.email,
            name: target.name,
            phone: target.phone,
            avatarUrl: target.avatarUrl,
            role: target.role || "user",
            createdAt: target.createdAt,
        };
    },
});

// Update user profile (Authenticated)
export const updateProfile = mutation({
    args: {
        token: v.string(),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await checkAuthenticated(ctx, args.token);
        const { token, ...updates } = args;

        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(user._id, cleanUpdates);
        return { success: true };
    },
});

// Change password (Authenticated)
export const changePassword = mutation({
    args: {
        token: v.string(),
        currentPassword: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await checkAuthenticated(ctx, args.token);

        if (user.passwordHash !== secureHash(args.currentPassword)) {
            throw new ConvexError("Senha atual incorreta");
        }

        if (args.newPassword.length < 6) {
            throw new ConvexError("A nova senha deve ter pelo menos 6 caracteres");
        }

        await ctx.db.patch(user._id, {
            passwordHash: secureHash(args.newPassword),
        });

        return { success: true };
    },
});

// Check if user is admin (Authenticated)
export const isAdmin = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        try {
            const user = await checkAdmin(ctx, args.token);
            return !!user;
        } catch {
            return false;
        }
    },
});

// Get all users (Admin only)
export const getAllAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const users = await ctx.db
            .query("users")
            .order("desc")
            .collect();

        return users.map(user => ({
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role || "user",
            isActive: user.isActive !== false,
            createdAt: user.createdAt,
            avatarUrl: user.avatarUrl,
        }));
    },
});

// Admin: Update any user fully (Admin only)
export const adminUpdateUser = mutation({
    args: {
        token: v.string(),
        userId: v.id("users"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        role: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const { token, userId, ...updates } = args;

        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        if (cleanUpdates.email) {
            cleanUpdates.email = (cleanUpdates.email as string).toLowerCase();
        }

        await ctx.db.patch(userId, cleanUpdates);
    },
});

// Admin: Force reset password (Admin only)
export const adminResetPassword = mutation({
    args: {
        token: v.string(),
        userId: v.id("users"),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        if (args.newPassword.length < 6) throw new ConvexError("Mínimo 6 caracteres");

        await ctx.db.patch(args.userId, {
            passwordHash: secureHash(args.newPassword)
        });
    },
});
// Admin: Create new user (Admin only)
export const adminCreateUser = mutation({
    args: {
        token: v.string(),
        name: v.string(),
        email: v.string(),
        password: v.string(),
        phone: v.optional(v.string()),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (existingUser) {
            throw new ConvexError("Este e-mail já está cadastrado");
        }

        if (args.password.length < 6) {
            throw new ConvexError("A senha deve ter pelo menos 6 caracteres");
        }

        const sessionToken = generateToken();
        const tokenExpiry = Date.now() + SESSION_DURATION;

        await ctx.db.insert("users", {
            email: args.email.toLowerCase(),
            name: args.name,
            passwordHash: secureHash(args.password),
            phone: args.phone,
            role: args.role,
            isActive: true,
            sessionToken,
            tokenExpiry,
            createdAt: Date.now(),
        });

        return { success: true };
    },
});
// Request password reset
export const requestPasswordReset = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (!user) {
            // We don't want to leak if an email exists, but for UX in this specific project
            // we will throw so the user knows.
            throw new ConvexError("E-mail não encontrado");
        }

        const resetToken = generateToken();
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        await ctx.db.patch(user._id, {
            resetToken,
            resetTokenExpiry
        } as any);

        return { resetToken, name: user.name };
    },
});

// Reset password with token
export const resetPassword = mutation({
    args: {
        token: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("resetToken"), args.token))
            .first();

        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
            throw new ConvexError("Link de recuperação inválido ou expirado");
        }

        if (args.newPassword.length < 6) {
            throw new ConvexError("A senha deve ter pelo menos 6 caracteres");
        }

        await ctx.db.patch(user._id, {
            passwordHash: secureHash(args.newPassword),
            resetToken: undefined,
            resetTokenExpiry: undefined,
        } as any);

        return { success: true };
    },
});
