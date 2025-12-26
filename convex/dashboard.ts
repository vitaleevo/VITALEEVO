import { query } from "./_generated/server";

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const orders = await ctx.db.query("orders").collect();
        const products = await ctx.db.query("products").collect();
        const users = await ctx.db.query("users").collect();
        const contacts = await ctx.db.query("contacts").collect();

        const totalSales = orders.reduce((acc, order) => acc + (order.status !== "cancelled" ? order.total : 0), 0);
        const pendingOrders = orders.filter(o => o.status === "pending").length;
        const outOfStock = products.filter(p => p.stock === 0).length;
        const unreadMessages = contacts.filter(c => !c.isRead).length;

        // Daily sales (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        }).reverse();

        const salesChart = last7Days.map(timestamp => {
            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === timestamp && o.status !== "cancelled";
            });
            return {
                date: new Date(timestamp).toLocaleDateString('pt-PT', { weekday: 'short' }),
                value: dayOrders.reduce((sum, o) => sum + o.total, 0)
            };
        });

        // Top products
        const productSales: Record<string, { name: string, total: number, image: string }> = {};
        orders.forEach(order => {
            if (order.status !== "cancelled") {
                order.items.forEach((item: any) => {
                    if (!productSales[item.productId]) {
                        productSales[item.productId] = { name: item.name, total: 0, image: item.image };
                    }
                    productSales[item.productId].total += item.price * item.quantity;
                });
            }
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.total - a.total)
            .slice(0, 4);

        return {
            totalSales,
            orderCount: orders.length,
            userCount: users.length,
            productCount: products.length,
            pendingOrders,
            outOfStock,
            unreadMessages,
            recentOrders: orders.slice(-5).reverse(),
            recentMessages: contacts.slice(-5).reverse(),
            salesChart,
            topProducts,
        };
    },
});
