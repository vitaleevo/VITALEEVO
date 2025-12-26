import { generateSEOMetadata } from '@/shared/utils/seo';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Blog from '@/features/blog/components/Blog';

export const metadata = generateSEOMetadata({
    title: 'Blog',
    description: 'Artigos sobre tecnologia, marketing digital, tendências de design e dicas de negócios em Angola. Aprenda com especialistas da VitalEvo.',
    path: '/blog',
});

export default function BlogPage() {
    return (
        <FeatureLayout>
            <Blog />
        </FeatureLayout>
    );
}
