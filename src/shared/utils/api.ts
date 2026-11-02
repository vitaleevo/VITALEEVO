export const API_BASE_URL =
    typeof window === "undefined"
        ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8100")
        : (process.env.NEXT_PUBLIC_API_URL || "");

export interface SiteConfig {
    siteName?: string;
    siteDescription?: string;
    contactEmail?: string;
    contactPhone?: string;
    whatsapp?: string;
    currency?: string;
}

export async function getSiteConfig(): Promise<SiteConfig | null> {
    try {
        const res = await fetch(
            `${API_BASE_URL}/api/v1/cms/settings/site_config/`,
            { cache: "no-store" }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data?.value ?? null;
    } catch {
        return null;
    }
}