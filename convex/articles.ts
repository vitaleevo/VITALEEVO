import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all articles (for admin - includes unpublished)
export const getAllAdmin = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("articles")
            .order("desc")
            .collect();
    },
});

// Get published articles
export const getPublished = query({
    args: {
        category: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db
            .query("articles")
            .withIndex("by_published", (q) => q.eq("isPublished", true));

        const articles = await q.order("desc").collect();

        let filtered = articles;
        if (args.category && args.category !== "Todos") {
            filtered = articles.filter(a => a.category === args.category);
        }

        if (args.limit) {
            filtered = filtered.slice(0, args.limit);
        }

        return filtered;
    },
});

// Get featured articles
export const getFeatured = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        let q = ctx.db
            .query("articles")
            .withIndex("by_featured", (q) => q.eq("isFeatured", true));

        const articles = await q.collect();
        const publishedFeatured = articles.filter(a => a.isPublished === true);

        if (args.limit) {
            return publishedFeatured.slice(0, args.limit);
        }
        return publishedFeatured;
    },
});

// Get article by slug
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("articles")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});

// Create article
export const create = mutation({
    args: {
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
        const now = Date.now();
        const articleId = await ctx.db.insert("articles", {
            ...args,
            publishedAt: args.isPublished ? now : undefined,
            createdAt: now,
            updatedAt: now,
        });
        return articleId;
    },
});

// Update article
export const update = mutation({
    args: {
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
        const { id, ...updates } = args;
        const now = Date.now();

        // If changing to published, set publishedAt
        if (updates.isPublished === true) {
            (updates as any).publishedAt = now;
        }

        await ctx.db.patch(id, {
            ...updates,
            updatedAt: now,
        });
    },
});

// Delete article
export const remove = mutation({
    args: { id: v.id("articles") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
