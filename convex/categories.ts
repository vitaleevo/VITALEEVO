import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all categories by type
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

// Get all categories for admin (includes inactive)
export const getAllAdmin = query({
    args: { type: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (args.type) {
            return await ctx.db
                .query("categories")
                .withIndex("by_type", (q) => q.eq("type", args.type!))
                .collect();
        }
        return await ctx.db.query("categories").collect();
    },
});

// Create a new category
export const create = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        type: v.string(),
        description: v.optional(v.string()),
        order: v.number(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("categories", args);
    },
});

// Update a category
export const update = mutation({
    args: {
        id: v.id("categories"),
        name: v.optional(v.string()),
        slug: v.optional(v.string()),
        type: v.optional(v.string()),
        description: v.optional(v.string()),
        order: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Delete a category
export const remove = mutation({
    args: { id: v.id("categories") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
