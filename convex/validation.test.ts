import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
    normalizeEmail,
    validatePhone,
    validateSlug,
    validatePositiveQuantity,
    validateText,
} from "./validation.ts";

describe("validateSlug", () => {
    test("aceita slugs válidos e normaliza para minúsculas", () => {
        assert.equal(validateSlug("Marketing-Digital"), "marketing-digital");
        assert.equal(validateSlug("  cam-4mp  "), "cam-4mp");
        assert.equal(validateSlug("a1-b2"), "a1-b2");
    });

    test("rejeita slugs inválidos", () => {
        assert.throws(() => validateSlug(""), /Slug inválido/);
        assert.throws(() => validateSlug("com espaço"), /Slug inválido/);
        assert.throws(() => validateSlug("acentuação"), /Slug inválido/);
        assert.throws(() => validateSlug("espaço-final "), /Slug inválido/);
    });
});

describe("normalizeEmail", () => {
    test("normaliza email para minúsculas sem espaços", () => {
        assert.equal(normalizeEmail("  Cliente@Exemplo.COM "), "cliente@exemplo.com");
    });

    test("rejeita emails inválidos", () => {
        assert.throws(() => normalizeEmail("sem-arroba"), /E-mail inválido/);
        assert.throws(() => normalizeEmail("a@b"), /E-mail inválido/);
        assert.throws(() => normalizeEmail(""), /E-mail inválido/);
    });
});

describe("validatePhone", () => {
    test("aceita números angolanos", () => {
        assert.equal(validatePhone("+244 950 744 445"), "+244 950 744 445");
        assert.equal(validatePhone("950744445"), "950744445");
    });

    test("rejeita telefones inválidos", () => {
        assert.throws(() => validatePhone("abc"), /Telefone inválido/);
        assert.throws(() => validatePhone("12"), /Telefone inválido/);
    });
});

describe("validatePositiveQuantity", () => {
    test("aceita quantidades inteiras positivas até 999", () => {
        assert.equal(validatePositiveQuantity(1), 1);
        assert.equal(validatePositiveQuantity(50), 50);
        assert.equal(validatePositiveQuantity(999), 999);
    });

    test("rejeita zero, negativos, decimais e acima de 999", () => {
        assert.throws(() => validatePositiveQuantity(0), /Quantidade inválida/);
        assert.throws(() => validatePositiveQuantity(-3), /Quantidade inválida/);
        assert.throws(() => validatePositiveQuantity(1.5), /Quantidade inválida/);
        assert.throws(() => validatePositiveQuantity(1000), /Quantidade inválida/);
    });
});

describe("validateText", () => {
    test("normaliza espaços e respeita o limite", () => {
        assert.equal(validateText("  Olá mundo  ", "Título", 100), "Olá mundo");
        assert.throws(() => validateText("", "Título", 100), /Título/);
        assert.throws(() => validateText("a".repeat(101), "Título", 100), /Título/);
    });
});