const ALLOWED_TAGS = new Set([
    "a",
    "abbr",
    "address",
    "article",
    "aside",
    "b",
    "blockquote",
    "br",
    "cite",
    "code",
    "del",
    "details",
    "div",
    "em",
    "figcaption",
    "figure",
    "footer",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hr",
    "i",
    "img",
    "ins",
    "kbd",
    "li",
    "main",
    "mark",
    "ol",
    "p",
    "pre",
    "q",
    "s",
    "samp",
    "section",
    "small",
    "span",
    "strong",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "time",
    "tr",
    "u",
    "ul",
    "var",
]);

const SELF_CLOSING_TAGS = new Set(["br", "hr", "img"]);

// Apenas classes Tailwind "puras": letras, números, hífenes, underscores, espaços e ":" (variantes md:, dark:, etc.).
// Impede injeção CSS (url(), etc.) através do atributo class.
const CLASS_PATTERN = /^[a-zA-Z0-9_:\-\s]+$/;

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

function safeClass(attributes: string) {
    const value = extractAttribute(attributes, "class");
    if (!value) return "";
    const clean = decodeEntities(value).trim();
    return clean && CLASS_PATTERN.test(clean) ? ` class="${clean}"` : "";
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
        if (tag === "hr") return "<hr />";

        if (tag === "a") {
            const href = safeUrl(extractAttribute(attributes, "href"), ["http:", "https:", "mailto:"]);
            return href ? `<a href="${escapeHtml(href)}" rel="noopener noreferrer"${safeClass(attributes)}>` : `<a${safeClass(attributes)}>`;
        }

        if (tag === "img") {
            const src = safeUrl(extractAttribute(attributes, "src"), ["http:", "https:"]);
            if (!src) return "";
            const alt = escapeHtml(extractAttribute(attributes, "alt") ?? "");
            return `<img src="${escapeHtml(src)}" alt="${alt}"${safeClass(attributes)} />`;
        }

        return `<${tag}${safeClass(attributes)}>`;
    }).join("");
}