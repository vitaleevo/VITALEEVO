import { query } from "./_generated/server";

export const debugFirstProduct = query({
    handler: async (ctx) => {
        return await ctx.db.query("products").first();
    },
});
