import React from "react";

export const CONCEPT_IMAGES = {
    home: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1920&q=70",
    store: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=70",
    services: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=70",
    portfolio: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=1920&q=70",
    blog: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=70",
    office: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=70",
    analytics: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=70",
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