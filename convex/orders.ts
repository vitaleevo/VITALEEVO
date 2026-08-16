import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { requirePermission, checkAuthenticated } from "./utils";

// Generate unique order number
function generateOrderNumber(): string {
    const prefix = "VE";
    const random = Math.floor(Math.random() * 90000) + 10000;
    return `${prefix}-${random}`;
}

// Generate opaque access token for order confirmation links
function generateAccessToken(): string {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Get all orders for a user (Authenticated)
export const getByUser = query({
    args: { token: v.string(), userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await checkAuthenticated(ctx, args.token);

        // Ensure user is fetching their own orders or is admin
        if (user._id !== args.userId && user.role !== "admin") {
            throw new Error("Acesso não autorizado");
        }

        const orders = await ctx.db
            .query("orders")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();

        return orders;
    },
});

// Get single order by ID (Authenticated)
export const getById = query({
    args: { token: v.string(), orderId: v.id("orders") },
    handler: async (ctx, args) => {
        const user = await checkAuthenticated(ctx, args.token);
        const order = await ctx.db.get(args.orderId);

        if (!order) return null;

        // Check permissions
        if (order.userId !== user._id && user.role !== "admin" && order.guestEmail !== user.email) {
            throw new Error("Acesso não autorizado");
        }

        return order;
    },
});

// Get order by Order Number (requires opaque access token or ownership)
export const getByOrderNumber = query({
    args: {
        orderNumber: v.string(),
        accessToken: v.optional(v.string()),
        token: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const order = await ctx.db
            .query("orders")
            .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
            .first();

        if (!order) return null;

        // Opaque access token (from the confirmation page) grants access
        if (args.accessToken && order.accessToken && args.accessToken === order.accessToken) {
            return order;
        }

        // Otherwise require authenticated ownership or staff access
        const user = await checkAuthenticated(ctx, args.token);
        const isOwner = order.userId === user._id || order.guestEmail === user.email;
        if (!isOwner && user.role !== "admin") {
            throw new Error("Acesso não autorizado");
        }

        return order;
    },
});

// Create a new order (Public/Guest or Auth)
export const create = mutation({
    args: {
        userId: v.optional(v.id("users")),
        guestEmail: v.optional(v.string()),
        guestName: v.optional(v.string()),
        items: v.array(v.object({
            productId: v.string(),
            name: v.string(),
            price: v.number(),
            quantity: v.number(),
            image: v.string(),
        })),
        subtotal: v.number(),
        shipping: v.number(),
        total: v.number(),
        shippingAddress: v.object({
            name: v.string(),
            phone: v.string(),
            city: v.string(),
            address: v.string(),
            reference: v.optional(v.string()),
            nif: v.optional(v.string()),
        }),
        paymentMethod: v.string(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const orderNumber = generateOrderNumber();
        const accessToken = generateAccessToken();
        const now = Date.now();

        const orderId = await ctx.db.insert("orders", {
            ...args,
            orderNumber,
            accessToken,
            status: "pending",
            createdAt: now,
            updatedAt: now,
        });

        if (args.userId) {
            await ctx.db.insert("notifications", {
                userId: args.userId,
                title: "Pedido Recebido! 📦",
                message: `Seu pedido #${orderNumber} foi recebido e está aguardando confirmação de pagamento.`,
                type: "order",
                status: "unread",
                metadata: { orderId: orderId, link: `/conta/pedidos/${orderId}` },
                createdAt: now,
            });
        }

        return { orderId, orderNumber, accessToken };
    },
});

// Update order status (Admin only)
export const updateStatus = mutation({
    args: {
        token: v.string(),
        orderId: v.id("orders"),
        status: v.union(
            v.literal("pending"),
            v.literal("paid"),
            v.literal("processing"),
            v.literal("shipped"),
            v.literal("delivered"),
            v.literal("cancelled")
        ),
        paymentReference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "orders:read");

        const updates: Record<string, unknown> = {
            status: args.status,
            updatedAt: Date.now(),
        };

        if (args.paymentReference) {
            updates.paymentReference = args.paymentReference;
        }

        await ctx.db.patch(args.orderId, updates);

        const order = await ctx.db.get(args.orderId);
        if (order && order.userId) {
            let title = "";
            let message = "";

            switch (args.status) {
                case "paid":
                    title = "Pagamento Confirmado! ✅";
                    message = `O pagamento do pedido #${order.orderNumber} foi confirmado.`;
                    break;
                case "processing":
                    title = "Pedido em Preparação 🛠️";
                    message = `Estamos preparando os itens do seu pedido #${order.orderNumber}.`;
                    break;
                case "shipped":
                    title = "Pedido Enviado! 🚚";
                    message = `Seu pedido #${order.orderNumber} já está a caminho!`;
                    break;
                case "delivered":
                    title = "Pedido Entregue! 🎉";
                    message = `O pedido #${order.orderNumber} foi entregue com sucesso.`;
                    break;
                case "cancelled":
                    title = "Pedido Cancelado ⚠️";
                    message = `O pedido #${order.orderNumber} foi cancelado.`;
                    break;
            }

            if (title) {
                await ctx.db.insert("notifications", {
                    userId: order.userId,
                    title,
                    message,
                    type: "order",
                    status: "unread",
                    metadata: { orderId: order._id, link: `/conta/pedidos/${order._id}` },
                    createdAt: Date.now(),
                });
            }
        }
    },
});

// Admin Statistics (Admin only)
export const getStats = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "orders:read");
        const orders = await ctx.db.query("orders").collect();
        const now = Date.now();
        const stats = {
            totalRevenue: 0,
            pendingOrders: 0,
            ordersToday: 0,
            totalOrders: orders.length,
        };

        orders.forEach(order => {
            if (order.status !== 'cancelled') stats.totalRevenue += order.total;
            if (order.status === 'pending') stats.pendingOrders += 1;
            if (order.createdAt >= now - 86400000) stats.ordersToday += 1;
        });

        return stats;
    },
});

// Paginated orders (Admin only)
export const getPaginated = query({
    args: { token: v.string(), paginationOpts: paginationOptsValidator, status: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "orders:read");
        const q = args.status && args.status !== 'all'
            ? ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", args.status as any))
            : ctx.db.query("orders").order("desc");

        return await q.paginate(args.paginationOpts);
    },
});
