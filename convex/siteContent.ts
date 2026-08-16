import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requirePermission } from "./utils";
import { validateSlug, validateText } from "./validation";

// Public: a published page with its ordered blocks
export const getPage = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const page = await ctx.db
            .query("sitePages")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
        if (!page || page.status !== "published") return null;

        const blocks = await ctx.db
            .query("siteBlocks")
            .withIndex("by_page_order", (q) => q.eq("pageId", page._id))
            .collect();
        blocks.sort((a, b) => a.order - b.order);

        return { page, blocks };
    },
});

// Public: all published pages (footer/sitemap links)
export const getPages = query({
    args: {},
    handler: async (ctx) => {
        const pages = await ctx.db.query("sitePages").collect();
        return pages
            .filter((p) => p.status === "published")
            .sort((a, b) => a.slug.localeCompare(b.slug));
    },
});

// Staff
export const getPagesAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "content:manage");
        const pages = await ctx.db.query("sitePages").collect();
        const blocks = await ctx.db.query("siteBlocks").collect();
        return pages
            .map((page) => ({
                page,
                blocks: blocks
                    .filter((b) => b.pageId === page._id)
                    .sort((a, b) => a.order - b.order),
            }))
            .sort((a, b) => a.page.slug.localeCompare(b.page.slug));
    },
});

export const upsertPage = mutation({
    args: {
        token: v.string(),
        slug: v.string(),
        title: v.string(),
        seoTitle: v.string(),
        seoDescription: v.string(),
        ogImage: v.optional(v.string()),
        status: v.union(v.literal("draft"), v.literal("published")),
    },
    handler: async (ctx, args) => {
        const user = await requirePermission(ctx, args.token, "content:manage");
        const slug = validateSlug(args.slug);
        validateText(args.title, "Título", 200);

        const existing = await ctx.db
            .query("sitePages")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();

        const now = Date.now();
        if (existing) {
            await ctx.db.patch(existing._id, {
                title: args.title,
                seoTitle: args.seoTitle,
                seoDescription: args.seoDescription,
                ogImage: args.ogImage,
                status: args.status,
                updatedBy: user._id,
                updatedAt: now,
            });
            return existing._id;
        }

        return await ctx.db.insert("sitePages", {
            slug,
            title: args.title,
            seoTitle: args.seoTitle,
            seoDescription: args.seoDescription,
            ogImage: args.ogImage,
            status: args.status,
            updatedBy: user._id,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const upsertBlock = mutation({
    args: {
        token: v.string(),
        pageId: v.id("sitePages"),
        type: v.union(
            v.literal("hero"),
            v.literal("stats"),
            v.literal("logos"),
            v.literal("services"),
            v.literal("projects"),
            v.literal("benefits"),
            v.literal("cta"),
            v.literal("richText")
        ),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "content:manage");
        const existing = await ctx.db
            .query("siteBlocks")
            .withIndex("by_page_order", (q) => q.eq("pageId", args.pageId))
            .filter((q) => q.eq(q.field("type"), args.type))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                content: args.content,
                isVerified: false,
                updatedAt: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("siteBlocks", {
            pageId: args.pageId,
            type: args.type,
            content: args.content,
            order: 0,
            isVerified: false,
            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: { token: v.string(), id: v.id("sitePages") },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "content:manage");
        await ctx.db.delete(args.id);
    },
});