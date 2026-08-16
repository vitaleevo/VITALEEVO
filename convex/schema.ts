import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users table
    users: defineTable({
        email: v.string(),
        name: v.string(),
        passwordHash: v.string(),
        phone: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        role: v.optional(v.string()), // 'admin' or 'user'
        isActive: v.optional(v.boolean()),
        sessionToken: v.optional(v.string()), // For secure session validation
        tokenExpiry: v.optional(v.number()),
        resetToken: v.optional(v.string()), // For password recovery
        resetTokenExpiry: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_session_token", ["sessionToken"])
        .index("by_reset_token", ["resetToken"]),

    passwordResetRequests: defineTable({
        email: v.string(),
        requestedAt: v.number(),
    }).index("by_email", ["email"]),

    // Products table
    products: defineTable({
        name: v.string(),
        slug: v.string(),
        sku: v.optional(v.string()),
        description: v.string(),
        fullDescription: v.optional(v.string()),
        price: v.number(),
        oldPrice: v.optional(v.number()),
        image: v.string(),
        images: v.optional(v.array(v.string())),
        category: v.string(),
        brand: v.optional(v.string()),
        specs: v.optional(v.array(v.object({
            label: v.string(),
            value: v.string(),
        }))),
        stock: v.number(),
        isNew: v.boolean(),
        isActive: v.boolean(),
        status: v.optional(v.union(
            v.literal("draft"),
            v.literal("published"),
            v.literal("archived")
        )),
        isFeatured: v.optional(v.boolean()),
        rating: v.number(),
        reviewCount: v.number(),
        publishedAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_slug", ["slug"])
        .index("by_sku", ["sku"])
        .index("by_category", ["category"])
        .index("by_active", ["isActive"])
        .index("by_status", ["status"])
        .index("by_featured", ["isFeatured"]),

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
        userId: v.optional(v.id("users")), // Optional for guest orders
        guestEmail: v.optional(v.string()), // For guest orders
        guestName: v.optional(v.string()), // For guest orders
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
            productId: v.string(), // String to allow cart items without full product ID
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
        paymentReference: v.optional(v.string()),
        accessToken: v.optional(v.string()),
        notes: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"])
        .index("by_orderNumber", ["orderNumber"])
        .index("by_accessToken", ["accessToken"])
        .index("by_guestEmail", ["guestEmail"]),

    quoteRequests: defineTable({
        publicId: v.string(),
        status: v.union(
            v.literal("new"),
            v.literal("qualified"),
            v.literal("proposal_sent"),
            v.literal("negotiating"),
            v.literal("accepted"),
            v.literal("lost"),
            v.literal("cancelled"),
            v.literal("fulfilled")
        ),
        name: v.string(),
        email: v.string(),
        phone: v.string(),
        company: v.optional(v.string()),
        message: v.optional(v.string()),
        source: v.string(),
        assignedTo: v.optional(v.id("users")),
        nextFollowUpAt: v.optional(v.number()),
        proposalNote: v.optional(v.string()),
        quotedTotal: v.optional(v.number()),
        acceptedAt: v.optional(v.number()),
        fulfilledAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_publicId", ["publicId"])
        .index("by_status_createdAt", ["status", "createdAt"])
        .index("by_assignee_status", ["assignedTo", "status"])
        .index("by_email", ["email"]),

    quoteItems: defineTable({
        quoteId: v.id("quoteRequests"),
        productId: v.optional(v.id("products")),
        name: v.string(),
        sku: v.optional(v.string()),
        image: v.string(),
        quantity: v.number(),
        quotedUnitPrice: v.optional(v.number()),
        createdAt: v.number(),
    }).index("by_quote", ["quoteId"]),

    quoteTasks: defineTable({
        quoteId: v.id("quoteRequests"),
        title: v.string(),
        assignedTo: v.optional(v.id("users")),
        dueAt: v.optional(v.number()),
        status: v.union(v.literal("todo"), v.literal("done"), v.literal("cancelled")),
        createdBy: v.optional(v.id("users")),
        createdAt: v.number(),
        completedAt: v.optional(v.number()),
    })
        .index("by_quote", ["quoteId"])
        .index("by_assignee_status", ["assignedTo", "status"]),

    inventoryMovements: defineTable({
        productId: v.id("products"),
        quoteId: v.optional(v.id("quoteRequests")),
        actorId: v.id("users"),
        type: v.union(
            v.literal("adjustment"),
            v.literal("reserved"),
            v.literal("released"),
            v.literal("fulfilled")
        ),
        quantity: v.number(),
        note: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_product", ["productId"])
        .index("by_quote", ["quoteId"]),

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

    // User addresses table
    addresses: defineTable({
        userId: v.id("users"),
        label: v.string(), // "Casa", "Trabalho", etc.
        name: v.string(), // Receiver name
        phone: v.string(),
        city: v.string(),
        address: v.string(),
        reference: v.optional(v.string()),
        isDefault: v.boolean(),
        createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Wishlist table
    wishlist: defineTable({
        userId: v.id("users"),
        productId: v.id("products"),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_product", ["userId", "productId"]),

    // Notifications table
    notifications: defineTable({
        userId: v.id("users"),
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal("order"), v.literal("promo"), v.literal("system")),
        status: v.union(v.literal("unread"), v.literal("read")),
        metadata: v.optional(v.object({
            orderId: v.optional(v.string()),
            link: v.optional(v.string()),
        })),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["userId", "status"]),

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
        isFeatured: v.optional(v.boolean()),
        order: v.number(),
        createdAt: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_category", ["category"])
        .index("by_active", ["isActive"])
        .index("by_featured", ["isFeatured"]),

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
        status: v.optional(v.union(
            v.literal("draft"),
            v.literal("scheduled"),
            v.literal("published"),
            v.literal("archived")
        )),
        isFeatured: v.optional(v.boolean()),
        publishedAt: v.optional(v.number()),
        scheduledAt: v.optional(v.number()),
        seoTitle: v.optional(v.string()),
        seoDescription: v.optional(v.string()),
        deletedAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_category", ["category"])
        .index("by_published", ["isPublished"])
        .index("by_featured", ["isFeatured"]),

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
        status: v.optional(v.union(
            v.literal("draft"),
            v.literal("published"),
            v.literal("archived")
        )),
        seoTitle: v.optional(v.string()),
        seoDescription: v.optional(v.string()),
        updatedAt: v.optional(v.number()),
        order: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_active", ["isActive"]),

    // Categories table
    categories: defineTable({
        name: v.string(),
        slug: v.string(),
        type: v.string(), // 'store', 'blog', 'portfolio'
        description: v.optional(v.string()),
        order: v.number(),
        isActive: v.boolean(),
    })
        .index("by_type", ["type"])
        .index("by_slug", ["slug"])
        .index("by_active", ["isActive"]),

    // Brands table
    brands: defineTable({
        name: v.string(),
        slug: v.string(),
        logo: v.optional(v.string()),
        description: v.optional(v.string()),
        order: v.number(),
        isActive: v.boolean(),
    })
        .index("by_slug", ["slug"])
        .index("by_active", ["isActive"]),

    // Global settings table
    settings: defineTable({
        key: v.string(), // "site_config"
        siteName: v.string(),
        siteDescription: v.string(),
        contactEmail: v.string(),
        contactPhone: v.string(),
        whatsapp: v.string(),
        address: v.string(),
        socialLinks: v.object({
            instagram: v.optional(v.string()),
            facebook: v.optional(v.string()),
            linkedin: v.optional(v.string()),
            twitter: v.optional(v.string()),
        }),
        businessConfig: v.object({
            shippingFee: v.number(),
            minOrderForFreeShipping: v.optional(v.number()),
            maintenanceMode: v.boolean(),
            currency: v.string(),
        }),
        updatedAt: v.number(),
    }).index("by_key", ["key"]),

    sitePages: defineTable({
        slug: v.string(),
        title: v.string(),
        seoTitle: v.string(),
        seoDescription: v.string(),
        ogImage: v.optional(v.string()),
        status: v.union(v.literal("draft"), v.literal("published")),
        updatedBy: v.id("users"),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_slug", ["slug"]),

    siteBlocks: defineTable({
        pageId: v.id("sitePages"),
        type: v.union(
            v.literal("hero"),
            v.literal("stats"),
            v.literal("logos"),
            v.literal("services"),
            v.literal("projects"),
            v.literal("benefits"),
            v.literal("cta"),
            v.literal("richText")
        ),
        content: v.string(),
        order: v.number(),
        isVerified: v.boolean(),
        updatedAt: v.number(),
    }).index("by_page_order", ["pageId", "order"]),

    legalDocuments: defineTable({
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        status: v.union(v.literal("draft"), v.literal("published")),
        updatedBy: v.id("users"),
        updatedAt: v.number(),
    }).index("by_slug", ["slug"]),

    media: defineTable({
        storageId: v.id("_storage"),
        url: v.string(),
        filename: v.string(),
        contentType: v.string(),
        size: v.number(),
        purpose: v.union(v.literal("product"), v.literal("content"), v.literal("profile")),
        uploadedBy: v.id("users"),
        createdAt: v.number(),
    })
        .index("by_uploadedBy", ["uploadedBy"])
        .index("by_purpose", ["purpose"]),

    auditLogs: defineTable({
        actorId: v.id("users"),
        action: v.string(),
        entityType: v.string(),
        entityId: v.string(),
        details: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_actor", ["actorId"])
        .index("by_entity", ["entityType", "entityId"])
        .index("by_createdAt", ["createdAt"]),

    // Newsletter subscribers table
    newsletters: defineTable({
        email: v.string(),
        isActive: v.boolean(),
        subscribedAt: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_active", ["isActive"]),

    // API keys are encrypted before persistence. apiKey remains optional only
    // while legacy records are migrated.
    apiKeys: defineTable({
        provider: v.string(), // 'openai', 'gemini', 'anthropic', etc.
        encryptedApiKey: v.optional(v.string()),
        encryptionIv: v.optional(v.string()),
        keyLastFour: v.optional(v.string()),
        apiKey: v.optional(v.string()),
        isActive: v.boolean(), // Whether this key is currently in use
        label: v.optional(v.string()), // Optional friendly name
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_provider", ["provider"])
        .index("by_active", ["isActive"]),
});
