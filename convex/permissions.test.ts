import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { hasPermission, getPermissions, normalizeRole } from "./permissions.ts";

describe("normalizeRole", () => {
    test("aceita apenas as funções staff e converte o resto para user", () => {
        assert.equal(normalizeRole("admin"), "admin");
        assert.equal(normalizeRole("commercial"), "commercial");
        assert.equal(normalizeRole("content"), "content");
        assert.equal(normalizeRole("operations"), "operations");
        assert.equal(normalizeRole("user"), "user");
        assert.equal(normalizeRole(undefined), "user");
        assert.equal(normalizeRole("hacker"), "user");
    });
});

describe("hasPermission — admin", () => {
    test("admin tem todas as permissões", () => {
        for (const permission of [
            "users:manage",
            "catalog:manage",
            "stock:manage",
            "quotes:manage",
            "content:manage",
            "content:import",
            "contacts:manage",
            "settings:manage",
            "ai:manage",
            "orders:read",
        ] as const) {
            assert.equal(hasPermission("admin", permission), true, `admin deve ter ${permission}`);
        }
    });
});

describe("hasPermission — commercial", () => {
    test("commercial tem cotações, contactos e media", () => {
        assert.equal(hasPermission("commercial", "quotes:read"), true);
        assert.equal(hasPermission("commercial", "quotes:manage"), true);
        assert.equal(hasPermission("commercial", "contacts:manage"), true);
        assert.equal(hasPermission("commercial", "media:upload"), true);
    });

    test("commercial NÃO tem gestão de catálogo, utilizadores ou conteúdo", () => {
        assert.equal(hasPermission("commercial", "catalog:manage"), false);
        assert.equal(hasPermission("commercial", "users:manage"), false);
        assert.equal(hasPermission("commercial", "content:manage"), false);
        assert.equal(hasPermission("commercial", "settings:manage"), false);
        assert.equal(hasPermission("commercial", "stock:manage"), false);
    });
});

describe("hasPermission — content", () => {
    test("content tem conteúdo, importação e media", () => {
        assert.equal(hasPermission("content", "content:manage"), true);
        assert.equal(hasPermission("content", "content:import"), true);
        assert.equal(hasPermission("content", "media:upload"), true);
    });

    test("content NÃO tem cotações, stock ou catálogo", () => {
        assert.equal(hasPermission("content", "quotes:read"), false);
        assert.equal(hasPermission("content", "stock:manage"), false);
        assert.equal(hasPermission("content", "catalog:manage"), false);
    });
});

describe("hasPermission — operations", () => {
    test("operations tem catálogo, stock e leitura de cotações", () => {
        assert.equal(hasPermission("operations", "catalog:read"), true);
        assert.equal(hasPermission("operations", "catalog:manage"), true);
        assert.equal(hasPermission("operations", "stock:manage"), true);
        assert.equal(hasPermission("operations", "quotes:read"), true);
    });

    test("operations NÃO tem utilizadores, conteúdo ou definições", () => {
        assert.equal(hasPermission("operations", "users:manage"), false);
        assert.equal(hasPermission("operations", "content:manage"), false);
        assert.equal(hasPermission("operations", "settings:manage"), false);
    });
});

describe("hasPermission — user", () => {
    test("utilizador comum não tem qualquer permissão de staff", () => {
        assert.equal(hasPermission("user", "quotes:read"), false);
        assert.equal(hasPermission("user", "catalog:read"), false);
        assert.equal(hasPermission("user", "media:upload"), false);
        assert.equal(hasPermission(undefined, "quotes:read"), false);
    });
});

describe("getPermissions", () => {
    test("devolve a lista correta por função", () => {
        assert.deepEqual(getPermissions("content"), ["content:manage", "content:import", "media:upload"]);
        assert.deepEqual(getPermissions("operations"), [
            "catalog:read",
            "catalog:manage",
            "stock:manage",
            "quotes:read",
            "media:upload",
        ]);
        assert.deepEqual(getPermissions("user"), []);
    });
});