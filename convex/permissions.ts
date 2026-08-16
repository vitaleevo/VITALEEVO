export const PERMISSIONS = [
    "system:manage",
    "users:manage",
    "catalog:read",
    "catalog:manage",
    "catalog:import",
    "stock:manage",
    "quotes:read",
    "quotes:manage",
    "content:manage",
    "content:import",
    "media:upload",
    "contacts:manage",
    "settings:manage",
    "ai:manage",
    "audit:read",
    "orders:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];
export type StaffRole = "admin" | "commercial" | "content" | "operations" | "user";

const ROLE_PERMISSIONS: Record<StaffRole, readonly Permission[]> = {
    admin: PERMISSIONS,
    commercial: ["quotes:read", "quotes:manage", "contacts:manage", "media:upload"],
    content: ["content:manage", "content:import", "media:upload"],
    operations: ["catalog:read", "catalog:manage", "stock:manage", "quotes:read", "media:upload"],
    user: [],
};

export function normalizeRole(role?: string): StaffRole {
    if (role === "admin" || role === "commercial" || role === "content" || role === "operations") {
        return role;
    }

    return "user";
}

export function hasPermission(role: string | undefined, permission: Permission): boolean {
    return ROLE_PERMISSIONS[normalizeRole(role)].includes(permission);
}

export function getPermissions(role: string | undefined): readonly Permission[] {
    return ROLE_PERMISSIONS[normalizeRole(role)];
}
