import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all addresses for a user
export const getByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("addresses")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

// Create a new address
export const create = mutation({
    args: {
        userId: v.id("users"),
        label: v.string(),
        name: v.string(),
        phone: v.string(),
        city: v.string(),
        address: v.string(),
        reference: v.optional(v.string()),
        isDefault: v.boolean(),
    },
    handler: async (ctx, args) => {
        // If this is the default address, unset other defaults
        if (args.isDefault) {
            const existingDefault = await ctx.db
                .query("addresses")
                .withIndex("by_user", (q) => q.eq("userId", args.userId))
                .filter((q) => q.eq(q.field("isDefault"), true))
                .first();

            if (existingDefault) {
                await ctx.db.patch(existingDefault._id, { isDefault: false });
            }
        } else {
            // If it's the first address, make it default
            const anyAddress = await ctx.db
                .query("addresses")
                .withIndex("by_user", (q) => q.eq("userId", args.userId))
                .first();

            if (!anyAddress) {
                args.isDefault = true;
            }
        }

        const addressId = await ctx.db.insert("addresses", {
            ...args,
            createdAt: Date.now(),
        });

        return addressId;
    },
});

// Update an address
export const update = mutation({
    args: {
        addressId: v.id("addresses"),
        label: v.optional(v.string()),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        city: v.optional(v.string()),
        address: v.optional(v.string()),
        reference: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { addressId, ...updates } = args;
        const address = await ctx.db.get(addressId);
        if (!address) throw new Error("Endereço não encontrado");

        // If setting as default, unset others first
        if (updates.isDefault) {
            const existingDefault = await ctx.db
                .query("addresses")
                .withIndex("by_user", (q) => q.eq("userId", address.userId))
                .filter((q) => q.eq(q.field("isDefault"), true))
                .first();

            if (existingDefault && existingDefault._id !== addressId) {
                await ctx.db.patch(existingDefault._id, { isDefault: false });
            }
        }

        await ctx.db.patch(addressId, updates);
    },
});

// Delete an address
export const remove = mutation({
    args: { addressId: v.id("addresses") },
    handler: async (ctx, args) => {
        const address = await ctx.db.get(args.addressId);
        if (!address) return;

        await ctx.db.delete(args.addressId);

        // If we deleted the default, set another one as default if possible
        if (address.isDefault) {
            const another = await ctx.db
                .query("addresses")
                .withIndex("by_user", (q) => q.eq("userId", address.userId))
                .first();

            if (another) {
                await ctx.db.patch(another._id, { isDefault: true });
            }
        }
    },
});

// Set an address as default
export const setDefault = mutation({
    args: { addressId: v.id("addresses") },
    handler: async (ctx, args) => {
        const address = await ctx.db.get(args.addressId);
        if (!address) throw new Error("Endereço não encontrado");

        // Unset old default
        const oldDefault = await ctx.db
            .query("addresses")
            .withIndex("by_user", (q) => q.eq("userId", address.userId))
            .filter((q) => q.eq(q.field("isDefault"), true))
            .first();

        if (oldDefault) {
            await ctx.db.patch(oldDefault._id, { isDefault: false });
        }

        // Set new default
        await ctx.db.patch(args.addressId, { isDefault: true });
    },
});
