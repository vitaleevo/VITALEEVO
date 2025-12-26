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
            <Suspense fallback={<div className="pt-32 pb-20 bg-gray-50 dark:bg-[#0f172a] min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>}>
                <Blog />
            </Suspense>
        </FeatureLayout>
    );
}
