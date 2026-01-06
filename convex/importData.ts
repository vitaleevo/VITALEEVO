import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { checkAdmin } from "./utils";

/**
 * Bulk import products
 */
export const importProducts = mutation({
    args: {
        token: v.string(),
        items: v.array(v.object({
            name: v.string(),
            slug: v.string(),
            description: v.string(),
            fullDescription: v.optional(v.string()),
            price: v.number(),
            oldPrice: v.optional(v.number()),
            image: v.string(),
            images: v.optional(v.array(v.string())),
            category: v.string(),
            brand: v.optional(v.string()),
            stock: v.number(),
            isNew: v.boolean(),
            isActive: v.boolean(),
            isFeatured: v.optional(v.boolean()),
            rating: v.number(),
            reviewCount: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const results = {
            created: 0,
            updated: 0,
            errors: [] as string[],
        };

        for (const item of args.items) {
            try {
                const existing = await ctx.db
                    .query("products")
                    .withIndex("by_slug", (q) => q.eq("slug", item.slug))
                    .unique();

                if (existing) {
                    await ctx.db.patch(existing._id, {
                        ...item,
                        // Preserve original creation time
                    });
                    results.updated++;
                } else {
                    await ctx.db.insert("products", {
                        ...item,
                        createdAt: Date.now(),
                    });
                    results.created++;
                }
            } catch (error: any) {
                results.errors.push(`Error importing ${item.name}: ${error.message}`);
            }
        }

        return results;
    },
});

/**
 * Bulk import portfolio projects
 */
export const importProjects = mutation({
    args: {
        token: v.string(),
        items: v.array(v.object({
            title: v.string(),
            slug: v.string(),
            category: v.string(),
            tags: v.array(v.string()),
            image: v.string(),
            images: v.optional(v.array(v.string())),
            client: v.optional(v.string()),
            year: v.optional(v.string()),
            fullDescription: v.string(),
            challenge: v.string(),
            solution: v.string(),
            results: v.array(v.string()),
            isActive: v.boolean(),
            isFeatured: v.optional(v.boolean()),
            order: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const results = {
            created: 0,
            updated: 0,
            errors: [] as string[],
        };

        for (const item of args.items) {
            try {
                // Resolve storage IDs to URLs if they look like storage IDs
                let resolvedImage = item.image;
                if (!item.image.startsWith('http')) {
                    const url = await ctx.storage.getUrl(item.image as any);
                    if (url) resolvedImage = url;
                }

                let resolvedImages = item.images;
                if (item.images) {
                    resolvedImages = await Promise.all(
                        item.images.map(async (img) => {
                            if (!img.startsWith('http')) {
                                const url = await ctx.storage.getUrl(img as any);
                                return url || img;
                            }
                            return img;
                        })
                    );
                }

                const projectData = {
                    ...item,
                    image: resolvedImage,
                    images: resolvedImages,
                };

                const existing = await ctx.db
                    .query("projects")
                    .withIndex("by_slug", (q) => q.eq("slug", item.slug))
                    .unique();

                if (existing) {
                    await ctx.db.patch(existing._id, projectData);
                    results.updated++;
                } else {
                    await ctx.db.insert("projects", {
                        ...projectData,
                        createdAt: Date.now(),
                    });
                    results.created++;
                }
            } catch (error: any) {
                results.errors.push(`Error importing ${item.title}: ${error.message}`);
            }
        }

        return results;
    },
});

/**
 * Bulk import blog articles
 */
export const importSingleProject = mutation({
    args: {
        token: v.string(),
        item: v.object({
            title: v.string(),
            slug: v.string(),
            category: v.string(),
            tags: v.array(v.string()),
            image: v.string(),
            images: v.optional(v.array(v.string())),
            client: v.optional(v.string()),
            year: v.optional(v.string()),
            fullDescription: v.string(),
            challenge: v.string(),
            solution: v.string(),
            results: v.array(v.string()),
            isActive: v.boolean(),
            isFeatured: v.optional(v.boolean()),
            order: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const item = args.item;

        // Resolve storage IDs to URLs
        let resolvedImage = item.image;
        if (!item.image.startsWith('http')) {
            const url = await ctx.storage.getUrl(item.image as any);
            if (url) resolvedImage = url;
        }

        let resolvedImages = item.images;
        if (item.images) {
            resolvedImages = await Promise.all(
                item.images.map(async (img) => {
                    if (!img.startsWith('http')) {
                        const url = await ctx.storage.getUrl(img as any);
                        return url || img;
                    }
                    return img;
                })
            );
        }

        const projectData = {
            ...item,
            image: resolvedImage,
            images: resolvedImages,
        };

        const existing = await ctx.db
            .query("projects")
            .withIndex("by_slug", (q) => q.eq("slug", item.slug))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, projectData);
            return { id: existing._id, status: "updated" };
        } else {
            const id = await ctx.db.insert("projects", {
                ...projectData,
                createdAt: Date.now(),
            });
            return { id, status: "created" };
        }
    },
});

export const importArticles = mutation({
    args: {
        token: v.string(),
        items: v.array(v.object({
            title: v.string(),
            slug: v.string(),
            category: v.string(),
            excerpt: v.string(),
            content: v.string(),
            image: v.string(),
            author: v.string(),
            authorRole: v.optional(v.string()),
            authorImage: v.optional(v.string()),
            readTime: v.string(),
            isPublished: v.boolean(),
            isFeatured: v.optional(v.boolean()),
            publishedAt: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        const results = {
            created: 0,
            updated: 0,
            errors: [] as string[],
        };

        for (const item of args.items) {
            try {
                const existing = await ctx.db
                    .query("articles")
                    .withIndex("by_slug", (q) => q.eq("slug", item.slug))
                    .unique();

                if (existing) {
                    await ctx.db.patch(existing._id, {
                        ...item,
                        updatedAt: Date.now(),
                    });
                    results.updated++;
                } else {
                    await ctx.db.insert("articles", {
                        ...item,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        publishedAt: item.isPublished ? Date.now() : undefined,
                    });
                    results.created++;
                }
            } catch (error: any) {
                results.errors.push(`Error importing ${item.title}: ${error.message}`);
            }
        }

        return results;
    },
});
