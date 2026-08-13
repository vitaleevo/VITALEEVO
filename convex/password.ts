import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

// Legacy 32-bit hash used before the bcrypt migration.
// Kept ONLY to verify and transparently upgrade existing accounts.
export function legacyHash(str: string, salt: string = "vitaleevo_prod_2024"): string {
    let hash = 0;
    const combined = str + salt;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0') +
        str.length.toString(16) +
        combined.split('').reverse().join('').charCodeAt(0).toString(16);
}

// bcrypt hashes always start with "$2a$", "$2b$" or "$2y$"
export function isLegacyHash(storedHash: string): boolean {
    return !storedHash.startsWith("$2");
}

export function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    if (isLegacyHash(storedHash)) {
        return legacyHash(password) === storedHash;
    }
    return bcrypt.compare(password, storedHash);
}

// Cryptographically secure random token (64 hex chars)
export function randomToken(bytes = 32): string {
    const buffer = new Uint8Array(bytes);
    if (!globalThis.crypto) {
        throw new Error("Crypto API unavailable");
    }
    globalThis.crypto.getRandomValues(buffer);
    return Array.from(buffer, (b) => b.toString(16).padStart(2, "0")).join("");
}