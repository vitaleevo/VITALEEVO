import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all active brands
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("brands")
            .filter((q) => q.eq(q.field("isActive"), true))
            .order("asc")
            .collect();
    },
});

// Get all brands for admin
export const getAllAdmin = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("brands").collect();
    },
});

// Create a new brand
export const create = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        logo: v.optional(v.string()),
        description: v.optional(v.string()),
        order: v.number(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("brands", args);
    },
});

// Update a brand
export const update = mutation({
    args: {
        id: v.id("brands"),
        name: v.optional(v.string()),
        slug: v.optional(v.string()),
        logo: v.optional(v.string()),
        description: v.optional(v.string()),
        order: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Delete a brand
export const remove = mutation({
    args: { id: v.id("brands") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
