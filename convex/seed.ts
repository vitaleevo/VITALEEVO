import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Simple hash function (same as auth.ts)
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

// Create admin user (one-time use)
export const createAdminUser = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if email already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (existingUser) {
            // Update to admin if exists
            await ctx.db.patch(existingUser._id, { role: "admin" });
            return { userId: existingUser._id, message: "User updated to admin" };
        }

        // Create new admin user
        const userId = await ctx.db.insert("users", {
            email: args.email.toLowerCase(),
            name: args.name,
            passwordHash: simpleHash(args.password),
            role: "admin",
            isActive: true,
            createdAt: Date.now(),
        });

        return { userId, message: "Admin user created" };
    },
});

// Seed initial data
// Seed portfolio categories
export const seedPortfolioCategories = mutation({
    args: {},
    handler: async (ctx) => {
        const portfolioCategories = [
            { name: "Website", slug: "website", type: "portfolio", order: 1, isActive: true },
            { name: "Branding", slug: "branding", type: "portfolio", order: 2, isActive: true },
            { name: "Marketing Digital", slug: "marketing-digital", type: "portfolio", order: 3, isActive: true },
            { name: "Software", slug: "software", type: "portfolio", order: 4, isActive: true },
            { name: "Design", slug: "design", type: "portfolio", order: 5, isActive: true },
        ];

        for (const cat of portfolioCategories) {
            const existing = await ctx.db
                .query("categories")
                .filter((q) => q.and(
                    q.eq(q.field("slug"), cat.slug),
                    q.eq(q.field("type"), "portfolio")
                ))
                .first();

            if (!existing) {
                await ctx.db.insert("categories", cat);
            }
        }

        return { message: "Portfolio categories seeded" };
    },
});

export const seedBlogCategories = mutation({
    args: {},
    handler: async (ctx) => {
        const blogCategories = [
            { name: "Tecnologia", slug: "tecnologia", type: "blog", order: 1, isActive: true },
            { name: "Design", slug: "design", type: "blog", order: 2, isActive: true },
            { name: "Marketing", slug: "marketing", type: "blog", order: 3, isActive: true },
            { name: "Segurança", slug: "seguranca", type: "blog", order: 4, isActive: true },
            { name: "Inovação", slug: "inovacao", type: "blog", order: 5, isActive: true },
        ];

        for (const cat of blogCategories) {
            const existing = await ctx.db
                .query("categories")
                .filter((q) => q.and(
                    q.eq(q.field("slug"), cat.slug),
                    q.eq(q.field("type"), "blog")
                ))
                .first();

            if (!existing) {
                await ctx.db.insert("categories", cat);
            }
        }

        return { message: "Blog categories seeded" };
    },
});
