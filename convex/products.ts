import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkAdmin } from "./utils";

// Get all active products
export const getAll = query({
    args: {
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let products;

        if (args.category && args.category !== "Todos") {
            const category = args.category;
            products = await ctx.db
                .query("products")
                .withIndex("by_category", (q) => q.eq("category", category))
                .filter((q) => q.eq(q.field("isActive"), true))
                .collect();

            products.sort((a, b) => b._creationTime - a._creationTime);
        } else {
            products = await ctx.db
                .query("products")
                .filter((q) => q.eq(q.field("isActive"), true))
                .order("desc")
                .collect();
        }

        return products;
    },
});

// Get featured products
export const getFeatured = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const featured = await ctx.db
            .query("products")
            .withIndex("by_featured", (q) => q.eq("isFeatured", true))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        if (args.limit) {
            return featured.slice(0, args.limit);
        }
        return featured;
    },
});


// Get all products (for admin - includes inactive)
export const getAllAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const products = await ctx.db
            .query("products")
            .order("desc")
            .collect();
        return products;
    },
});

// Get a single product by slug
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const product = await ctx.db
            .query("products")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
        return product;
    },
});

// Get a single product by ID
export const getById = query({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Create a new product (admin only)
export const create = mutation({
    args: {
        token: v.string(),
        name: v.string(),
        slug: v.string(),
        description: v.string(),
        fullDescription: v.optional(v.string()),
        price: v.number(),
        oldPrice: v.optional(v.number()),
        image: v.string(),
        images: v.optional(v.array(v.string())),
        category: v.string(),
        brand: v.optional(v.string()),
        specs: v.optional(v.array(v.object({
            label: v.string(),
            value: v.string(),
        }))),
        stock: v.number(),
        isNew: v.boolean(),
        isFeatured: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const { token, ...productData } = args;

        const productId = await ctx.db.insert("products", {
            ...productData,
            isActive: true,
            rating: 0,
            reviewCount: 0,
            createdAt: Date.now(),
        });
        return productId;
    },
});

// Update a product
export const update = mutation({
    args: {
        token: v.string(),
        id: v.id("products"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        fullDescription: v.optional(v.string()),
        price: v.optional(v.number()),
        oldPrice: v.optional(v.number()),
        image: v.optional(v.string()),
        category: v.optional(v.string()),
        brand: v.optional(v.string()),
        stock: v.optional(v.number()),
        isNew: v.optional(v.boolean()),
        isActive: v.optional(v.boolean()),
        specs: v.optional(v.array(v.object({
            label: v.string(),
            value: v.string(),
        }))),
        isFeatured: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const { id, token, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Delete a product (soft delete)
export const remove = mutation({
    args: { token: v.string(), id: v.id("products") },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        await ctx.db.patch(args.id, { isActive: false });
    },
});
