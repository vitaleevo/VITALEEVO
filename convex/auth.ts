import { action, internalMutation, mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { checkAdmin, checkAuthenticated, requirePermission, requireStaff } from "./utils";
import { getPasswordValidationError, hashPassword, verifyPassword, isLegacyHash, randomToken } from "./password";
import { internal } from "./_generated/api";

// Session duration: 7 days
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
const RESET_REQUEST_WINDOW = 15 * 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register a new user
export const register = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (existingUser) {
            throw new ConvexError("Este e-mail já está cadastrado");
        }

        const passwordError = getPasswordValidationError(args.password);
        if (passwordError) throw new ConvexError(passwordError);

        const sessionToken = randomToken();
        const tokenExpiry = Date.now() + SESSION_DURATION;

        const userId = await ctx.db.insert("users", {
            email: args.email.toLowerCase(),
            name: args.name,
            passwordHash: await hashPassword(args.password),
            phone: args.phone,
            role: "user",
            isActive: true,
            sessionToken,
            tokenExpiry,
            createdAt: Date.now(),
        });

        return { success: true, userId, sessionToken };
    },
});

// Login user
export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (!user) {
            throw new ConvexError("E-mail ou senha incorretos");
        }

        if (!(await verifyPassword(args.password, user.passwordHash))) {
            throw new ConvexError("E-mail ou senha incorretos");
        }

        if (user.isActive === false) {
            throw new ConvexError("Conta desativada");
        }

        // Transparent migration: upgrade legacy hashes to bcrypt on successful login
        if (isLegacyHash(user.passwordHash)) {
            const passwordHash = await hashPassword(args.password);
            await ctx.db.patch(user._id, { passwordHash });
        }

        const sessionToken = randomToken();
        const tokenExpiry = Date.now() + SESSION_DURATION;

        await ctx.db.patch(user._id, {
            sessionToken,
            tokenExpiry
        });

        return {
            success: true,
            userId: user._id,
            sessionToken,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role || "user",
            avatarUrl: user.avatarUrl,
        };
    },
});

// Get user by ID (Authenticated)
// Returns null if session is invalid (allows graceful logout on client)
export const getById = query({
    args: { userId: v.string(), token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        // Validate token manually without throwing
        if (!args.token) {
            return null;
        }

        const sessionUser = await ctx.db
            .query("users")
            .withIndex("by_session_token", (q) => q.eq("sessionToken", args.token))
            .first();

        if (!sessionUser) {
            return null; // Invalid session - let client handle logout
        }

        if (sessionUser.tokenExpiry && sessionUser.tokenExpiry < Date.now()) {
            return null; // Expired session
        }

        // Ensure the requester is asking for their own data OR is an admin
        if (sessionUser._id !== args.userId && sessionUser.role !== "admin") {
            return null; // Access denied
        }

        const targetId = ctx.db.normalizeId("users", args.userId);
        if (!targetId) return null;

        const target = await ctx.db.get(targetId);
        if (!target) return null;

        return {
            _id: target._id,
            email: target.email,
            name: target.name,
            phone: target.phone,
            avatarUrl: target.avatarUrl,
            role: target.role || "user",
            createdAt: target.createdAt,
        };
    },
});

// Update user profile (Authenticated)
export const updateProfile = mutation({
    args: {
        token: v.string(),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await checkAuthenticated(ctx, args.token);
        const { token, ...updates } = args;

        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(user._id, cleanUpdates);
        return { success: true };
    },
});

// Change password (Authenticated)
export const changePassword = mutation({
    args: {
        token: v.string(),
        currentPassword: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await checkAuthenticated(ctx, args.token);

        if (!(await verifyPassword(args.currentPassword, user.passwordHash))) {
            throw new ConvexError("Senha atual incorreta");
        }

        const passwordError = getPasswordValidationError(args.newPassword);
        if (passwordError) throw new ConvexError(passwordError);

        await ctx.db.patch(user._id, {
            passwordHash: await hashPassword(args.newPassword),
        });

        return { success: true };
    },
});

// Check if user is admin (Authenticated)
export const isAdmin = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        try {
            const user = await checkAdmin(ctx, args.token);
            return !!user;
        } catch {
            return false;
        }
    },
});

// Check if user is staff (any backoffice role) (Authenticated)
export const isStaff = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        try {
            const user = await requireStaff(ctx, args.token);
            return { isStaff: true, role: user.role, name: user.name };
        } catch {
            return { isStaff: false, role: "user", name: null };
        }
    },
});

// Get all users (Admin only)
export const getAllAdmin = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "users:manage");

        const users = await ctx.db
            .query("users")
            .order("desc")
            .collect();

        return users.map(user => ({
            _id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role || "user",
            isActive: user.isActive !== false,
            createdAt: user.createdAt,
            avatarUrl: user.avatarUrl,
        }));
    },
});

// Admin: Update any user fully (Admin only)
export const adminUpdateUser = mutation({
    args: {
        token: v.string(),
        userId: v.id("users"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        role: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "users:manage");
        const { token, userId, ...updates } = args;

        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        if (cleanUpdates.email) {
            cleanUpdates.email = (cleanUpdates.email as string).toLowerCase();
        }

        await ctx.db.patch(userId, cleanUpdates);
    },
});

// Admin: Force reset password (Admin only)
export const adminResetPassword = mutation({
    args: {
        token: v.string(),
        userId: v.id("users"),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "users:manage");
        const passwordError = getPasswordValidationError(args.newPassword);
        if (passwordError) throw new ConvexError(passwordError);

        const passwordHash = await hashPassword(args.newPassword);

        await ctx.db.patch(args.userId, {
            passwordHash,
            // Invalidate any existing sessions so the new password takes effect
            sessionToken: undefined,
            tokenExpiry: undefined,
        } as any);
    },
});
// Admin: Create new user (Admin only)
export const adminCreateUser = mutation({
    args: {
        token: v.string(),
        name: v.string(),
        email: v.string(),
        password: v.string(),
        phone: v.optional(v.string()),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.token, "users:manage");

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (existingUser) {
            throw new ConvexError("Este e-mail já está cadastrado");
        }

        const passwordError = getPasswordValidationError(args.password);
        if (passwordError) throw new ConvexError(passwordError);

        const sessionToken = randomToken();
        const tokenExpiry = Date.now() + SESSION_DURATION;

        await ctx.db.insert("users", {
            email: args.email.toLowerCase(),
            name: args.name,
            passwordHash: await hashPassword(args.password),
            phone: args.phone,
            role: args.role,
            isActive: true,
            sessionToken,
            tokenExpiry,
            createdAt: Date.now(),
        });

        return { success: true };
    },
});
export const createPasswordReset = internalMutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const now = Date.now();
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (!user) return null;

        const latestRequest = await ctx.db
            .query("passwordResetRequests")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();

        if (latestRequest && latestRequest.requestedAt > now - RESET_REQUEST_WINDOW) {
            return null;
        }

        if (latestRequest) {
            await ctx.db.patch(latestRequest._id, { requestedAt: now });
        } else {
            await ctx.db.insert("passwordResetRequests", {
                email: args.email.toLowerCase(),
                requestedAt: now,
            });
        }

        const resetToken = randomToken();
        const resetTokenExpiry = now + 3600000;

        await ctx.db.patch(user._id, {
            resetToken,
            resetTokenExpiry
        } as any);

        return { email: user.email, name: user.name, resetToken };
    },
});

export const requestPasswordReset = action({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const email = args.email.trim().toLowerCase();
        if (!EMAIL_PATTERN.test(email) || email.length > 254) {
            return { success: true };
        }

        const reset = await ctx.runMutation(internal.auth.createPasswordReset, { email });
        if (!reset) return { success: true };

        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.EMAIL_FROM;
        if (!apiKey || !from) {
            console.error("Password reset email is not configured");
            return { success: false };
        }

        const resetUrl = new URL("/recuperar-senha", process.env.SITE_URL || "https://vitaleevo.ao");
        resetUrl.searchParams.set("token", reset.resetToken);
        const safeName = reset.name.replace(/[&<>'\"]/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            "\"": "&quot;",
        }[character] || character));

        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from,
                    to: [reset.email],
                    subject: "Recuperação de Senha - VitalEvo",
                    html: `<p>Olá, ${safeName}!</p><p>Recebemos uma solicitação para redefinir a sua senha.</p><p><a href="${resetUrl.href}">Redefinir a minha senha</a></p><p>Este link expira em uma hora. Se não fez esta solicitação, ignore este e-mail.</p>`,
                }),
            });

            if (!response.ok) {
                console.error("Password reset email provider request failed", response.status);
                return { success: false };
            }
        } catch (error) {
            console.error("Password reset email provider request failed", error);
            return { success: false };
        }

        return { success: true };
    },
});

// Reset password with token
export const resetPassword = mutation({
    args: {
        token: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_reset_token", (q) => q.eq("resetToken", args.token))
            .first();

        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
            throw new ConvexError("Link de recuperação inválido ou expirado");
        }

        const passwordError = getPasswordValidationError(args.newPassword);
        if (passwordError) throw new ConvexError(passwordError);

        await ctx.db.patch(user._id, {
            passwordHash: await hashPassword(args.newPassword),
            resetToken: undefined,
            resetTokenExpiry: undefined,
            // Invalidate any existing sessions so the new password takes effect
            sessionToken: undefined,
            tokenExpiry: undefined,
        } as any);

        return { success: true };
    },
});
