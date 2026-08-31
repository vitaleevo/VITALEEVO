import { generateSEOMetadata } from '@/shared/utils/seo';
import FeatureLayout from '@/shared/components/FeatureLayout';
import About from '@/features/about/components/About';
import ManagedPageOrFallback from '@/shared/components/ManagedPageOrFallback';

export const metadata = generateSEOMetadata({
    title: 'Sobre Nós',
    description: 'Conheça a VitalEvo, a agência parceira do seu crescimento digital em Angola. Nossa missão é transformar negócios através da tecnologia.',
    path: '/about',
});

export default function AboutPage() {
    return (
        <FeatureLayout>
            <ManagedPageOrFallback slug="about" fallback={<About />} />
        </FeatureLayout>
    );
}
