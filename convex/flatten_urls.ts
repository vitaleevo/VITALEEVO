import { mutation } from "./_generated/server";

export const flattenAllUrls = mutation({
    handler: async (ctx) => {
        const projects = await ctx.db.query("projects").collect();
        for (const p of projects) {
            const imageUrl = await ctx.storage.getUrl(p.image as any);
            const galleryUrls = p.images ? await Promise.all(p.images.map(async (img) => {
                const url = await ctx.storage.getUrl(img as any);
                return url || img;
            })) : [];
            await ctx.db.patch(p._id, {
                image: imageUrl || p.image,
                images: galleryUrls,
            });
        }

        const articles = await ctx.db.query("articles").collect();
        for (const a of articles) {
            const imageUrl = await ctx.storage.getUrl(a.image as any);
            await ctx.db.patch(a._id, {
                image: imageUrl || a.image,
            });
        }

        return { message: "All URLs flattened" };
    },
});
