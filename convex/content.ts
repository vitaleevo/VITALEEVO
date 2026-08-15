const ALLOWED_TAGS = new Set([
    "a",
    "blockquote",
    "br",
    "code",
    "em",
    "h2",
    "h3",
    "h4",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "strong",
    "ul",
]);

const SELF_CLOSING_TAGS = new Set(["br", "img"]);

function decodeEntities(value: string) {
    return value.replace(/&(amp|lt|gt|quot|#39);/gi, (entity) => {
        const entities: Record<string, string> = {
            "&amp;": "&",
            "&lt;": "<",
            "&gt;": ">",
            "&quot;": '"',
            "&#39;": "'",
        };
        return entities[entity.toLowerCase()] ?? entity;
    });
}

function escapeHtml(value: string) {
    return decodeEntities(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function extractAttribute(attributes: string, attribute: string) {
    const expression = new RegExp(`(?:^|\\s)${attribute}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\"'=<>]+))`, "i");
    const match = attributes.match(expression);
    return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function safeUrl(value: string | null, allowedProtocols: string[]) {
    if (!value) return null;

    try {
        const url = new URL(decodeEntities(value), "https://vitaleevo.ao");
        return allowedProtocols.includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

export function sanitizeRichText(value: string) {
    return value.split(/(<[^>]*>)/g).map((token) => {
        if (!token.startsWith("<")) return escapeHtml(token);

        const match = token.match(/^<\s*(\/?)\s*([a-zA-Z0-9]+)([^>]*)>$/);
        if (!match) return escapeHtml(token);

        const [, closingMarker, rawTag, attributes] = match;
        const tag = rawTag.toLowerCase();

        if (!ALLOWED_TAGS.has(tag)) return escapeHtml(token);
        if (closingMarker) return SELF_CLOSING_TAGS.has(tag) ? "" : `</${tag}>`;
        if (tag === "br") return "<br />";

        if (tag === "a") {
            const href = safeUrl(extractAttribute(attributes, "href"), ["http:", "https:", "mailto:"]);
            return href ? `<a href="${escapeHtml(href)}" rel="noopener noreferrer">` : "<a>";
        }

        if (tag === "img") {
            const src = safeUrl(extractAttribute(attributes, "src"), ["http:", "https:"]);
            if (!src) return "";
            const alt = escapeHtml(extractAttribute(attributes, "alt") ?? "");
            return `<img src="${escapeHtml(src)}" alt="${alt}" />`;
        }

        return `<${tag}>`;
    }).join("");
}
