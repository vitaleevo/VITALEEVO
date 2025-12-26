import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import { ConvexClientProvider } from "@/shared/providers/ConvexClientProvider";
import { CartProvider } from "@/shared/providers/CartProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import MobileNavigation from "@/shared/components/MobileNavigation";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
    themeColor: "#8625d2",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    metadataBase: new URL("https://vitaleevo.ao"),
    title: {
        default: "VitalEvo - Conectando Possibilidades",
        template: "%s | VitalEvo"
    },
    description: "Transformamos marcas através de tecnologia de ponta e design estratégico em Angola. Especialistas em Design, Web e Segurança.",
    keywords: ["tecnologia", "design", "angola", "software", "segurança eletrônica", "marketing digital"],
    authors: [{ name: "VitalEvo" }],
    creator: "VitalEvo",
    openGraph: {
        type: "website",
        locale: "pt_AO",
        url: "https://vitalevo.com",
        siteName: "VitalEvo",
        title: "VitalEvo - Soluções Digitais e de Segurança",
        description: "Inovação tecnológica e design de alto impacto para o mercado Angolano.",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "VitalEvo" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "VitalEvo - Conectando Possibilidades",
        description: "Transformamos marcas através de tecnologia de ponta e design estratégico.",
        images: ["/og-image.png"],
    },
    icons: {
        icon: "/icon.png",
        apple: "/apple-icon.png",
    },
    manifest: "/manifest.json",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider
            appearance={{
                baseTheme: dark,
                variables: {
                    colorPrimary: "#8625d2",
                    colorBackground: "#151e32",
                    colorInputBackground: "#0b1120",
                    colorInputText: "#ffffff",
                    borderRadius: "0.75rem",
                },
                elements: {
                    formButtonPrimary: "bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25",
                    card: "shadow-xl border border-white/5",
                    headerTitle: "font-display font-bold",
                    headerSubtitle: "text-gray-400",
                    socialButtonsBlockButton: "border border-white/10 hover:bg-white/5",
                    formFieldInput: "rounded-xl border-white/10 focus:border-primary focus:ring-primary",
                    footerActionLink: "text-primary hover:text-primary-dark font-bold",
                },
            }}
        >
            <html lang="pt-BR" data-scroll-behavior="smooth">
                <body
                    className={`${inter.variable} ${montserrat.variable} antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300`}
                >
                    <ConvexClientProvider>
                        <CartProvider>
                            <ThemeProvider>
                                <div className="flex flex-col min-h-screen">
                                    <div className="flex-grow pb-16 lg:pb-0">
                                        {children}
                                    </div>
                                    <MobileNavigation />
                                </div>
                            </ThemeProvider>
                        </CartProvider>
                    </ConvexClientProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
