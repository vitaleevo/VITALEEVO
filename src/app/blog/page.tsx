import { generateSEOMetadata } from '@/shared/utils/seo';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Blog from '@/features/blog/components/Blog';
import { Suspense } from 'react';

export const metadata = generateSEOMetadata({
    title: 'Blog',
    description: 'Artigos sobre tecnologia, marketing digital, tendências de design e dicas de negócios em Angola. Aprenda com especialistas da VitalEvo.',
    path: '/blog',
});

export default function BlogPage() {
    return (
        <FeatureLayout>
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50 pt-32 pb-20 dark:bg-background-dark">
                <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
            </div>}>
                <Blog />
            </Suspense>
        </FeatureLayout>
    );
}
