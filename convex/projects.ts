import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./utils";

// Public queries
export const getVisibleProjects = query({
    args: { category: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let projects;
        if (args.category && args.category !== "Todos") {
            projects = await ctx.db.query("projects").withIndex("by_category", (q) => q.eq("category", args.category!)).collect();
        } else {
            projects = await ctx.db.query("projects").collect();
        }
        const activeProjects = projects.filter(p => p.isActive === true);
        return activeProjects.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return (a.order || 0) - (b.order || 0);
        });
    },
});

export const getFeaturedProjects = query({
    args: {},
    handler: async (ctx) => {
        const projects = await ctx.db.query("projects").filter((q) => q.eq(q.field("isFeatured"), true)).collect();
        return projects.filter(p => p.isActive === true);
    },
});

export const getById = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Admin-only operations
export const getAllAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        return await ctx.db.query("projects").order("desc").collect();
    },
});

export const create = mutation({
    args: {
        token: v.string(),
        title: v.string(),
        slug: v.string(),
        category: v.string(),
        tags: v.array(v.string()),
        image: v.string(),
        images: v.optional(v.array(v.string())),
        client: v.optional(v.string()),
        year: v.optional(v.string()),
        fullDescription: v.string(),
        challenge: v.string(),
        solution: v.string(),
        results: v.array(v.string()),
        isActive: v.boolean(),
        isFeatured: v.boolean(),
        order: v.number(),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const { token, ...data } = args;
        return await ctx.db.insert("projects", { ...data, createdAt: Date.now() });
    },
});

export const update = mutation({
    args: {
        token: v.string(),
        id: v.id("projects"),
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        category: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        image: v.optional(v.string()),
        images: v.optional(v.array(v.string())),
        client: v.optional(v.string()),
        year: v.optional(v.string()),
        fullDescription: v.optional(v.string()),
        challenge: v.optional(v.string()),
        solution: v.optional(v.string()),
        results: v.optional(v.array(v.string())),
        isActive: v.optional(v.boolean()),
        isFeatured: v.optional(v.boolean()),
        order: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const { id, token, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const remove = mutation({
    args: { token: v.string(), id: v.id("projects") },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        await ctx.db.delete(args.id);
    },
});
