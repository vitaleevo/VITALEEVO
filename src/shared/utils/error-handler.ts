/**
 * Extrai uma mensagem de erro legível para o utilizador a partir de qualquer erro.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "string") return error;

    return "Ocorreu um erro inesperado";
}