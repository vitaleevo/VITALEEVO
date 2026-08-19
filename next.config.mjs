const isDevelopment = process.env.NODE_ENV === "development";
const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
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
                            "connect-src 'self' https: wss:",
                            "img-src 'self' data: https: blob:",
                            "style-src 'self' 'unsafe-inline'",
                            "font-src 'self' data:",
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
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "picsum.photos" },
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
        ],
        formats: ["image/avif", "image/webp"],
    },
};

export default nextConfig;
