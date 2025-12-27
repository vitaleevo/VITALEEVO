
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// THIS IS A ONE-TIME SCRIPT TO CREATE THE FIRST ADMIN
// RUN WITH: npx convex run setupAdmin:createFirstAdmin --prod --args email="seu@email.com"

function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const salt = "vitaleevo_2024_secure";
    let finalHash = hash.toString(16);
    for (let i = 0; i < salt.length; i++) {
        finalHash += (hash + salt.charCodeAt(i)).toString(16);
    }
    return finalHash;
}

export const createFirstAdmin = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string()
    },
    handler: async (ctx, args) => {
        // 1. Check if user already exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (existing) {
            // If exists, just promote to admin
            await ctx.db.patch(existing._id, { role: "admin" });
            return { status: "User existed, promoted to ADMIN.", userId: existing._id };
        }

        // 2. Create new Admin User
        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email.toLowerCase(),
            passwordHash: simpleHash(args.password),
            role: "admin",
            isActive: true,
            createdAt: Date.now(),
        });

        return { status: "New ADMIN user created successfully.", userId };
    },
});
