const ENCRYPTION_KEY_ENV = "VITALEEVO_API_KEYS_ENCRYPTION_KEY";
function hexToBytes(value: string): Uint8Array {
    if (!/^(?:[\da-f]{2})+$/i.test(value)) {
        throw new Error("Valor hexadecimal inválido.");
    }
    const bytes = new Uint8Array(value.length / 2);
    for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
    }
    return bytes;
}
function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function getEncryptionKey(): Promise<CryptoKey> {
    const keyMaterial = process.env[ENCRYPTION_KEY_ENV];
    if (!keyMaterial || !/^[\da-f]{64}$/i.test(keyMaterial)) {
        throw new Error(
            `Defina ${ENCRYPTION_KEY_ENV} como uma chave aleatória de 32 bytes em hexadecimal.`,
        );
    }
    return crypto.subtle.importKey(
        "raw",
        hexToBytes(keyMaterial),
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"],
    );
}
export async function encryptSecret(value: string): Promise<{
    ciphertext: string;
    iv: string;
}> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        await getEncryptionKey(),
        new TextEncoder().encode(value),
    );
    return {
        ciphertext: bytesToHex(new Uint8Array(encrypted)),
        iv: bytesToHex(iv),
    };
}
export async function decryptSecret(ciphertext: string, iv: string): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: hexToBytes(iv) },
        await getEncryptionKey(),
        hexToBytes(ciphertext),
    );
    return new TextDecoder().decode(decrypted);
}
