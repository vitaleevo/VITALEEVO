/**
 * Cliente HTTP da API Django (Postgres) — substitui o Convex no frontend.
 *
 * Convenções:
 * - Todas as respostas são convertidas de snake_case → camelCase.
 * - Campos comuns: id (string), created_at → createdAt, updated_at → updatedAt.
 * - O token JWT é lido de sessionStorage (vitaleevo_auth.user.token) e renovado
 *   automaticamente com o refresh token quando recebe 401.
 */
import type { SiteConfig } from "./api";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100";

export const AUTH_STORAGE_KEY = "vitaleevo_auth";

export class ApiError extends Error {
    status: number;
    details: Record<string, unknown> | null;

    constructor(status: number, message: string, details: Record<string, unknown> | null = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}

export function getStoredAuth(): { token: string; refreshToken?: string } | null {
    try {
        const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.token) return null;
        return { token: parsed.token, refreshToken: parsed.refreshToken };
    } catch {
        return null;
    }
}

export function setStoredAuth(auth: { token: string; refreshToken?: string }) {
    try {
        const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...parsed, ...auth }));
    } catch {
        // storage indisponível — ignora
    }
}

export function clearStoredAuth() {
    try {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
        // ignora
    }
}

function toCamel(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(toCamel);
    if (value === null || typeof value !== "object") return value;
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        const camel = key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
        out[camel] = toCamel(val);
    }
    return out;
}

export interface RequestOptions {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    token?: string | null;
    params?: Record<string, unknown>;
    auth?: boolean; // enviar token do storage
    retried?: boolean;
}

export async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, token, params, auth = false, retried } = options;

    let url = `${API_BASE_URL}/api/v1${path}`;
    if (params) {
        const qs = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== "") qs.set(key, String(value));
        }
        const q = qs.toString();
        if (q) url += `?${q}`;
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    let usedToken = token;
    if (auth || usedToken) {
        const stored = getStoredAuth();
        if (!usedToken && stored) usedToken = stored.token;
        if (usedToken) headers.Authorization = `Bearer ${usedToken}`;
    }

    let response: Response;
    try {
        response = await fetch(url, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError(0, "Não foi possível ligar ao servidor. Verifique a sua ligação.");
    }

    // Renovação automática do token (uma tentativa)
    if (response.status === 401 && !retried && (auth || token)) {
        const stored = getStoredAuth();
        if (stored?.refreshToken) {
            try {
                const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: stored.refreshToken }),
                });
                if (refreshRes.ok) {
                    const { access } = await refreshRes.json();
                    setStoredAuth({ token: access, refreshToken: stored.refreshToken });
                    return request<T>(path, { ...options, retried: true });
                }
                clearStoredAuth();
            } catch {
                // refresh falhou — segue com o erro original
            }
        }
    }

    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
        let message = `Erro ${response.status}`;
        let details: Record<string, unknown> | null = null;
        if (data && typeof data === "object") {
            details = data as Record<string, unknown>;
            if (typeof data.detail === "string") message = data.detail;
            else if (typeof data.message === "string") message = data.message;
            else {
                const first = Object.values(data).find(v => v !== null && v !== undefined);
                if (Array.isArray(first)) message = String(first[0]);
                else if (typeof first === "string") message = first;
            }
        }
        throw new ApiError(response.status, message, details);
    }

    return data === null ? (undefined as T) : (toCamel(data) as T);
}

export interface Paginated<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export function asPaginated<T>(data: unknown): Paginated<T> {
    const d = data as Paginated<T>;
    return { count: d.count ?? 0, next: d.next ?? null, previous: d.previous ?? null, results: d.results ?? [] };
}

/** Alias _id (Convex) → id (Django) para não tocar nos componentes. */
function withId<T extends Record<string, unknown>>(item: T): T & { _id: string } {
    return { ...item, _id: item.id as string };
}

function withCategoryAliases<T extends Record<string, unknown>>(item: T): T & { _id: string; parentSlug?: string } {
    const out = withId(item);
    if (out.parent === null || out.parent === undefined) {
        delete out.parentSlug;
        return out as never;
    }
    return { ...out, parentSlug: out.parent as string } as never;
}

export const api = {
    // ── Produtos ─────────────────────────────────────────────────────────
    products: {
        list: (params: Record<string, unknown> = {}) =>
            request<Paginated<Record<string, unknown>>>("/catalog/products/", { params }).then(d => {
                const page = asPaginated<Record<string, unknown>>(d);
                return {
                    ...page,
                    results: page.results.map(p => ({
                        ...withId(p),
                        category: (p as Record<string, unknown>).categoryName,
                        subcategory: (p as Record<string, unknown>).subcategoryName ?? null,
                        brand: (p as Record<string, unknown>).brandName ?? null,
                        price: Number((p as Record<string, unknown>).price ?? 0),
                        oldPrice: (p as Record<string, unknown>).oldPrice != null ? Number((p as Record<string, unknown>).oldPrice) : null,
                        rating: Number((p as Record<string, unknown>).rating ?? 0),
                        createdAt: (p as Record<string, unknown>).createdAt ?? (p as Record<string, unknown>).created_at,
                    })),
                };
            }),
        getBySlug: (slug: string, token?: string | null) =>
            request<Record<string, unknown>>(`/catalog/products/${slug}/`, { auth: !!token, token }).then(p => ({
                ...withId(p),
                category: p.categoryName as string,
                subcategory: (p.subcategoryName as string | null) ?? null,
                brand: (p.brandName as string | null) ?? null,
                price: Number(p.price ?? 0),
                oldPrice: p.oldPrice != null ? Number(p.oldPrice) : null,
                rating: Number(p.rating ?? 0),
            }) as any),
        create: (body: Record<string, unknown>, token: string) =>
            request("/catalog/products/", { method: "POST", body, token, auth: true }),
        update: (slug: string, body: Record<string, unknown>, token: string) =>
            request(`/catalog/products/${slug}/`, { method: "PATCH", body, token, auth: true }),
        remove: (slug: string, token: string) =>
            request(`/catalog/products/${slug}/`, { method: "DELETE", token, auth: true }),
        adjustStock: (slug: string, quantity: number, note: string, token: string) =>
            request(`/catalog/products/${slug}/adjust_stock/`, { method: "POST", body: { quantity, note }, token, auth: true }),
        getFeatured: (limit = 10) =>
            api.products.list({ is_featured: true, page_size: limit }).then(d => d.results),
    },

    // ── Categorias ───────────────────────────────────────────────────────
    categories: {
        getByType: (type: string) =>
            request<Paginated<Record<string, unknown>>>("/catalog/categories/", { params: { type } }).then(d =>
                asPaginated<Record<string, unknown>>(d).results.map(c => withCategoryAliases(c))
            ),
        create: (body: Record<string, unknown>, token: string) =>
            request("/catalog/categories/", { method: "POST", body, token, auth: true }),
        update: (slug: string, body: Record<string, unknown>, token: string) =>
            request(`/catalog/categories/${slug}/`, { method: "PATCH", body, token, auth: true }),
        remove: (slug: string, token: string) =>
            request(`/catalog/categories/${slug}/`, { method: "DELETE", token, auth: true }),
    },

    // ── Marcas ───────────────────────────────────────────────────────────
    brands: {
        list: () =>
            request<Paginated<Record<string, unknown>>>("/catalog/brands/", { params: { page_size: 100 } }).then(d => asPaginated<Record<string, unknown>>(d).results.map(withId)),
        create: (body: Record<string, unknown>, token: string) =>
            request("/catalog/brands/", { method: "POST", body, token, auth: true }),
        update: (slug: string, body: Record<string, unknown>, token: string) =>
            request(`/catalog/brands/${slug}/`, { method: "PATCH", body, token, auth: true }),
        remove: (slug: string, token: string) =>
            request(`/catalog/brands/${slug}/`, { method: "DELETE", token, auth: true }),
    },

    // ── Artigos (blog) ───────────────────────────────────────────────────
    articles: {
        list: (params: Record<string, unknown> = {}) =>
            request<Paginated<Record<string, unknown>>>("/blog/articles/", { params }).then(d => {
                const page = asPaginated<Record<string, unknown>>(d);
return {
                    ...page,
                    results: page.results.map(a => ({
                        ...withId(a),
                        category: (a as Record<string, unknown>).categoryName ?? (a as Record<string, unknown>).category,
                        createdAt: (a as Record<string, unknown>).publishedAt ?? (a as Record<string, unknown>).published_at,
                        publishedAt: (a as Record<string, unknown>).publishedAt ?? (a as Record<string, unknown>).published_at,
                    }) as any),
                };
            }),
        getPublished: (params: Record<string, unknown> = {}) =>
            api.articles.list({ ...params, status: undefined }).then(d => d.results),
        getFeatured: (limit = 5) =>
            api.articles.list({ is_featured: true, page_size: limit }).then(d => d.results),
        getBySlug: (slug: string) =>
            request<Record<string, unknown>>(`/blog/articles/${slug}/`).then(a => ({
                ...withId(a),
                category: (a as Record<string, unknown>).categoryName ?? (a as Record<string, unknown>).category,
                createdAt: (a as Record<string, unknown>).publishedAt ?? (a as Record<string, unknown>).published_at,
            }) as any),
        create: (body: Record<string, unknown>, token: string) =>
            request("/blog/articles/", { method: "POST", body, token, auth: true }),
        update: (slug: string, body: Record<string, unknown>, token: string) =>
            request(`/blog/articles/${slug}/`, { method: "PATCH", body, token, auth: true }),
        remove: (slug: string, token: string) =>
            request(`/blog/articles/${slug}/`, { method: "DELETE", token, auth: true }),
    },

    // ── Projetos (portfolio) ─────────────────────────────────────────────
    projects: {
        list: (params: Record<string, unknown> = {}) =>
            request<Paginated<Record<string, unknown>>>("/portfolio/projects/", { params }).then(d => {
                const page = asPaginated<Record<string, unknown>>(d);
                return {
                    ...page,
                    results: page.results.map(p => ({
                        ...withId(p),
                        category: (p as Record<string, unknown>).categoryName ?? (p as Record<string, unknown>).category,
                    }) as any),
                };
            }),
        getVisible: (params: Record<string, unknown> = {}) =>
            api.projects.list(params).then(d => d.results),
        getFeatured: (limit = 6) =>
            api.projects.list({ is_featured: true, page_size: limit }).then(d => d.results),
        getBySlug: (slug: string) =>
            request<Record<string, unknown>>(`/portfolio/projects/${slug}/`).then(p => ({
                ...withId(p),
                category: (p as Record<string, unknown>).categoryName ?? (p as Record<string, unknown>).category,
            }) as any),
        create: (body: Record<string, unknown>, token: string) =>
            request("/portfolio/projects/", { method: "POST", body, token, auth: true }),
        update: (slug: string, body: Record<string, unknown>, token: string) =>
            request(`/portfolio/projects/${slug}/`, { method: "PATCH", body, token, auth: true }),
        remove: (slug: string, token: string) =>
            request(`/portfolio/projects/${slug}/`, { method: "DELETE", token, auth: true }),
    },

    // ── Serviços ─────────────────────────────────────────────────────────
    services: {
        list: (params: Record<string, unknown> = {}) =>
            request<Paginated<Record<string, unknown>>>("/cms/services/", { params }).then(d => asPaginated<Record<string, unknown>>(d).results),
        getAll: () => api.services.list({ page_size: 100 }),
        create: (body: Record<string, unknown>, token: string) =>
            request("/cms/services/", { method: "POST", body, token, auth: true }),
        update: (slug: string, body: Record<string, unknown>, token: string) =>
            request(`/cms/services/${slug}/`, { method: "PATCH", body, token, auth: true }),
        remove: (slug: string, token: string) =>
            request(`/cms/services/${slug}/`, { method: "DELETE", token, auth: true }),
    },

    // ── Documentos legais ────────────────────────────────────────────────
    legal: {
        list: () =>
            request<Paginated<Record<string, unknown>>>("/cms/legal/").then(d => asPaginated<Record<string, unknown>>(d).results),
        getBySlug: (slug: string) =>
            request<Record<string, unknown>>(`/cms/legal/${slug}/`),
        upsert: (body: Record<string, unknown>, token: string) =>
            request("/cms/legal/", { method: "POST", body, token, auth: true }),
        remove: (slug: string, token: string) =>
            request(`/cms/legal/${slug}/`, { method: "DELETE", token, auth: true }),
    },

    // ── Settings ─────────────────────────────────────────────────────────
    settings: {
        get: () =>
            request<Record<string, unknown>>("/cms/settings/site_config/").then(d => d.value as SiteConfig),
        update: (value: Record<string, unknown>, token: string) =>
            request("/cms/settings/site_config/", { method: "PATCH", body: { value }, token, auth: true }),
    },

    // ── Contactos / Newsletter ───────────────────────────────────────────
    contacts: {
        submit: (body: Record<string, unknown>) => request("/cms/contacts/", { method: "POST", body }),
        list: (token: string) =>
            request<Paginated<Record<string, unknown>>>("/cms/contacts/", { auth: true, token }).then(d => asPaginated<Record<string, unknown>>(d).results),
        markAsRead: (id: string, token: string) =>
            request(`/cms/contacts/${id}/`, { method: "PATCH", body: { is_read: true }, token, auth: true }),
        remove: (id: string, token: string) =>
            request(`/cms/contacts/${id}/`, { method: "DELETE", token, auth: true }),
    },
    newsletter: {
        subscribe: (email: string) => request("/cms/newsletters/", { method: "POST", body: { email } }),
        unsubscribe: (email: string) => request("/cms/newsletters/unsubscribe/", { method: "POST", body: { email } }),
        list: (token: string) =>
            request<Paginated<Record<string, unknown>>>("/cms/newsletters/", { auth: true, token }).then(d => asPaginated<Record<string, unknown>>(d).results),
        remove: (id: string, token: string) =>
            request(`/cms/newsletters/${id}/`, { method: "DELETE", token, auth: true }),
    },

    // ── Cotações ─────────────────────────────────────────────────────────
    quotes: {
        create: (body: Record<string, unknown>) =>
            request<{ public_id: string; status: string }>("/quotes/", { method: "POST", body }).then(d => ({
                publicId: d.public_id,
                status: d.status,
            })),
        getByPublicId: (publicId: string) => request<Record<string, unknown>>(`/quotes/${publicId}/`),
        list: (token: string, params: Record<string, unknown> = {}) =>
            request<Paginated<Record<string, unknown>>>("/quotes/manage/", { auth: true, token, params }).then(d => asPaginated<Record<string, unknown>>(d)),
        getStats: (token: string) => request("/quotes/manage/stats/", { auth: true, token }),
        assign: (id: string, token: string) => request(`/quotes/manage/${id}/assign/`, { method: "POST", token, auth: true }),
        setStatus: (id: string, status: string, token: string) =>
            request(`/quotes/manage/${id}/status/`, { method: "POST", body: { status }, token, auth: true }),
        setFollowUp: (id: string, date: string, token: string) =>
            request(`/quotes/manage/${id}/follow_up/`, { method: "POST", body: { next_follow_up_at: date }, token, auth: true }),
        setProposal: (id: string, body: Record<string, unknown>, token: string) =>
            request(`/quotes/manage/${id}/proposal/`, { method: "POST", body, token, auth: true }),
    },

    // ── Utilizadores ─────────────────────────────────────────────────────
    users: {
        list: (token: string) =>
            request<Paginated<Record<string, unknown>>>("/auth/users/", { auth: true, token }).then(d => asPaginated<Record<string, unknown>>(d).results),
        create: (body: Record<string, unknown>, token: string) =>
            request("/auth/users/", { method: "POST", body, token, auth: true }),
        update: (id: string, body: Record<string, unknown>, token: string) =>
            request(`/auth/users/${id}/`, { method: "PATCH", body, token, auth: true }),
        remove: (id: string, token: string) =>
            request(`/auth/users/${id}/`, { method: "DELETE", token, auth: true }),
        resetPassword: (id: string, password: string, token: string) =>
            request(`/auth/users/${id}/reset_password/`, { method: "POST", body: { password }, token, auth: true }),
        getStaffList: (token: string) =>
            request<Paginated<Record<string, unknown>>>("/auth/users/", { auth: true, token }).then(d => asPaginated<Record<string, unknown>>(d).results),
    },

    // ── Auth ─────────────────────────────────────────────────────────────
    auth: {
        login: async (email: string, password: string) => {
            const data = await request<{ access: string; refresh: string }>("/auth/login/", {
                method: "POST",
                body: { email, password },
            });
            return data;
        },
        me: (token: string) => request<Record<string, unknown>>("/auth/me/", { auth: true, token }),
        updateProfile: (body: Record<string, unknown>, token: string) =>
            request("/auth/me/", { method: "PATCH", body, token, auth: true }),
        changePassword: (oldPassword: string, newPassword: string, token: string) =>
            request("/auth/change-password/", { method: "POST", body: { old_password: oldPassword, new_password: newPassword }, token, auth: true }),
        requestPasswordReset: (email: string) => request("/auth/password-reset/", { method: "POST", body: { email } }),
        resetPassword: (email: string, token: string, password: string) =>
            request("/auth/password-reset/confirm/", { method: "POST", body: { email, token, password } }),
    },

    // ── Conta (comércio) ─────────────────────────────────────────────────
    addresses: {
        list: (token: string) =>
            request<Record<string, unknown>[]>("/commerce/addresses/", { auth: true, token }).then(list =>
                list.map(a => ({
                    ...withId(a),
                    isDefault: Boolean((a as Record<string, unknown>).isDefault),
                }) as any)
            ),
        create: (body: Record<string, unknown>, token: string) =>
            request("/commerce/addresses/", { method: "POST", body, token, auth: true }),
        update: (id: string, body: Record<string, unknown>, token: string) =>
            request(`/commerce/addresses/${id}/`, { method: "PATCH", body, token, auth: true }),
        remove: (id: string, token: string) => request(`/commerce/addresses/${id}/`, { method: "DELETE", token, auth: true }),
        setDefault: (id: string, token: string) =>
            request(`/commerce/addresses/${id}/set_default/`, { method: "POST", token, auth: true }),
    },
    wishlist: {
        list: (token: string) =>
            request<Record<string, unknown>[]>("/commerce/wishlist/", { auth: true, token }).then(list =>
                list.map(item => ({
                    ...withId(item),
                    product: {
                        ...withId((item as Record<string, unknown>).product as Record<string, unknown>),
                        price: Number(((item as Record<string, unknown>).product as Record<string, unknown>)?.price ?? 0),
                    },
                }) as any)
            ),
        toggle: (slug: string, token: string) =>
            request<{ favorited: boolean }>("/commerce/wishlist/toggle/", { method: "POST", body: { product: slug }, token, auth: true }),
        isFavorited: (slug: string, token: string) =>
            request<{ favorited: boolean }>("/commerce/wishlist/is_favorited/", { params: { product: slug }, token, auth: true }),
        remove: (id: string, token: string) => request(`/commerce/wishlist/${id}/`, { method: "DELETE", token, auth: true }),
    },
    notifications: {
        list: (token: string) =>
            request<Record<string, unknown>[]>("/commerce/notifications/", { auth: true, token }).then(list =>
                list.map(n => ({
                    ...withId(n),
                    status: (n as Record<string, unknown>).isRead ? "read" : "unread",
                }) as any)
            ),
        unreadCount: (token: string) =>
            request<{ count: number }>("/commerce/notifications/unread_count/", { auth: true, token }),
        markRead: (id: string, token: string) =>
            request(`/commerce/notifications/${id}/mark_read/`, { method: "POST", token, auth: true }),
        markAllRead: (token: string) =>
            request("/commerce/notifications/mark_all_read/", { method: "POST", token, auth: true }),
        remove: (id: string, token: string) => request(`/commerce/notifications/${id}/`, { method: "DELETE", token, auth: true }),
    },
    cart: {
        list: (token: string) => request<Record<string, unknown>[]>("/commerce/cart/", { auth: true, token }),
        add: (slug: string, quantity: number, token: string) =>
            request("/commerce/cart/", { method: "POST", body: { product_slug: slug, quantity }, token, auth: true }),
        updateQuantity: (id: string, quantity: number, token: string) =>
            request(`/commerce/cart/${id}/update_quantity/`, { method: "PATCH", body: { quantity }, token, auth: true }),
        remove: (id: string, token: string) => request(`/commerce/cart/${id}/`, { method: "DELETE", token, auth: true }),
        clear: (token: string) => request("/commerce/cart/clear/", { method: "POST", token, auth: true }),
        count: (token: string) => request<{ count: number }>("/commerce/cart/count/", { auth: true, token }),
    },
    orders: {
        create: (body: Record<string, unknown>) => request("/commerce/orders/", { method: "POST", body }),
        getByOrderNumber: (orderNumber: string, accessToken: string) =>
            request<Record<string, unknown>>(`/commerce/orders/by_number/?order_number=${encodeURIComponent(orderNumber)}&access_token=${encodeURIComponent(accessToken)}`).then(o => {
                const order = o as Record<string, unknown>;
                return {
                    ...withId(order),
                    subtotal: Number(order.subtotal ?? 0),
                    shipping: Number(order.shipping ?? 0),
                    total: Number(order.total ?? 0),
                    items: ((order.items ?? []) as Record<string, unknown>[]).map(i => ({
                        ...i,
                        productId: (i as Record<string, unknown>).productId ?? (i as Record<string, unknown>).product_id,
                        price: Number((i as Record<string, unknown>).price ?? 0),
                    })),
                } as any;
            }),
        getByUser: (token: string) =>
            request<Record<string, unknown>[]>("/commerce/orders/mine/", { auth: true, token }).then(list =>
                list.map(o => ({ ...withId(o), total: Number((o as Record<string, unknown>).total ?? 0) }) as any)
            ),
        getById: (id: string, token: string, accessToken?: string) =>
            request<Record<string, unknown>>(`/commerce/orders/${id}/`, { auth: !!token || !!accessToken, token, params: accessToken ? { access_token: accessToken } : undefined }).then(o => {
                const order = o as Record<string, unknown>;
                return {
                    ...withId(order),
                    subtotal: Number(order.subtotal ?? 0),
                    shipping: Number(order.shipping ?? 0),
                    total: Number(order.total ?? 0),
                    items: ((order.items ?? []) as Record<string, unknown>[]).map(i => ({
                        ...i,
                        productId: (i as Record<string, unknown>).productId ?? (i as Record<string, unknown>).product_id,
                        price: Number((i as Record<string, unknown>).price ?? 0),
                    })),
                } as any;
            }),
        list: (token: string, params: Record<string, unknown> = {}) =>
            request<Paginated<Record<string, unknown>>>("/commerce/orders/manage/", { auth: true, token, params }).then(d => asPaginated<Record<string, unknown>>(d)),
        getStats: (token: string) => request("/commerce/orders/manage/stats/", { auth: true, token }),
        updateStatus: (id: string, status: string, token: string) =>
            request(`/commerce/orders/manage/${id}/update_status/`, { method: "POST", body: { status }, token, auth: true }),
    },

    // ── Dashboard / misc ─────────────────────────────────────────────────
    dashboard: {
        getStats: (token: string) =>
            Promise.all([
                request<{ count: number }>("/catalog/products/", { auth: true, token, params: { page_size: 1 } }),
                request<{ count: number }>("/blog/articles/", { auth: true, token, params: { page_size: 1 } }),
                api.orders.getStats(token),
                api.quotes.getStats(token),
            ]).then(([products, articles, orders, quotes]) => ({
                totalProducts: products.count,
                totalArticles: articles.count,
                ...(orders as Record<string, unknown>),
                ...(quotes as Record<string, unknown>),
            })),
    },

    // ── Media ────────────────────────────────────────────────────────────
    media: {
        upload: async (file: File, token: string) => {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch(`${API_BASE_URL}/api/v1/media/upload/`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });
            const data = await res.json();
            if (!res.ok) {
                const first = Array.isArray(data.file) ? data.file[0] : data.detail;
                throw new ApiError(res.status, typeof first === "string" ? first : "Upload falhou", data);
            }
            return data as { url: string };
        },
    },
};

export type { SiteConfig };