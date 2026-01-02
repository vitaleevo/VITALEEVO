import { mutation } from "./_generated/server";
import { v } from "convex/values";

// THIS IS A ONE-TIME SCRIPT TO CREATE THE FIRST ADMIN
// RUN WITH: npx convex run setupAdmin:createFirstAdmin --prod --args name="Admin" email="admin@vitaleevo.ao" password="your-secure-password"

function secureHash(str: string, salt: string = "vitaleevo_prod_2024"): string {
    let hash = 0;
    const combined = str + salt;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0') +
        str.length.toString(16) +
        combined.split('').reverse().join('').charCodeAt(0).toString(16);
}

export const createFirstAdmin = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string()
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        const passwordHash = secureHash(args.password);

        if (existing) {
            await ctx.db.patch(existing._id, {
                role: "admin",
                passwordHash // Update password hash as well to match new logic
            });
            return { status: "User existed, promoted to ADMIN and password hash updated.", userId: existing._id };
        }

        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email.toLowerCase(),
            passwordHash,
            role: "admin",
            isActive: true,
            createdAt: Date.now(),
        });

        return { status: "New ADMIN user created successfully.", userId };
    },
});
