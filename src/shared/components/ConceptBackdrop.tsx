import React from "react";

export const CONCEPT_IMAGES = {
    home: "/images/heros/home.webp",
    store: "/images/heros/store.webp",
    services: "/images/heros/services.webp",
    portfolio: "/images/heros/portfolio.webp",
    blog: "/images/heros/blog.webp",
    office: "/images/heros/office.webp",
    analytics: "/images/heros/analytics.webp",
} as const;

interface ConceptBackdropProps {
    image: string;
    subtle?: boolean;
    overlay?: boolean;
    className?: string;
}

export default function ConceptBackdrop({ image, subtle = false, overlay = true, className = "" }: ConceptBackdropProps) {
    return (
        <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
            <div
                className={`absolute inset-0 bg-cover bg-center ${
                    subtle ? "opacity-[0.13] dark:opacity-[0.18]" : "opacity-[0.22] dark:opacity-[0.28]"
                }`}
                style={{ backgroundImage: `url('${image}')` }}
            />
            {overlay && (
                <div
                    className={`absolute inset-0 ${
                        subtle
                            ? "bg-gradient-to-b from-background-light/70 via-background-light/55 to-background-light dark:from-background-dark/75 dark:via-background-dark/60 dark:to-background-dark"
                            : "bg-gradient-to-b from-background-light/75 via-background-light/55 to-background-light dark:from-background-dark/80 dark:via-background-dark/60 dark:to-background-dark"
                    }`}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/[0.06]" />
        </div>
    );
}