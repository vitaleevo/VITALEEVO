import { describe, expect, it } from "vitest";

import { canAccessAdminRoute, hasCapability } from "./capabilities";

const staff = (role: string, permissions: string[] = []) => ({ role, permissions, isStaff: role !== "user" });

describe("capability matrix", () => {
    it("keeps clients outside every admin route", () => {
        const client = staff("user");
        expect(canAccessAdminRoute(client, "/admin")).toBe(false);
        expect(hasCapability(client, "catalog:read")).toBe(false);
    });

    it("limits commercial staff to quotes and contacts", () => {
        const commercial = staff("commercial", ["quotes:read", "quotes:manage", "contacts:manage"]);
        expect(canAccessAdminRoute(commercial, "/admin/quotes")).toBe(true);
        expect(canAccessAdminRoute(commercial, "/admin/contacts")).toBe(true);
        expect(canAccessAdminRoute(commercial, "/admin/products")).toBe(false);
        expect(canAccessAdminRoute(commercial, "/admin/blog")).toBe(false);
    });

    it("limits content staff to CMS content", () => {
        const content = staff("content", ["content:manage", "content:import"]);
        expect(canAccessAdminRoute(content, "/admin/blog")).toBe(true);
        expect(canAccessAdminRoute(content, "/admin/site")).toBe(true);
        expect(canAccessAdminRoute(content, "/admin/quotes")).toBe(false);
    });

    it("limits operations to catalog, stock and quote reading", () => {
        const operations = staff("operations", ["catalog:read", "catalog:manage", "stock:manage", "quotes:read", "orders:read", "orders:manage"]);
        expect(canAccessAdminRoute(operations, "/admin/products")).toBe(true);
        expect(canAccessAdminRoute(operations, "/admin/quotes")).toBe(true);
        expect(canAccessAdminRoute(operations, "/admin/orders")).toBe(true);
        expect(canAccessAdminRoute(operations, "/admin/contacts")).toBe(false);
    });

    it("allows super admins across the backoffice", () => {
        const admin = staff("admin");
        expect(canAccessAdminRoute(admin, "/admin/users")).toBe(true);
        expect(canAccessAdminRoute(admin, "/admin/settings")).toBe(true);
        expect(hasCapability(admin, "system:manage")).toBe(true);
    });
});
