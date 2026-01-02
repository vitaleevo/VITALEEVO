import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./utils";

// Internal queries for use in crons/actions
export const getPublishedInternal = internalQuery({
    args: { category: v.optional(v.string()), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        let articles = await ctx.db.query("articles").withIndex("by_published", (q) => q.eq("isPublished", true)).order("desc").collect();
        if (args.category && args.category !== "Todos") articles = articles.filter(a => a.category === args.category);
        if (args.limit) articles = articles.slice(0, args.limit);
        return articles;
    },
});

// Public queries
export const getPublished = query({
    args: { category: v.optional(v.string()), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        let articles = await ctx.db.query("articles").withIndex("by_published", (q) => q.eq("isPublished", true)).order("desc").collect();
        if (args.category && args.category !== "Todos") articles = articles.filter(a => a.category === args.category);
        if (args.limit) articles = articles.slice(0, args.limit);
        return articles;
    },
});

export const getFeatured = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const articles = await ctx.db.query("articles").withIndex("by_featured", (q) => q.eq("isFeatured", true)).collect();
        const published = articles.filter(a => a.isPublished === true);
        return args.limit ? published.slice(0, args.limit) : published;
    },
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("articles").withIndex("by_slug", (q) => q.eq("slug", args.slug)).first();
    },
});

// Admin-only operations
export const getAllAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        return await ctx.db.query("articles").order("desc").collect();
    },
});

export const create = mutation({
    args: {
        token: v.string(),
        title: v.string(),
        slug: v.string(),
        category: v.string(),
        excerpt: v.string(),
        content: v.string(),
        image: v.string(),
        author: v.string(),
        authorRole: v.optional(v.string()),
        authorImage: v.optional(v.string()),
        readTime: v.string(),
        isPublished: v.boolean(),
        isFeatured: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const { token, ...data } = args;
        const now = Date.now();
        return await ctx.db.insert("articles", { ...data, publishedAt: args.isPublished ? now : undefined, createdAt: now, updatedAt: now });
    },
});

export const update = mutation({
    args: {
        token: v.string(),
        id: v.id("articles"),
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        category: v.optional(v.string()),
        excerpt: v.optional(v.string()),
        content: v.optional(v.string()),
        image: v.optional(v.string()),
        author: v.optional(v.string()),
        authorRole: v.optional(v.string()),
        authorImage: v.optional(v.string()),
        readTime: v.optional(v.string()),
        isPublished: v.optional(v.boolean()),
        isFeatured: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const { id, token, ...updates } = args;
        const now = Date.now();
        if (updates.isPublished === true) (updates as any).publishedAt = now;
        await ctx.db.patch(id, { ...updates, updatedAt: now });
    },
});

export const remove = mutation({
    args: { token: v.string(), id: v.id("articles") },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        await ctx.db.delete(args.id);
    },
});
