import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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
        .filter(q => q.eq(q.field("sessionToken"), token))
        .unique();

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
        .filter(q => q.eq(q.field("sessionToken"), token))
        .unique();

    if (!user) {
        throw new Error("Sessão inválida: Por favor, faça login novamente");
    }

    if (user.tokenExpiry && user.tokenExpiry < Date.now()) {
        throw new Error("Sessão expirada: Por favor, faça login novamente");
    }

    return user;
}
