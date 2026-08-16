import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requirePermission } from "./utils";

// Public queries
export const getByType = query({
    args: { type: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("categories")
            .withIndex("by_type", (q) => q.eq("type", args.type))
            .filter((q) => q.eq(q.field("isActive"), true))
            .order("asc")
            .collect();
    },
});

// Admin-only operations
export const getAllAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "catalog:manage");
        return await ctx.db.query("categories").order("asc").collect();
    },
});

export const create = mutation({
    args: {
        token: v.string(),
        name: v.string(),
        slug: v.string(),
        type: v.string(), // 'store', 'blog', 'portfolio'
        description: v.optional(v.string()),
        order: v.number(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "catalog:manage");
        const { token, ...data } = args;
        return await ctx.db.insert("categories", data);
    },
});

export const update = mutation({
    args: {
        token: v.string(),
        id: v.id("categories"),
        name: v.optional(v.string()),
        slug: v.optional(v.string()),
        type: v.optional(v.string()),
        description: v.optional(v.string()),
        order: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "catalog:manage");
        const { id, token, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const remove = mutation({
    args: { token: v.string(), id: v.id("categories") },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "catalog:manage");
        await ctx.db.delete(args.id);
    },
});
