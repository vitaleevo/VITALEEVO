import { expect, test } from "@playwright/test";

type Role = "user" | "commercial" | "content" | "operations" | "admin";
type Credentials = Record<Role, { email: string; password: string }>;

const credentials = process.env.E2E_ROLE_CREDENTIALS
    ? JSON.parse(process.env.E2E_ROLE_CREDENTIALS) as Credentials
    : null;

const scenarios = [
    { role: "user" as const, destination: /\/conta$/, allowed: "/conta", denied: "/admin" },
    { role: "commercial" as const, destination: /\/admin$/, allowed: "/admin/quotes", denied: "/admin/products" },
    { role: "content" as const, destination: /\/admin$/, allowed: "/admin/blog", denied: "/admin/quotes" },
    { role: "operations" as const, destination: /\/admin$/, allowed: "/admin/orders", denied: "/admin/contacts" },
    { role: "admin" as const, destination: /\/admin$/, allowed: "/admin/users", denied: null },
];

test.describe("staging integrado", () => {
    test.skip(!credentials || !process.env.E2E_REAL_API_URL, "Credenciais e API de staging são obrigatórias");

    for (const scenario of scenarios) {
        test(`${scenario.role}: login e capability reais`, async ({ page }) => {
            const account = credentials![scenario.role];
            await page.goto("/login");
            await page.getByLabel("E-mail").fill(account.email);
            await page.getByLabel("Senha").fill(account.password);
            await page.getByRole("button", { name: /^Entrar$/ }).click();
            await expect(page).toHaveURL(scenario.destination);
            await page.goto(scenario.allowed);
            await expect(page.getByRole("heading", { name: "Acesso Restrito" })).toHaveCount(0);
            if (scenario.denied) {
                await page.goto(scenario.denied);
                if (scenario.role === "user") {
                    await expect(page).toHaveURL(/\/login$/);
                } else {
                    await expect(page.getByRole("heading", { name: "Acesso Restrito" })).toBeVisible();
                }
            }
        });
    }
});
