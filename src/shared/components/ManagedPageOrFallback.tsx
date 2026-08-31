"use client";

import type { ReactNode } from "react";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { sanitizeRichText } from "@/shared/utils/sanitize";

export default function ManagedPageOrFallback({ slug, fallback }: { slug: string; fallback: ReactNode }) {
    const { data: page, isLoading } = useApiQuery<any>(null, {
        deps: [slug],
        fetcher: () => api.pages.getBySlug(slug),
        cacheKey: `public:page:${slug}`,
        cacheTTL: 10_000,
    });

    if (isLoading || !page) return <>{fallback}</>;

    return (
        <div className="min-h-screen bg-white pt-28 pb-20 dark:bg-[#0b1120]">
            <section className="bg-background-light py-16 dark:bg-background-dark md:py-24">
                <div className="wrap max-w-4xl text-center">
                    <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-6xl">
                        {page.heroTitle || page.title}
                    </h1>
                    {page.heroSubtitle && (
                        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-500 dark:text-slate-300">
                            {page.heroSubtitle}
                        </p>
                    )}
                </div>
            </section>
            <section className="section-pad">
                <div className="wrap max-w-4xl">
                    <div
                        className="prose prose-lg max-w-none prose-headings:font-display prose-a:text-primary dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(page.content || "") }}
                    />
                </div>
            </section>
        </div>
    );
}
