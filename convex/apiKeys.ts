import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { checkAdmin } from "./utils";

// ========== Admin Operations ==========

export const getAllAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const keys = await ctx.db.query("apiKeys").order("desc").collect();

        return keys.map(key => ({
            ...key,
            apiKey: `•••••••••${key.apiKey.slice(-4)}`,
            fullKey: key.apiKey,
        }));
    },
});

export const upsert = mutation({
    args: {
        token: v.string(),
        provider: v.string(),
        apiKey: v.string(),
        label: v.optional(v.string()),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);

        // Basic validation of API key formats to help the user
        if (args.provider === "gemini" && !args.apiKey.startsWith("AIza")) {
            throw new Error("Formato de chave Gemini inválido. Chaves Google começam com 'AIza'.");
        }
        if (args.provider === "openai" && !args.apiKey.startsWith("sk-")) {
            throw new Error("Formato de chave OpenAI inválido. Chaves OpenAI começam com 'sk-'.");
        }
        if (args.provider === "anthropic" && !args.apiKey.startsWith("sk-ant")) {
            throw new Error("Formato de chave Anthropic inválido. Chaves Anthropic começam com 'sk-ant'.");
        }
        if (args.provider === "huggingface" && !args.apiKey.startsWith("hf_")) {
            throw new Error("Formato de chave Hugging Face inválido. Chaves Hugging Face começam com 'hf_'.");
        }

        const existing = await ctx.db
            .query("apiKeys")
            .withIndex("by_provider", (q) => q.eq("provider", args.provider))
            .first();

        const now = Date.now();

        if (existing) {
            await ctx.db.patch(existing._id, {
                apiKey: args.apiKey,
                label: args.label,
                isActive: args.isActive,
                updatedAt: now,
            });
            return { success: true, action: "updated", id: existing._id };
        } else {
            const id = await ctx.db.insert("apiKeys", {
                provider: args.provider,
                apiKey: args.apiKey,
                label: args.label,
                isActive: args.isActive,
                createdAt: now,
                updatedAt: now,
            });
            return { success: true, action: "created", id };
        }
    },
});

export const remove = mutation({
    args: {
        token: v.string(),
        id: v.id("apiKeys"),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        await ctx.db.delete(args.id);
        return { success: true };
    },
});

export const toggleActive = mutation({
    args: {
        token: v.string(),
        id: v.id("apiKeys"),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.token);
        const key = await ctx.db.get(args.id);
        if (!key) throw new Error("Chave não encontrada");

        await ctx.db.patch(args.id, {
            isActive: !key.isActive,
            updatedAt: Date.now(),
        });
        return { success: true, isActive: !key.isActive };
    },
});

// ========== Internal Queries ==========

export const getAllActiveInternal = internalQuery({
    handler: async (ctx) => {
        const keys = await ctx.db
            .query("apiKeys")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();
        return keys.map(k => ({ provider: k.provider, apiKey: k.apiKey }));
    },
});
