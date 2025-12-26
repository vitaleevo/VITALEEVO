import { mutation } from "./_generated/server";
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
