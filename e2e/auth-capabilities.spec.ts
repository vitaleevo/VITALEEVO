import { expect, Page, test } from "@playwright/test";

type Role = "user" | "commercial" | "content" | "operations" | "admin";

const PERMISSIONS: Record<Role, string[]> = {
    user: [],
    commercial: ["quotes:read", "quotes:manage", "contacts:manage", "media:upload"],
    content: ["content:manage", "content:import", "media:upload"],
    operations: ["catalog:read", "catalog:manage", "stock:manage", "quotes:read", "orders:read", "orders:manage", "media:upload"],
    admin: ["system:manage"],
};

async function mockApi(page: Page, role: Role) {
    await page.route("**/api/v1/**", async route => {
        const path = new URL(route.request().url()).pathname;
        let body: unknown = { count: 0, next: null, previous: null, results: [] };
        if (path.endsWith("/auth/login")) body = { access: "access-token", refresh: "refresh-token" };
        else if (path.endsWith("/auth/me")) {
            body = {
                id: `${role}-id`, email: `${role}@example.ao`, first_name: role, last_name: "Teste",
                role, is_staff: role !== "user", permissions: PERMISSIONS[role],
            };
        } else if (path.endsWith("/dashboard")) {
            body = { recent: {}, quotes: { total: 0 }, contacts: { total: 0 }, products: { total: 0 } };
        } else if (path.endsWith("/cms/settings/site_config")) body = { key: "site_config", value: {} };
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
    });
}

async function loginAs(page: Page, role: Role) {
    await mockApi(page, role);
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(`${role}@example.ao`);
    await page.getByLabel("Senha").fill("SenhaForte123!");
    await page.getByRole("button", { name: /^Entrar$/ }).click();
}

test("cliente entra em /conta e não no backoffice", async ({ page }) => {
    await loginAs(page, "user");
    await expect(page).toHaveURL(/\/conta$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);
});

for (const scenario of [
    { role: "commercial" as const, allowed: "/admin/quotes", denied: "/admin/products" },
    { role: "content" as const, allowed: "/admin/blog", denied: "/admin/quotes" },
    { role: "operations" as const, allowed: "/admin/orders", denied: "/admin/contacts" },
    { role: "admin" as const, allowed: "/admin/users", denied: null },
]) {
    test(`${scenario.role} respeita a capability do módulo`, async ({ page }) => {
        await loginAs(page, scenario.role);
        await expect(page).toHaveURL(/\/admin$/);
        await page.goto(scenario.allowed);
        await expect(page.getByRole("heading", { name: "Acesso Restrito" })).toHaveCount(0);
        if (scenario.denied) {
            await page.goto(scenario.denied);
            await expect(page.getByRole("heading", { name: "Acesso Restrito" })).toBeVisible();
        }
    });
}
