import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Submit a contact message
export const submit = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        company: v.optional(v.string()),
        subject: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("contacts", {
            ...args,
            isRead: false,
            createdAt: Date.now(),
        });
        return messageId;
    },
});

// Get all contact messages (admin only)
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("contacts")
            .order("desc")
            .collect();
    },
});

// Mark message as read
export const markAsRead = mutation({
    args: { id: v.id("contacts"), isRead: v.boolean() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { isRead: args.isRead });
    },
});

// Delete a contact message
export const remove = mutation({
    args: { id: v.id("contacts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
