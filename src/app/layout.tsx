import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import { ConvexClientProvider } from "@/shared/providers/ConvexClientProvider";
import { CartProvider } from "@/shared/providers/CartProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "VitalEvo - Conectando Possibilidades",
    description: "Transformamos marcas através de tecnologia de ponta e design estratégico em Angola.",
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
            <html lang="pt-BR">
                <head>
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
                    <link rel="manifest" href="/manifest.json" />
                    <meta name="theme-color" content="#8625d2" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                </head>
                <body
                    className={`${inter.variable} ${montserrat.variable} antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300`}
                >
                    <ConvexClientProvider>
                        <CartProvider>
                            <ThemeProvider>
                                {children}
                            </ThemeProvider>
                        </CartProvider>
                    </ConvexClientProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
