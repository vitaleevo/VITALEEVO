import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const items = await ctx.db
            .query("wishlist")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        // Fetch product details for each wishlist item
        const productPromises = items.map(async (item) => {
            const product = await ctx.db.get(item.productId);
            return {
                ...item,
                product,
            };
        });

        return Promise.all(productPromises);
    },
});

export const toggle = mutation({
    args: { userId: v.id("users"), productId: v.id("products") },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("wishlist")
            .withIndex("by_user_product", (q) =>
                q.eq("userId", args.userId).eq("productId", args.productId)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
            return { action: "removed" };
        } else {
            await ctx.db.insert("wishlist", {
                userId: args.userId,
                productId: args.productId,
                createdAt: Date.now(),
            });
            return { action: "added" };
        }
    },
});

export const isFavorited = query({
    args: { userId: v.optional(v.id("users")), productId: v.id("products") },
    handler: async (ctx, args) => {
        if (!args.userId) return false;

        const existing = await ctx.db
            .query("wishlist")
            .withIndex("by_user_product", (q) =>
                q.eq("userId", args.userId as Id<"users">).eq("productId", args.productId)
            )
            .first();

        return !!existing;
    },
});
