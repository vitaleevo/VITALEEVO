import { ConvexError } from "convex/values";

/**
 * Extracts a user-friendly error message from various error types.
 * Specially designed to handle Convex errors and standard JavaScript Errors.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof ConvexError) {
        return (error.data as { message?: string })?.message || String(error.data);
    }

    if (error instanceof Error) {
        const message = error.message;

        // Clean up Convex "Uncaught Error: ... at handler" wrapping
        const match = message.match(/Uncaught Error: (.*?) at handler/);
        if (match) return match[1];

        // General Convex server error cleanup
        if (message.includes("Called by client")) {
            const lines = message.split("\n");
            const firstLine = lines[0].replace(/\[CONVEX.*?\]\s*\[.*?\]\s*Server Error\s*/, "").trim();
            if (firstLine.startsWith("Uncaught Error:")) {
                return firstLine.replace("Uncaught Error:", "").trim();
            }
            return firstLine;
        }

        return message;
    }

    if (typeof error === "string") return error;

    return "Ocorreu um erro inesperado";
}
