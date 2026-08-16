import { QueryCtx, MutationCtx } from "./_generated/server";
import { Permission, hasPermission, normalizeRole } from "./permissions";

/**
 * Checks if a user is an admin via session token.
 * Throws an error if not authenticated or not an admin.
 */
export async function checkAdmin(ctx: QueryCtx | MutationCtx, token: string | undefined) {
    if (!token) {
        throw new Error("Não autenticado: Sessão expirada ou inválida");
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_session_token", (q) => q.eq("sessionToken", token))
        .first();

    if (!user) {
        throw new Error("Sessão inválida: Por favor, faça login novamente");
    }

    if (user.tokenExpiry && user.tokenExpiry < Date.now()) {
        throw new Error("Sessão expirada: Por favor, faça login novamente");
    }

    if (user.role !== "admin") {
        throw new Error("Acesso negado: Requer permissões de administrador");
    }

    return user;
}

export async function requirePermission(
    ctx: QueryCtx | MutationCtx,
    token: string | undefined,
    permission: Permission,
) {
    const user = await checkAuthenticated(ctx, token);

    if (!hasPermission(user.role, permission)) {
        throw new Error("Acesso negado: permissões insuficientes");
    }

    return user;
}

/**
 * Requires any staff role (admin, commercial, content or operations).
 * Used for dashboards and shared backoffice views.
 */
export async function requireStaff(ctx: QueryCtx | MutationCtx, token: string | undefined) {
    const user = await checkAuthenticated(ctx, token);

    if (normalizeRole(user.role) === "user") {
        throw new Error("Acesso negado: requer função de equipa");
    }

    return user;
}

/**
 * Checks if a user is authenticated via session token.
 * Throws an error if not authenticated.
 */
export async function checkAuthenticated(ctx: QueryCtx | MutationCtx, token: string | undefined) {
    if (!token) {
        throw new Error("Não autenticado: Sessão expirada ou inválida");
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_session_token", (q) => q.eq("sessionToken", token))
        .first();

    if (!user) {
        throw new Error("Sessão inválida: Por favor, faça login novamente");
    }

    if (user.tokenExpiry && user.tokenExpiry < Date.now()) {
        throw new Error("Sessão expirada: Por favor, faça login novamente");
    }

    return user;
}
