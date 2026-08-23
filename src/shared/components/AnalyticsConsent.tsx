"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import AnalyticsTracker from "./AnalyticsTracker";

const CONSENT_KEY = "vitaleevo_analytics_consent";

type ConsentState = "accepted" | "declined" | null;

export default function AnalyticsConsent({ googleAnalyticsId }: { googleAnalyticsId?: string }) {
    const [consent, setConsent] = useState<ConsentState>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(CONSENT_KEY);
        setConsent(stored === "accepted" || stored === "declined" ? stored : null);
        setReady(true);
    }, []);

    const choose = (value: Exclude<ConsentState, null>) => {
        localStorage.setItem(CONSENT_KEY, value);
        setConsent(value);
    };

    if (!ready) return null;

    return (
        <>
            {consent === "accepted" && <AnalyticsTracker />}
            {consent === "accepted" && googleAnalyticsId && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
                        strategy="afterInteractive"
                    />
                    <Script id="ga4-init" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${googleAnalyticsId}', { anonymize_ip: true });
                        `}
                    </Script>
                </>
            )}
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
