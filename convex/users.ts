import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./utils";

// Get user by email
export const getByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();
        return user;
    },
});

// Get user by ID
export const getById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
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

        // Filter out undefined values
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
        );

        if (Object.keys(cleanUpdates).length > 0) {
            await ctx.db.patch(userId, cleanUpdates);
        }

        return { success: true };
    },
});

// Get all users (admin only)
export const getAllAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const users = await ctx.db
            .query("users")
            .order("desc")
            .collect();

        // Don't return password hashes
        return users.map(user => ({
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            role: user.role || "user",
            isActive: user.isActive !== false,
            createdAt: user.createdAt,
        }));
    },
});

// Update user role (admin only)
export const updateRole = mutation({
    args: {
        token: v.string(),
        userId: v.id("users"),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        await ctx.db.patch(args.userId, { role: args.role });
        return { success: true };
    },
});

// Toggle user active status (admin only)
export const toggleActive = mutation({
    args: {
        token: v.string(),
        userId: v.id("users"),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        await ctx.db.patch(args.userId, { isActive: args.isActive });
        return { success: true };
    },
});
