import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Simple hash function (for demo - in production use bcrypt on server)
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    // Add salt and additional complexity
    const salt = "vitaleevo_2024_secure";
    let finalHash = hash.toString(16);
    for (let i = 0; i < salt.length; i++) {
        finalHash += (hash + salt.charCodeAt(i)).toString(16);
    }
    return finalHash;
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
        // Check if email already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (existingUser) {
            throw new Error("Este e-mail já está cadastrado");
        }

        // Validate password
        if (args.password.length < 6) {
            throw new Error("A senha deve ter pelo menos 6 caracteres");
        }

        // Create user
        const userId = await ctx.db.insert("users", {
            email: args.email.toLowerCase(),
            name: args.name,
            passwordHash: simpleHash(args.password),
            phone: args.phone,
            role: "user",
            isActive: true,
            createdAt: Date.now(),
        });

        return { userId, success: true };
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
            throw new Error("E-mail ou senha incorretos");
        }

        if (user.passwordHash !== simpleHash(args.password)) {
            throw new Error("E-mail ou senha incorretos");
        }

        if (user.isActive === false) {
            throw new Error("Conta desativada");
        }

        return {
            userId: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role || "user",
            avatarUrl: user.avatarUrl,
        };
    },
});

// Get user by ID
export const getById = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const normalizedId = ctx.db.normalizeId("users", args.userId);
        if (!normalizedId) return null;

        const user = await ctx.db.get(normalizedId);
        if (!user) return null;

        // Don't return password hash
        return {
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            role: user.role || "user",
            createdAt: user.createdAt,
        };
    },
});

// Update user profile
export const updateProfile = mutation({
    args: {
        userId: v.id("users"),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { userId, ...updates } = args;

        // Remove undefined values
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(userId, cleanUpdates);
        return { success: true };
    },
});

// Change password
export const changePassword = mutation({
    args: {
        userId: v.id("users"),
        currentPassword: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        if (user.passwordHash !== simpleHash(args.currentPassword)) {
            throw new Error("Senha atual incorreta");
        }

        if (args.newPassword.length < 6) {
            throw new Error("A nova senha deve ter pelo menos 6 caracteres");
        }

        await ctx.db.patch(args.userId, {
            passwordHash: simpleHash(args.newPassword),
        });

        return { success: true };
    },
});

// Check if user is admin
export const isAdmin = query({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        if (!args.userId) return false;

        const user = await ctx.db.get(args.userId);
        return user?.role === "admin";
    },
});

// Get all users (admin only)
export const getAllAdmin = query({
    args: {},
    handler: async (ctx) => {
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

// Admin: Create a new user manually
export const adminCreateUser = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.string(),
        phone: v.optional(v.string()),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (existing) throw new Error("E-mail já cadastrado");

        return await ctx.db.insert("users", {
            email: args.email.toLowerCase(),
            name: args.name,
            passwordHash: simpleHash(args.password),
            phone: args.phone,
            role: args.role,
            isActive: true,
            createdAt: Date.now(),
        });
    },
});

// Admin: Update any user fully
export const adminUpdateUser = mutation({
    args: {
        userId: v.id("users"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        role: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { userId, ...updates } = args;
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        if (cleanUpdates.email) {
            cleanUpdates.email = (cleanUpdates.email as string).toLowerCase();
        }

        await ctx.db.patch(userId, cleanUpdates);
    },
});

// Admin: Force reset password
export const adminResetPassword = mutation({
    args: {
        userId: v.id("users"),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.newPassword.length < 6) throw new Error("Mínimo 6 caracteres");
        await ctx.db.patch(args.userId, {
            passwordHash: simpleHash(args.newPassword)
        });
    },
});

// Update user role (admin only)
export const updateRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { role: args.role });
        return { success: true };
    },
});
