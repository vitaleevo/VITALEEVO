import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate unique order number
function generateOrderNumber(): string {
    const prefix = "VE";
    const random = Math.floor(Math.random() * 90000) + 10000;
    return `${prefix}-${random}`;
}

// Get all orders for a user
export const getByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();

        return orders;
    },
});

// Get single order by ID
export const getById = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.orderId);
    },
});

// Get order by order number
export const getByOrderNumber = query({
    args: { orderNumber: v.string() },
    handler: async (ctx, args) => {
        const order = await ctx.db
            .query("orders")
            .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
            .first();
        return order;
    },
});

// Create a new order
export const create = mutation({
    args: {
        userId: v.id("users"),
        items: v.array(v.object({
            productId: v.id("products"),
            name: v.string(),
            price: v.number(),
            quantity: v.number(),
            image: v.string(),
        })),
        subtotal: v.number(),
        shipping: v.number(),
        total: v.number(),
        shippingAddress: v.object({
            name: v.string(),
            phone: v.string(),
            city: v.string(),
            address: v.string(),
            reference: v.optional(v.string()),
        }),
        paymentMethod: v.string(),
    },
    handler: async (ctx, args) => {
        const orderNumber = generateOrderNumber();
        const now = Date.now();

        const orderId = await ctx.db.insert("orders", {
            ...args,
            orderNumber,
            status: "pending",
            createdAt: now,
            updatedAt: now,
        });

        return { orderId, orderNumber };
    },
});

// Update order status
export const updateStatus = mutation({
    args: {
        orderId: v.id("orders"),
        status: v.union(
            v.literal("pending"),
            v.literal("paid"),
            v.literal("processing"),
            v.literal("shipped"),
            v.literal("delivered"),
            v.literal("cancelled")
        ),
        paymentReference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const updates: Record<string, unknown> = {
            status: args.status,
            updatedAt: Date.now(),
        };

        if (args.paymentReference) {
            updates.paymentReference = args.paymentReference;
        }

        await ctx.db.patch(args.orderId, updates);
    },
});

// Get recent orders (for admin dashboard)
export const getRecent = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;
        const orders = await ctx.db
            .query("orders")
            .order("desc")
            .take(limit);

        return orders;
    },
});

// Get orders by status
export const getByStatus = query({
    args: {
        status: v.union(
            v.literal("pending"),
            v.literal("paid"),
            v.literal("processing"),
            v.literal("shipped"),
            v.literal("delivered"),
            v.literal("cancelled")
        )
    },
    handler: async (ctx, args) => {
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_status", (q) => q.eq("status", args.status))
            .collect();

        return orders;
    },
});
