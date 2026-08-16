import { ConvexError } from "convex/values";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,19}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) throw new ConvexError("E-mail inválido");
    return normalized;
}

export function validatePhone(phone: string): string {
    const normalized = phone.trim();
    if (!PHONE_PATTERN.test(normalized)) throw new ConvexError("Telefone inválido");
    return normalized;
}

export function validateSlug(slug: string): string {
    const normalized = slug.trim().toLowerCase();
    if (!SLUG_PATTERN.test(normalized)) {
        throw new ConvexError("Slug inválido. Use letras minúsculas, números e hífen.");
    }
    return normalized;
}

export function validatePositiveQuantity(quantity: number): number {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        throw new ConvexError("Quantidade inválida");
    }
    return quantity;
}

export function validateText(value: string, field: string, maxLength: number): string {
    const normalized = value.trim();
    if (!normalized || normalized.length > maxLength) {
        throw new ConvexError(`${field} é obrigatório e não pode exceder ${maxLength} caracteres`);
    }
    return normalized;
}
