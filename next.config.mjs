const isDevelopment = process.env.NODE_ENV === "development";
const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    "https://www.googletagmanager.com",
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
].join(" ");

// Origens da API permitidas no connect-src: o valor de NEXT_PUBLIC_API_URL
// (se definido) + localhost em desenvolvimento (apiClient dev usa :8100).
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/+$/, "");
const connectSources = [
    "'self'",
    "https:",
    "wss:",
    ...(isDevelopment ? ["http://localhost:8100", "http://127.0.0.1:8100"] : []),
    ...(apiUrl ? [apiUrl] : []),
].join(" ");

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            `script-src ${scriptSources}`,
                            `connect-src ${connectSources}`,
                            "img-src 'self' data: https: blob: http://localhost:8100 http://127.0.0.1:8100 http://localhost:8000 http://localhost:8080 http://localhost:3000 http:",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com",
                            "base-uri 'self'",
                            "form-action 'self'",
                            "frame-ancestors 'none'",
                        ].join("; "),
                    },
                ],
            },
        ];
    },
    images: {
        remotePatterns: [
            { protocol: "http", hostname: "localhost" },
            { protocol: "http", hostname: "127.0.0.1" },
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "picsum.photos" },
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
            { protocol: "https", hostname: "*.railway.app" },
        ],
        formats: ["image/avif", "image/webp"],
    },
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
