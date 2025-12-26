import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get cart items for a user
export const getByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const cartItems = await ctx.db
            .query("cartItems")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        // Fetch product details for each cart item
        const itemsWithProducts = await Promise.all(
            cartItems.map(async (item) => {
                const product = await ctx.db.get(item.productId);
                return {
                    ...item,
                    product,
                };
            })
        );

        return itemsWithProducts.filter((item) => item.product !== null);
    },
});

// Add item to cart
export const add = mutation({
    args: {
        userId: v.id("users"),
        productId: v.id("products"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        // Check if item already exists in cart
        const existingItem = await ctx.db
            .query("cartItems")
            .withIndex("by_user_product", (q) =>
                q.eq("userId", args.userId).eq("productId", args.productId)
            )
            .first();

        if (existingItem) {
            // Update quantity
            await ctx.db.patch(existingItem._id, {
                quantity: existingItem.quantity + args.quantity,
            });
            return existingItem._id;
        } else {
            // Create new cart item
            const itemId = await ctx.db.insert("cartItems", {
                userId: args.userId,
                productId: args.productId,
                quantity: args.quantity,
                addedAt: Date.now(),
            });
            return itemId;
        }
    },
});

// Update cart item quantity
export const updateQuantity = mutation({
    args: {
        itemId: v.id("cartItems"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        if (args.quantity <= 0) {
            await ctx.db.delete(args.itemId);
        } else {
            await ctx.db.patch(args.itemId, { quantity: args.quantity });
        }
    },
});

// Remove item from cart
export const remove = mutation({
    args: { itemId: v.id("cartItems") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.itemId);
    },
});

// Clear entire cart for a user
export const clear = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const cartItems = await ctx.db
            .query("cartItems")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        for (const item of cartItems) {
            await ctx.db.delete(item._id);
        }
    },
});

// Get cart count for a user
export const getCount = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const cartItems = await ctx.db
            .query("cartItems")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        return cartItems.reduce((total, item) => total + item.quantity, 0);
    },
});
