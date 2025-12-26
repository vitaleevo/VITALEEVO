import { generateSEOMetadata } from '@/shared/utils/seo';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Contact from '@/features/contact/components/Contact';

export const metadata = generateSEOMetadata({
    title: 'Contacto',
    description: 'Entre em contacto com a VitalEvo. Solicite uma consultoria gratuita para seu projeto de website, marketing digital ou branding em Angola.',
    path: '/contact',
});

export default function ContactPage() {
    return (
        <FeatureLayout>
            <Contact />
        </FeatureLayout>
    );
}
