import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

export const getUnreadCount = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_status", (q) => q.eq("userId", args.userId).eq("status", "unread"))
            .collect();
        return unread.length;
    },
});

export const markAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.notificationId, { status: "read" });
    },
});

export const markAllAsRead = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_status", (q) => q.eq("userId", args.userId).eq("status", "unread"))
            .collect();

        for (const note of unread) {
            await ctx.db.patch(note._id, { status: "read" });
        }
    },
});

export const create = mutation({
    args: {
        userId: v.id("users"),
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal("order"), v.literal("promo"), v.literal("system")),
        metadata: v.optional(v.object({
            orderId: v.optional(v.string()),
            link: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const notificationId = await ctx.db.insert("notifications", {
            ...args,
            status: "unread",
            createdAt: Date.now(),
        });
        return notificationId;
    },
});

export const remove = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.notificationId);
    },
});
