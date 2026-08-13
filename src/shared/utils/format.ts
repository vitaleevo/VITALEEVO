/**
 * Date formatting utilities
 */

/**
 * Format a date value to a localized string
 * @param date - Date value (Date object, timestamp, or ISO string)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in Portuguese (Angola)
 */
export function formatDate(
    date: Date | number | string | undefined | null,
    options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }
): string {
    if (!date) return "-";

    try {
        const dateObj = typeof date === "string" || typeof date === "number"
            ? new Date(date)
            : date;

        return new Intl.DateTimeFormat("pt-AO", options).format(dateObj);
    } catch {
        return "-";
    }
}

/**
 * Format a date with time
 * @param date - Date value
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | number | string | undefined | null): string {
    return formatDate(date, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Format a relative time (e.g., "2 hours ago")
 * @param date - Date value
 * @returns Relative time string in Portuguese
 */
export function formatRelativeTime(date: Date | number | string | undefined | null): string {
    if (!date) return "-";

    try {
        const dateObj = typeof date === "string" || typeof date === "number"
            ? new Date(date)
            : date;

        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) return "agora mesmo";
        if (diffMinutes < 60) return `há ${diffMinutes} min`;
        if (diffHours < 24) return `há ${diffHours}h`;
        if (diffDays < 7) return `há ${diffDays}d`;

        return formatDate(dateObj);
    } catch {
        return "-";
    }
}

/**
 * Format currency value
 * @param value - Numeric value
 * @param currency - Currency code (default: AOA)
 * @returns Formatted currency string
 */
export function formatCurrency(
    value: number | undefined | null,
    currency: string = "AOA"
): string {
    if (value === undefined || value === null) return "-";

    return new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format a number with thousands separators
 * @param value - Numeric value
 * @returns Formatted number string
 */
export function formatNumber(value: number | undefined | null): string {
    if (value === undefined || value === null) return "-";

    return new Intl.NumberFormat("pt-AO").format(value);
}

/**
 * Normalize text for searching by removing accents and converting to lowercase
 * @param text - The text to normalize
 * @returns Normalized string
 */
export function normalizeText(text: string | undefined | null): string {
    if (!text) return "";
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}
