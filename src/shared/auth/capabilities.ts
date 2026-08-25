export interface CapabilityUser {
    role?: string;
    isStaff?: boolean;
    isSuperuser?: boolean;
    permissions?: string[];
}

const IMPLIED_CAPABILITIES: Record<string, string[]> = {
    "catalog:read": ["catalog:manage"],
    "orders:read": ["orders:manage"],
    "quotes:read": ["quotes:manage"],
};

export function hasCapability(user: CapabilityUser | null | undefined, capability: string): boolean {
    if (!user?.isStaff) return false;
    if (user.role === "admin" || user.isSuperuser) return true;
    const permissions = user.permissions ?? [];
    return permissions.includes(capability)
        || (IMPLIED_CAPABILITIES[capability] ?? []).some(item => permissions.includes(item));
}

export function hasAnyCapability(
    user: CapabilityUser | null | undefined,
    capabilities: string[],
): boolean {
    return capabilities.some(capability => hasCapability(user, capability));
}

const ADMIN_ROUTE_CAPABILITIES: Array<{ prefix: string; anyOf: string[] }> = [
    { prefix: "/admin/products", anyOf: ["catalog:read"] },
    { prefix: "/admin/categories", anyOf: ["catalog:read"] },
    { prefix: "/admin/brands", anyOf: ["catalog:read"] },
    { prefix: "/admin/import", anyOf: ["catalog:import"] },
    { prefix: "/admin/orders", anyOf: ["orders:read"] },
    { prefix: "/admin/quotes", anyOf: ["quotes:read"] },
    { prefix: "/admin/contacts", anyOf: ["contacts:manage"] },
    { prefix: "/admin/newsletter", anyOf: ["contacts:manage"] },
    { prefix: "/admin/blog", anyOf: ["content:manage"] },
    { prefix: "/admin/portfolio", anyOf: ["content:manage"] },
    { prefix: "/admin/services", anyOf: ["content:manage"] },
    { prefix: "/admin/site", anyOf: ["content:manage"] },
    { prefix: "/admin/legal", anyOf: ["content:manage"] },
    { prefix: "/admin/users", anyOf: ["users:manage"] },
    { prefix: "/admin/audit", anyOf: ["audit:read"] },
    { prefix: "/admin/settings", anyOf: ["settings:manage"] },
    {
        prefix: "/admin/cms",
        anyOf: [
            "audit:read",
            "catalog:read",
            "catalog:import",
            "contacts:manage",
            "content:manage",
            "settings:manage",
            "users:manage",
        ],
    },
];

export function canAccessAdminRoute(
    user: CapabilityUser | null | undefined,
    pathname: string,
): boolean {
    if (!user?.isStaff) return false;
    if (user.role === "admin" || user.isSuperuser) return true;
    const rule = ADMIN_ROUTE_CAPABILITIES.find(item => pathname.startsWith(item.prefix));
    return rule ? hasAnyCapability(user, rule.anyOf) : pathname === "/admin" || pathname.startsWith("/admin/profile");
}
