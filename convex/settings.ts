import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_SETTINGS = {
    key: "site_config",
    siteName: "Vitaleevo",
    siteDescription: "Plataforma de E-commerce e Serviços de Tecnologia",
    contactEmail: "info@vitaleevo.ao",
    contactPhone: "+244 9XX XXX XXX",
    whatsapp: "2449XXXXXXXX",
    address: "Luanda, Angola",
    socialLinks: {
        instagram: "https://instagram.com/vitaleevo",
        facebook: "https://facebook.com/vitaleevo",
        linkedin: "https://linkedin.com/company/vitaleevo",
    },
    businessConfig: {
        shippingFee: 2500,
        minOrderForFreeShipping: 50000,
        maintenanceMode: false,
        currency: "Kz",
    },
};

export const get = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", "site_config"))
            .unique();

        return settings || DEFAULT_SETTINGS;
    },
});

export const update = mutation({
    args: {
        siteName: v.optional(v.string()),
        siteDescription: v.optional(v.string()),
        contactEmail: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        whatsapp: v.optional(v.string()),
        address: v.optional(v.string()),
        socialLinks: v.optional(v.object({
            instagram: v.optional(v.string()),
            facebook: v.optional(v.string()),
            linkedin: v.optional(v.string()),
            twitter: v.optional(v.string()),
        })),
        businessConfig: v.optional(v.object({
            shippingFee: v.number(),
            minOrderForFreeShipping: v.optional(v.number()),
            maintenanceMode: v.boolean(),
            currency: v.string(),
        })),
        // Allow metadata fields to prevent validation errors from cached clients
        key: v.optional(v.string()),
        _id: v.optional(v.string()),
        _creationTime: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Remove metadata from args before patching
        const { key, _id, _creationTime, updatedAt, ...cleanArgs } = args;

        const existing = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", "site_config"))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...cleanArgs,
                updatedAt: Date.now(),
            });
        } else {
            // Merge with defaults if first time
            await ctx.db.insert("settings", {
                ...DEFAULT_SETTINGS,
                ...cleanArgs,
                key: "site_config",
                updatedAt: Date.now(),
            } as any);
        }
    },
});
