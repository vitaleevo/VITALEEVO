import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { requirePermission } from "./utils";
import { encryptSecret } from "./secrets";

export const getAllAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "ai:manage");
        const keys = await ctx.db.query("apiKeys").order("desc").collect();

        return keys.map((key) => ({
            _id: key._id,
            provider: key.provider,
            label: key.label,
            isActive: key.isActive,
            createdAt: key.createdAt,
            updatedAt: key.updatedAt,
            keyLastFour: key.keyLastFour ?? key.apiKey?.slice(-4) ?? "",
            needsMigration: Boolean(key.apiKey),
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
        await requirePermission(ctx, args.token, "ai:manage");

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
            .withIndex("by_provider", (query) => query.eq("provider", args.provider))
            .first();
        const now = Date.now();
        const encrypted = await encryptSecret(args.apiKey);
        const encryptedFields = {
            encryptedApiKey: encrypted.ciphertext,
            encryptionIv: encrypted.iv,
            keyLastFour: args.apiKey.slice(-4),
            apiKey: undefined,
            label: args.label,
            isActive: args.isActive,
            updatedAt: now,
        };

        if (existing) {
            await ctx.db.patch(existing._id, encryptedFields);
            return { success: true, action: "updated", id: existing._id };
        }

        const id = await ctx.db.insert("apiKeys", {
            provider: args.provider,
            ...encryptedFields,
            createdAt: now,
        });
        return { success: true, action: "created", id };
    },
});

export const remove = mutation({
    args: {
        token: v.string(),
        id: v.id("apiKeys"),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "ai:manage");
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
        await requirePermission(ctx, args.token, "ai:manage");
        const key = await ctx.db.get(args.id);
        if (!key) throw new Error("Chave não encontrada");

        await ctx.db.patch(args.id, {
            isActive: !key.isActive,
            updatedAt: Date.now(),
        });
        return { success: true, isActive: !key.isActive };
    },
});

export const migrateLegacyKeys = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "ai:manage");
        const legacyKeys = (await ctx.db.query("apiKeys").collect())
            .filter((key) => Boolean(key.apiKey));

        for (const key of legacyKeys) {
            if (!key.apiKey) continue;
            const encrypted = await encryptSecret(key.apiKey);
            await ctx.db.patch(key._id, {
                encryptedApiKey: encrypted.ciphertext,
                encryptionIv: encrypted.iv,
                keyLastFour: key.apiKey.slice(-4),
                apiKey: undefined,
                updatedAt: Date.now(),
            });
        }

        return { success: true, migrated: legacyKeys.length };
    },
});

export const getAllActiveInternal = internalQuery({
    handler: async (ctx) => {
        const keys = await ctx.db
            .query("apiKeys")
            .filter((query) => query.eq(query.field("isActive"), true))
            .collect();

        return keys.flatMap((key) => {
            if (!key.encryptedApiKey || !key.encryptionIv) return [];
            return [{
                provider: key.provider,
                encryptedApiKey: key.encryptedApiKey,
                encryptionIv: key.encryptionIv,
            }];
        });
    },
});
