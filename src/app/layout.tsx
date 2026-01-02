import type { Metadata, Viewport, ResolvingMetadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import { ConvexClientProvider } from "@/shared/providers/ConvexClientProvider";
import { CartProvider } from "@/shared/providers/CartProvider";
import MobileNavigation from "@/shared/components/MobileNavigation";
import MaintenanceGuard from "@/shared/components/MaintenanceGuard";
import { AIChatWidget } from "@/shared/components/AIChatWidget";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
});


export const viewport: Viewport = {
    themeColor: "#8625d2",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export async function generateMetadata(
    _props: any,
    parent: ResolvingMetadata
): Promise<Metadata> {
    let settings: any = null;
    try {
        const url = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

        if (url && api?.settings?.get) {
            const client = new ConvexHttpClient(url);
            settings = await client.query(api.settings.get);
        } else {
            if (!url && process.env.NODE_ENV === 'development') {
                console.warn("⚠️ CONVEX_URL is not set for metadata generation.");
            }
        }
    } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
            console.error("❌ Failed to fetch settings for metadata:", error?.message || error);
        }
        // Fallback to default values is handled below
    }

    const previousImages = (await parent).openGraph?.images || [];
    const siteName = settings?.siteName || "Vitaleevo";
    const description = settings?.siteDescription || "Inovação tecnológica e design de alto impacto em Angola.";

    return {
        metadataBase: new URL("https://vitaleevo.ao"),
        title: {
            default: siteName,
            template: `%s | ${siteName}`
        },
        description,
        keywords: ["tecnologia", "design", "angola", "software", "segurança eletrônica", "marketing digital", "e-commerce"],
        authors: [{ name: siteName }],
        creator: siteName,
        openGraph: {
            type: "website",
            locale: "pt_AO",
            url: "https://vitaleevo.ao",
            siteName: siteName,
            title: `${siteName} - Soluções Digitais e de Segurança`,
            description,
            images: ["/og-image.png", ...previousImages],
        },
        twitter: {
            card: "summary_large_image",
            title: siteName,
            description,
            images: ["/og-image.png"],
        },
        icons: {
            icon: "/icon.png",
            apple: "/apple-icon.png",
        },
        // manifest: "/manifest.json", // Disabled to prevent Vercel Preview 401 errors
    };
}

import { AuthProvider } from "@/shared/providers/AuthProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" data-scroll-behavior="smooth" suppressHydrationWarning>
            <body
                className={`${inter.variable} ${montserrat.variable} antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300`}
                suppressHydrationWarning
            >
                <ConvexClientProvider>
                    <AuthProvider>
                        <CartProvider>
                            <ThemeProvider>
                                <Toaster richColors position="top-right" />
                                <div className="flex flex-col min-h-screen">
                                    <div className="flex-grow pb-16 lg:pb-0">
                                        <Suspense>
                                            <MaintenanceGuard>
                                                {children}
                                            </MaintenanceGuard>
                                        </Suspense>
                                    </div>
                                    <Suspense>
                                        <MobileNavigation />
                                        <AIChatWidget />
                                    </Suspense>
                                </div>
                            </ThemeProvider>
                        </CartProvider>
                    </AuthProvider>
                </ConvexClientProvider>
            </body>
        </html>
    );
}
