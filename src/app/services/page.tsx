import { generateSEOMetadata } from '@/shared/utils/seo';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Services from '@/features/services/components/Services';

export const metadata = generateSEOMetadata({
    title: 'Serviços',
    description: 'Descubra nossos serviços: Criação de Websites, Marketing Digital, Branding, Gestão de Redes Sociais, Infraestrutura e Segurança em Angola.',
    path: '/services',
});

export default function ServicesPage() {
    return (
        <FeatureLayout>
            <Services />
        </FeatureLayout>
    );
}
