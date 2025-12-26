import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users table
    users: defineTable({
        clerkId: v.optional(v.string()),
        email: v.string(),
        name: v.string(),
        phone: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_clerkId", ["clerkId"]),

    // Products table
    products: defineTable({
        name: v.string(),
        slug: v.string(),
        description: v.string(),
        fullDescription: v.optional(v.string()),
        price: v.number(),
        oldPrice: v.optional(v.number()),
        image: v.string(),
        images: v.optional(v.array(v.string())),
        category: v.string(),
        specs: v.optional(v.array(v.object({
            label: v.string(),
            value: v.string(),
        }))),
        stock: v.number(),
        isNew: v.boolean(),
        isActive: v.boolean(),
        rating: v.number(),
        reviewCount: v.number(),
        createdAt: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_category", ["category"])
        .index("by_active", ["isActive"]),

    // Cart items table
    cartItems: defineTable({
        userId: v.id("users"),
        productId: v.id("products"),
        quantity: v.number(),
        addedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_product", ["userId", "productId"]),

    // Orders table
    orders: defineTable({
        userId: v.id("users"),
        orderNumber: v.string(),
        status: v.union(
            v.literal("pending"),
            v.literal("paid"),
            v.literal("processing"),
            v.literal("shipped"),
            v.literal("delivered"),
            v.literal("cancelled")
        ),
        items: v.array(v.object({
            productId: v.id("products"),
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
        }),
        paymentMethod: v.string(),
        paymentReference: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"])
        .index("by_orderNumber", ["orderNumber"]),

    // Contact messages table
    contacts: defineTable({
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        company: v.optional(v.string()),
        subject: v.string(),
        message: v.string(),
        isRead: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_read", ["isRead"]),

    // Portfolio projects table
    projects: defineTable({
        title: v.string(),
        slug: v.string(),
        category: v.string(),
        tags: v.array(v.string()),
        image: v.string(),
        images: v.optional(v.array(v.string())),
        client: v.optional(v.string()),
        year: v.optional(v.string()),
        fullDescription: v.string(),
        challenge: v.string(),
        solution: v.string(),
        results: v.array(v.string()),
        isActive: v.boolean(),
        order: v.number(),
        createdAt: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_category", ["category"])
        .index("by_active", ["isActive"]),

    // Blog articles table
    articles: defineTable({
        title: v.string(),
        slug: v.string(),
        category: v.string(),
        excerpt: v.string(),
        content: v.string(),
        image: v.string(),
        author: v.string(),
        authorRole: v.optional(v.string()),
        authorImage: v.optional(v.string()),
        readTime: v.string(),
        isPublished: v.boolean(),
        publishedAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_category", ["category"])
        .index("by_published", ["isPublished"]),

    // Services table
    services: defineTable({
        title: v.string(),
        slug: v.string(),
        subtitle: v.string(),
        description: v.string(),
        icon: v.string(),
        image: v.string(),
        features: v.array(v.string()),
        benefits: v.array(v.object({
            title: v.string(),
            desc: v.string(),
            icon: v.string(),
        })),
        process: v.array(v.object({
            step: v.string(),
            title: v.string(),
            desc: v.string(),
        })),
        ctaText: v.string(),
        isActive: v.boolean(),
        order: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_active", ["isActive"]),
});
