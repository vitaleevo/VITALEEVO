import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requirePermission } from "./utils";
import { validateSlug, validateText } from "./validation";

const serviceFields = {
    title: v.string(),
    slug: v.string(),
    subtitle: v.string(),
    description: v.string(),
    icon: v.string(),
    image: v.string(),
    features: v.array(v.string()),
    benefits: v.array(v.object({
        title: v.string(),
        desc: v.string(),
        icon: v.string(),
    })),
    process: v.array(v.object({
        step: v.string(),
        title: v.string(),
        desc: v.string(),
    })),
    ctaText: v.string(),
    isActive: v.boolean(),
    status: v.optional(v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived")
    )),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    order: v.number(),
};

// Public: active services, published (legacy rows without status are treated as published)
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        const services = await ctx.db
            .query("services")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();
        return services
            .filter((s) => !s.status || s.status === "published")
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const service = await ctx.db
            .query("services")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
        if (!service || !service.isActive || (service.status && service.status !== "published")) {
            return null;
        }
        return service;
    },
});

// Staff: full list for the admin panel
export const getAllAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "content:manage");
        const services = await ctx.db.query("services").collect();
        return services.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
});

export const create = mutation({
    args: { token: v.string(), ...serviceFields },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "content:manage");
        const { token, ...data } = args;
        const slug = validateSlug(data.slug || data.title);
        validateText(data.title, "Título", 120);

        const existing = await ctx.db
            .query("services")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();
        if (existing) throw new Error("Já existe um serviço com este slug.");

        return await ctx.db.insert("services", {
            ...data,
            slug,
            updatedAt: Date.now(),
        });
    },
});

export const update = mutation({
    args: {
        token: v.string(),
        id: v.id("services"),
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        subtitle: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        image: v.optional(v.string()),
        features: v.optional(v.array(v.string())),
        benefits: v.optional(v.array(v.object({
            title: v.string(),
            desc: v.string(),
            icon: v.string(),
        }))),
        process: v.optional(v.array(v.object({
            step: v.string(),
            title: v.string(),
            desc: v.string(),
        }))),
        ctaText: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
        status: v.optional(v.union(
            v.literal("draft"),
            v.literal("published"),
            v.literal("archived")
        )),
        seoTitle: v.optional(v.string()),
        seoDescription: v.optional(v.string()),
        order: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "content:manage");
        const { token, id, ...updates } = args;

        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Serviço não encontrado.");

        if (updates.slug !== undefined) {
            const slug = validateSlug(updates.slug);
            const duplicate = await ctx.db
                .query("services")
                .withIndex("by_slug", (q) => q.eq("slug", slug))
                .first();
            if (duplicate && duplicate._id !== id) throw new Error("Já existe um serviço com este slug.");
            updates.slug = slug;
        }

        await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
    },
});

export const remove = mutation({
    args: { token: v.string(), id: v.id("services") },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "content:manage");
        const existing = await ctx.db.get(args.id);
        if (!existing) throw new Error("Serviço não encontrado.");
        await ctx.db.delete(args.id);
    },
});