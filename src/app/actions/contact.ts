"use server";

import { API_BASE_URL } from "@/shared/utils/apiClient";

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function subscribeToNewsletter(email: string) {
    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
        return { success: false, error: "E-mail inválido." };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/cms/newsletters/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalizedEmail }),
            cache: "no-store",
        });
        if (!response.ok) {
            return { success: false, error: "Não foi possível concluir a inscrição." };
        }
        return { success: true };
    } catch {
        return { success: false, error: "Não foi possível concluir a inscrição." };
    }
}
