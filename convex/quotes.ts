import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requirePermission, checkAuthenticated } from "./utils";
import { writeAuditLog } from "./audit";
import { normalizeEmail, validatePhone, validateText, validatePositiveQuantity } from "./validation";

const QUOTE_STATUSES = [
    "new",
    "qualified",
    "proposal_sent",
    "negotiating",
    "accepted",
    "lost",
    "cancelled",
    "fulfilled",
] as const;

const MAX_ITEMS = 50;
const RATE_LIMIT_PER_HOUR = 3;

function generatePublicId(): string {
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    let id = "";
    for (const b of bytes) {
        id += alphabet[b % alphabet.length];
    }
    return id;
}

async function notifyStaffNewQuote(ctx: any, quoteId: any, publicId: string) {
    const staff = await ctx.db.query("users").collect();
    for (const user of staff) {
        if (user.role === "admin" || user.role === "commercial") {
            await ctx.db.insert("notifications", {
                userId: user._id,
                title: "Nova cotação recebida",
                message: `Pedido de cotação ${publicId} aguarda tratamento.`,
                type: "system",
                status: "unread",
                metadata: { orderId: quoteId, link: `/admin/quotes` },
                createdAt: Date.now(),
            });
        }
    }
}

async function reserveStock(ctx: any, quoteId: any, items: any[], actorId: any): Promise<string[]> {
    const errors: string[] = [];
    for (const item of items) {
        if (!item.productId) continue;
        const existing = await ctx.db
            .query("inventoryMovements")
            .withIndex("by_quote", (q: any) => q.eq("quoteId", quoteId))
            .filter((q: any) =>
                q.and(
                    q.eq(q.field("type"), "reserved"),
                    q.eq(q.field("productId"), item.productId),
                )
            )
            .first();
        if (existing) continue;

        const product = await ctx.db.get(item.productId);
        if (!product) continue;
        if (product.stock < item.quantity) {
            errors.push(`${product.name}: stock insuficiente (${product.stock})`);
            continue;
        }
        await ctx.db.patch(item.productId, {
            stock: product.stock - item.quantity,
            updatedAt: Date.now(),
        });
        await ctx.db.insert("inventoryMovements", {
            productId: item.productId,
            quoteId,
            actorId,
            type: "reserved",
            quantity: item.quantity,
            note: `Reserva da cotação ${quoteId}`,
            createdAt: Date.now(),
        });
    }
    return errors;
}

async function releaseStock(ctx: any, quoteId: any, items: any[], actorId: any) {
    for (const item of items) {
        if (!item.productId) continue;
        const reserved = await ctx.db
            .query("inventoryMovements")
            .withIndex("by_quote", (q: any) => q.eq("quoteId", quoteId))
            .filter((q: any) =>
                q.and(
                    q.eq(q.field("type"), "reserved"),
                    q.eq(q.field("productId"), item.productId),
                )
            )
            .first();
        if (!reserved) continue;

        const alreadyReleased = await ctx.db
            .query("inventoryMovements")
            .withIndex("by_quote", (q: any) => q.eq("quoteId", quoteId))
            .filter((q: any) =>
                q.and(
                    q.eq(q.field("type"), "released"),
                    q.eq(q.field("productId"), item.productId),
                )
            )
            .first();
        if (alreadyReleased) continue;

        const product = await ctx.db.get(item.productId);
        if (!product) continue;
        await ctx.db.patch(item.productId, {
            stock: product.stock + reserved.quantity,
            updatedAt: Date.now(),
        });
        await ctx.db.insert("inventoryMovements", {
            productId: item.productId,
            quoteId,
            actorId,
            type: "released",
            quantity: reserved.quantity,
            note: `Libertação da cotação ${quoteId}`,
            createdAt: Date.now(),
        });
    }
}

async function markFulfilled(ctx: any, quoteId: any, items: any[], actorId: any) {
    for (const item of items) {
        if (!item.productId) continue;
        const fulfilled = await ctx.db
            .query("inventoryMovements")
            .withIndex("by_quote", (q: any) => q.eq("quoteId", quoteId))
            .filter((q: any) =>
                q.and(
                    q.eq(q.field("type"), "fulfilled"),
                    q.eq(q.field("productId"), item.productId),
                )
            )
            .first();
        if (fulfilled) continue;
        await ctx.db.insert("inventoryMovements", {
            productId: item.productId,
            quoteId,
            actorId,
            type: "fulfilled",
            quantity: item.quantity,
            note: `Cotação ${quoteId} executada`,
            createdAt: Date.now(),
        });
    }
}

// ============ PUBLIC ============

// Create a quote request (public lead form, rate limited)
export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        phone: v.string(),
        company: v.optional(v.string()),
        message: v.optional(v.string()),
        source: v.union(
            v.literal("store"),
            v.literal("site"),
            v.literal("contact"),
            v.literal("whatsapp"),
        ),
        items: v.array(v.object({
            productId: v.optional(v.id("products")),
            name: v.string(),
            sku: v.optional(v.string()),
            image: v.optional(v.string()),
            quantity: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const email = normalizeEmail(args.email);
        const phone = validatePhone(args.phone);
        const name = validateText(args.name, "Nome", 120);
        if (args.company) validateText(args.company, "Empresa", 120);
        if (args.message) validateText(args.message, "Mensagem", 2000);

        if (args.items.length === 0 || args.items.length > MAX_ITEMS) {
            throw new Error(`A cotação deve ter entre 1 e ${MAX_ITEMS} itens`);
        }
        for (const item of args.items) {
            validatePositiveQuantity(item.quantity);
            if (!item.name.trim() || item.name.length > 200) {
                throw new Error("Item com nome inválido");
            }
        }

        // Rate limit: max 3 requests per hour per email
        const hourAgo = Date.now() - 3600000;
        const recent = await ctx.db
            .query("quoteRequests")
            .withIndex("by_email", (q: any) => q.eq("email", email))
            .filter((q: any) => q.gte(q.field("createdAt"), hourAgo))
            .collect();
        if (recent.length >= RATE_LIMIT_PER_HOUR) {
            throw new Error("Muitos pedidos. Tente novamente mais tarde.");
        }

        let publicId = generatePublicId();
        while (await ctx.db.query("quoteRequests").withIndex("by_publicId", (q: any) => q.eq("publicId", publicId)).first()) {
            publicId = generatePublicId();
        }

        const now = Date.now();
        const quoteId = await ctx.db.insert("quoteRequests", {
            publicId,
            status: "new",
            name,
            email,
            phone,
            company: args.company,
            message: args.message,
            source: args.source,
            createdAt: now,
            updatedAt: now,
        });

        for (const item of args.items) {
            await ctx.db.insert("quoteItems", {
                quoteId,
                productId: item.productId,
                name: item.name,
                sku: item.sku,
                image: item.image ?? "",
                quantity: item.quantity,
                createdAt: now,
            });
        }

        // Auto task for the sales team
        await ctx.db.insert("quoteTasks", {
            quoteId,
            title: "Contactar o cliente",
            status: "todo",
            createdAt: now,
        });

        await notifyStaffNewQuote(ctx, quoteId, publicId);

        return { publicId, quoteId };
    },
});

// Get a quote by its opaque public id (public confirmation page)
export const getByPublicId = query({
    args: { publicId: v.string() },
    handler: async (ctx, args) => {
        if (args.publicId.length > 32) return null;
        const quote = await ctx.db
            .query("quoteRequests")
            .withIndex("by_publicId", (q: any) => q.eq("publicId", args.publicId))
            .first();
        if (!quote) return null;

        const items = await ctx.db
            .query("quoteItems")
            .withIndex("by_quote", (q: any) => q.eq("quoteId", quote._id))
            .collect();

        return { quote, items };
    },
});

// Quotes submitted with this account email (authenticated customer)
export const getMine = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const user = await checkAuthenticated(ctx, args.token);
        const quotes = await ctx.db
            .query("quoteRequests")
            .withIndex("by_email", (q: any) => q.eq("email", user.email))
            .order("desc")
            .take(50);
        return quotes;
    },
});

// ============ STAFF ============

export const listPaginated = query({
    args: {
        token: v.string(),
        paginationOpts: paginationOptsValidator,
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "quotes:read");
        const q = args.status && args.status !== "all" && QUOTE_STATUSES.includes(args.status as any)
            ? ctx.db.query("quoteRequests").withIndex("by_status_createdAt", (qq) => qq.eq("status", args.status as any)).order("desc")
            : ctx.db.query("quoteRequests").order("desc");
        return await q.paginate(args.paginationOpts);
    },
});

export const getById = query({
    args: { token: v.string(), id: v.id("quoteRequests") },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "quotes:read");
        const quote = await ctx.db.get(args.id);
        if (!quote) return null;

        const [items, tasks, movements] = await Promise.all([
            ctx.db.query("quoteItems").withIndex("by_quote", (q: any) => q.eq("quoteId", args.id)).collect(),
            ctx.db.query("quoteTasks").withIndex("by_quote", (q: any) => q.eq("quoteId", args.id)).collect(),
            ctx.db.query("inventoryMovements").withIndex("by_quote", (q: any) => q.eq("quoteId", args.id)).collect(),
        ]);

        return { quote, items, tasks, movements };
    },
});

export const getStats = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "quotes:read");
        const all = await ctx.db.query("quoteRequests").collect();
        const stats: Record<string, number> = {
            total: all.length,
            new: 0,
            qualified: 0,
            proposal_sent: 0,
            negotiating: 0,
            accepted: 0,
            lost: 0,
            cancelled: 0,
            fulfilled: 0,
        };
        for (const q of all) {
            stats[q.status] = (stats[q.status] || 0) + 1;
        }
        return stats;
    },
});

export const getMovementsForProduct = query({
    args: { token: v.string(), productId: v.id("products") },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "quotes:read");
        return await ctx.db
            .query("inventoryMovements")
            .withIndex("by_product", (q: any) => q.eq("productId", args.productId))
            .order("desc")
            .collect();
    },
});

export const assign = mutation({
    args: {
        token: v.string(),
        id: v.id("quoteRequests"),
        assignedTo: v.optional(v.id("users")),
        nextFollowUpAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await requirePermission(ctx, args.token, "quotes:manage");
        await ctx.db.patch(args.id, {
            assignedTo: args.assignedTo,
            nextFollowUpAt: args.nextFollowUpAt,
            updatedAt: Date.now(),
        });
        await writeAuditLog(ctx, user._id, "quotes.assigned", "quoteRequests", args.id,
            `Responsável: ${args.assignedTo ?? "não atribuído"}`);
    },
});

export const setFollowUp = mutation({
    args: {
        token: v.string(),
        id: v.id("quoteRequests"),
        nextFollowUpAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await requirePermission(ctx, args.token, "quotes:manage");
        await ctx.db.patch(args.id, {
            nextFollowUpAt: args.nextFollowUpAt,
            updatedAt: Date.now(),
        });
        await writeAuditLog(ctx, user._id, "quotes.follow_up", "quoteRequests", args.id,
            args.nextFollowUpAt ? `Seguimento: ${new Date(args.nextFollowUpAt).toISOString()}` : "Seguimento removido");
    },
});

export const setProposal = mutation({
    args: {
        token: v.string(),
        id: v.id("quoteRequests"),
        proposalNote: v.string(),
        quotedTotal: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await requirePermission(ctx, args.token, "quotes:manage");
        if (args.quotedTotal < 0) throw new Error("Total inválido");
        await ctx.db.patch(args.id, {
            proposalNote: args.proposalNote.slice(0, 4000),
            quotedTotal: args.quotedTotal,
            status: "proposal_sent",
            updatedAt: Date.now(),
        });
        await writeAuditLog(ctx, user._id, "quotes.proposal", "quoteRequests", args.id,
            `Proposta enviada: ${args.quotedTotal}`);
    },
});

export const setStatus = mutation({
    args: {
        token: v.string(),
        id: v.id("quoteRequests"),
        status: v.union(...QUOTE_STATUSES.map((s) => v.literal(s))),
    },
    handler: async (ctx, args) => {
        const user = await requirePermission(ctx, args.token, "quotes:manage");
        const quote = await ctx.db.get(args.id);
        if (!quote) throw new Error("Cotação não encontrada");

        const items = await ctx.db
            .query("quoteItems")
            .withIndex("by_quote", (q: any) => q.eq("quoteId", args.id))
            .collect();

        const updates: Record<string, unknown> = { status: args.status, updatedAt: Date.now() };

        if (args.status === "accepted") {
            const errors = await reserveStock(ctx, args.id, items, user._id);
            if (errors.length > 0) {
                throw new Error("Não foi possível aceitar: " + errors.join("; "));
            }
            updates.acceptedAt = Date.now();
        }

        if ((args.status === "cancelled" || args.status === "lost") && quote.status === "accepted") {
            await releaseStock(ctx, args.id, items, user._id);
        }

        if (args.status === "fulfilled") {
            await markFulfilled(ctx, args.id, items, user._id);
            updates.fulfilledAt = Date.now();
        }

        await ctx.db.patch(args.id, updates);
        await writeAuditLog(ctx, user._id, "quotes.status", "quoteRequests", args.id,
            `${quote.status} -> ${args.status}`);
    },
});

export const addTask = mutation({
    args: {
        token: v.string(),
        quoteId: v.id("quoteRequests"),
        title: v.string(),
        assignedTo: v.optional(v.id("users")),
        dueAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await requirePermission(ctx, args.token, "quotes:manage");
        const title = validateText(args.title, "Título", 200);
        await ctx.db.insert("quoteTasks", {
            quoteId: args.quoteId,
            title,
            assignedTo: args.assignedTo,
            dueAt: args.dueAt,
            status: "todo",
            createdBy: user._id,
            createdAt: Date.now(),
        });
    },
});

export const updateTask = mutation({
    args: {
        token: v.string(),
        taskId: v.id("quoteTasks"),
        status: v.union(v.literal("todo"), v.literal("done"), v.literal("cancelled")),
    },
    handler: async (ctx, args) => {
        const user = await requirePermission(ctx, args.token, "quotes:manage");
        await ctx.db.patch(args.taskId, {
            status: args.status,
            completedAt: args.status === "done" ? Date.now() : undefined,
        });
        await writeAuditLog(ctx, user._id, "quotes.task", "quoteTasks", args.taskId,
            `Estado: ${args.status}`);
    },
});

export const remove = mutation({
    args: { token: v.string(), id: v.id("quoteRequests") },
    handler: async (ctx, args) => {
        const user = await requirePermission(ctx, args.token, "quotes:manage");
        const quote = await ctx.db.get(args.id);
        if (!quote) throw new Error("Cotação não encontrada");
        if (quote.status === "accepted" || quote.status === "fulfilled") {
            throw new Error("Cotações aceites/executadas são preservadas para histórico");
        }
        await ctx.db.delete(args.id);
        await writeAuditLog(ctx, user._id, "quotes.deleted", "quoteRequests", args.id);
    },
});

// Internal: full quote data for email action
export const getQuoteInternal = internalQuery({
    args: { quoteId: v.id("quoteRequests") },
    handler: async (ctx, args) => {
        const quote = await ctx.db.get(args.quoteId);
        if (!quote) return null;
        const items = await ctx.db
            .query("quoteItems")
            .withIndex("by_quote", (q) => q.eq("quoteId", args.quoteId))
            .collect();
        return { quote, items };
    },
});
