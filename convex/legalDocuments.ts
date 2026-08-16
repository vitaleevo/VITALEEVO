import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requirePermission } from "./utils";
import { validateSlug, validateText } from "./validation";

// Public: published legal documents
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        const docs = await ctx.db.query("legalDocuments").collect();
        return docs
            .filter((d) => d.status === "published")
            .sort((a, b) => a.slug.localeCompare(b.slug));
    },
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const doc = await ctx.db
            .query("legalDocuments")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
        if (!doc || doc.status !== "published") return null;
        return doc;
    },
});

// Staff
export const getAllAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "content:manage");
        return await ctx.db.query("legalDocuments").collect();
    },
});

export const upsert = mutation({
    args: {
        token: v.string(),
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        status: v.union(v.literal("draft"), v.literal("published")),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "content:manage");
        const slug = validateSlug(args.slug);
        validateText(args.title, "Título", 200);
        validateText(args.content, "Conteúdo", 100000);

        const existing = await ctx.db
            .query("legalDocuments")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                title: args.title,
                content: args.content,
                status: args.status,
                updatedAt: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("legalDocuments", {
            slug,
            title: args.title,
            content: args.content,
            status: args.status,
            updatedBy: (await requirePermission(ctx, args.token, "content:manage"))._id,
            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: { token: v.string(), id: v.id("legalDocuments") },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "content:manage");
        await ctx.db.delete(args.id);
    },
});