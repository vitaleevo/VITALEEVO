"use client";

import { useEffect, useState } from "react";
import AnalyticsTracker from "./AnalyticsTracker";

const CONSENT_KEY = "vitaleevo_analytics_consent";

type ConsentState = "accepted" | "declined" | null;

type ConsentUpdate = {
    analytics_storage: "granted" | "denied";
    ad_storage: "denied";
    ad_user_data: "denied";
    ad_personalization: "denied";
};

declare global {
    interface Window {
        gtag?: (command: "consent", action: "update", settings: ConsentUpdate) => void;
    }
}

export default function AnalyticsConsent() {
    const [consent, setConsent] = useState<ConsentState>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(CONSENT_KEY);
        setConsent(stored === "accepted" || stored === "declined" ? stored : null);
        setReady(true);
    }, []);

    const choose = (value: Exclude<ConsentState, null>) => {
        localStorage.setItem(CONSENT_KEY, value);
        window.gtag?.("consent", "update", {
            analytics_storage: value === "accepted" ? "granted" : "denied",
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
        });
        setConsent(value);
    };

    if (!ready) return null;

    return (
        <>
            {consent === "accepted" && <AnalyticsTracker />}
            {consent === null && (
                <section
                    aria-label="Preferências de privacidade"
                    className="fixed inset-x-4 bottom-20 z-[90] mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-slate-900 lg:bottom-5"
                >
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                        Privacidade e analytics
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        Podemos recolher métricas anónimas de navegação para melhorar o site. O rastreamento só começa com a sua autorização.
                    </p>
                    <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => choose("declined")}
                            className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/15 dark:text-slate-200"
                        >
                            Recusar
                        </button>
                        <button
                            type="button"
                            onClick={() => choose("accepted")}
                            className="min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            Aceitar métricas
                        </button>
                    </div>
                </section>
            )}
        </>
    );
}
