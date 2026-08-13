import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { api } from "./_generated/api";

export const subscribe = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("newsletters")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (existing) {
            if (!existing.isActive) {
                await ctx.db.patch(existing._id, { isActive: true });
            }
            return existing._id;
        }

        return await ctx.db.insert("newsletters", {
            email: args.email,
            isActive: true,
            subscribedAt: Date.now(),
        });
    },
});

export const unsubscribe = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("newsletters")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { isActive: false });
        }
    },
});

export const getAllSubscribers = internalQuery({
    handler: async (ctx) => {
        return await ctx.db
            .query("newsletters")
            .withIndex("by_active", (q) => q.eq("isActive", true))
            .collect();
    },
});
