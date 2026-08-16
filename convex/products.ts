import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requirePermission } from "./utils";
import { validateSlug, validatePositiveQuantity } from "./validation";

// Public products are only those active AND published (legacy rows without status are treated as published)
function publicFilter(q: any) {
    return q.and(
        q.eq(q.field("isActive"), true),
        q.or(
            q.eq(q.field("status"), undefined),
            q.eq(q.field("status"), "published"),
        ),
    );
}

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
                .filter((q) => publicFilter(q))
                .collect();

            products.sort((a, b) => b._creationTime - a._creationTime);
        } else {
            products = await ctx.db
                .query("products")
                .filter((q) => publicFilter(q))
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
            .filter((q) => publicFilter(q))
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
        await requirePermission(ctx, args.token, "catalog:manage");
        const products = await ctx.db
            .query("products")
            .order("desc")
            .collect();
        return products;
    },
});

// Get a single product by slug (public: only active + published)
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const product = await ctx.db
            .query("products")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (!product) return null;
        if (!product.isActive || (product.status && product.status !== "published")) {
            return null;
        }
        return product;
    },
});

// Get a single product by ID (public: only active + published)
export const getById = query({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.id);
        if (!product) return null;
        if (!product.isActive || (product.status && product.status !== "published")) {
            return null;
        }
        return product;
    },
});

// Create a new product (admin only)
export const create = mutation({
    args: {
        token: v.string(),
        name: v.string(),
        slug: v.string(),
        sku: v.optional(v.string()),
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
        status: v.optional(v.union(
            v.literal("draft"),
            v.literal("published"),
            v.literal("archived"),
        )),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "catalog:manage");
        const { token, ...productData } = args;

        const slug = validateSlug(productData.slug);
        const existing = await ctx.db
            .query("products")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .unique();
        if (existing) {
            throw new Error("Já existe um produto com este slug");
        }

        if (productData.sku) {
            const dupSku = await ctx.db
                .query("products")
                .withIndex("by_sku", (q) => q.eq("sku", productData.sku))
                .unique();
            if (dupSku) {
                throw new Error("Já existe um produto com este SKU");
            }
        }

        if (productData.price < 0 || productData.stock < 0) {
            throw new Error("Preço e stock não podem ser negativos");
        }

        const productId = await ctx.db.insert("products", {
            ...productData,
            slug,
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
        slug: v.optional(v.string()),
        sku: v.optional(v.string()),
        description: v.optional(v.string()),
        fullDescription: v.optional(v.string()),
        price: v.optional(v.number()),
        oldPrice: v.optional(v.number()),
        image: v.optional(v.string()),
        images: v.optional(v.array(v.string())),
        category: v.optional(v.string()),
        brand: v.optional(v.string()),
        stock: v.optional(v.number()),
        isNew: v.optional(v.boolean()),
        isActive: v.optional(v.boolean()),
        status: v.optional(v.union(
            v.literal("draft"),
            v.literal("published"),
            v.literal("archived"),
        )),
        specs: v.optional(v.array(v.object({
            label: v.string(),
            value: v.string(),
        }))),
        isFeatured: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "catalog:manage");
        const { id, token, ...updates } = args;

        if (updates.slug) {
            const slug = validateSlug(updates.slug);
            const existing = await ctx.db
                .query("products")
                .withIndex("by_slug", (q) => q.eq("slug", slug))
                .unique();
            if (existing && existing._id !== id) {
                throw new Error("Já existe um produto com este slug");
            }
            updates.slug = slug;
        }

        if (updates.sku !== undefined) {
            const dupSku = await ctx.db
                .query("products")
                .withIndex("by_sku", (q) => q.eq("sku", updates.sku))
                .unique();
            if (dupSku && dupSku._id !== id) {
                throw new Error("Já existe um produto com este SKU");
            }
        }

        if ((updates.price !== undefined && updates.price < 0) || (updates.stock !== undefined && updates.stock < 0)) {
            throw new Error("Preço e stock não podem ser negativos");
        }

        await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
    },
});

// Delete a product (soft delete)
export const remove = mutation({
    args: { token: v.string(), id: v.id("products") },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "catalog:manage");
        await ctx.db.patch(args.id, { isActive: false });
    },
});

// Adjust stock with an audited inventory movement
export const adjustStock = mutation({
    args: {
        token: v.string(),
        id: v.id("products"),
        quantity: v.number(), // signed delta: positive adds, negative removes
        note: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await requirePermission(ctx, args.token, "stock:manage");
        if (!Number.isInteger(args.quantity) || args.quantity === 0) {
            throw new Error("Quantidade inválida");
        }

        const product = await ctx.db.get(args.id);
        if (!product) throw new Error("Produto não encontrado");

        const newStock = product.stock + args.quantity;
        if (newStock < 0) {
            throw new Error(`Stock insuficiente (atual: ${product.stock})`);
        }

        await ctx.db.patch(args.id, { stock: newStock, updatedAt: Date.now() });
        await ctx.db.insert("inventoryMovements", {
            productId: args.id,
            actorId: user._id,
            type: "adjustment",
            quantity: args.quantity,
            note: args.note ? args.note.slice(0, 300) : undefined,
            createdAt: Date.now(),
        });

        return { stock: newStock };
    },
});
