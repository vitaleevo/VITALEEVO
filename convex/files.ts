import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePermission } from "./utils";
import { writeAuditLog } from "./audit";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const purposeValidator = v.union(
    v.literal("product"),
    v.literal("content"),
    v.literal("profile"),
);

export const generateUploadUrl = mutation({
    args: {
        token: v.string(),
        purpose: purposeValidator,
        contentType: v.string(),
        size: v.number(),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "media:upload");
        if (!IMAGE_TYPES.includes(args.contentType) || args.size <= 0 || args.size > MAX_IMAGE_SIZE) {
            throw new Error("Imagem inválida. Use JPG, PNG, WebP ou AVIF com até 5 MB.");
        }
        return await ctx.storage.generateUploadUrl();
    },
});

export const registerUpload = mutation({
    args: {
        token: v.string(),
        storageId: v.id("_storage"),
        filename: v.string(),
        contentType: v.string(),
        size: v.number(),
        purpose: purposeValidator,
    },
    handler: async (ctx, args) => {
        const user = await requirePermission(ctx, args.token, "media:upload");
        if (!IMAGE_TYPES.includes(args.contentType) || args.size <= 0 || args.size > MAX_IMAGE_SIZE) {
            throw new Error("Metadados de imagem inválidos");
        }

        const url = await ctx.storage.getUrl(args.storageId);
        if (!url) throw new Error("Ficheiro enviado não foi encontrado");

        const mediaId = await ctx.db.insert("media", {
            storageId: args.storageId,
            url,
            filename: args.filename.slice(0, 160),
            contentType: args.contentType,
            size: args.size,
            purpose: args.purpose,
            uploadedBy: user._id,
            createdAt: Date.now(),
        });

        await writeAuditLog(ctx, user._id, "media.uploaded", "media", mediaId, args.filename);
        return { mediaId, url };
    },
});

export const getImageUrl = query({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

export const getUrl = mutation({
    args: { token: v.string(), storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "media:upload");
        return await ctx.storage.getUrl(args.storageId);
    },
});
