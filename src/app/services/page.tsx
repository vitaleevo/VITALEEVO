import { generateSEOMetadata } from '@/shared/utils/seo';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Services from '@/features/services/components/Services';
import { servicesData } from '@/features/services/data';

export const metadata = generateSEOMetadata({
    title: 'Serviços',
    description: 'Descubra nossos serviços: Criação de Websites, Marketing Digital, Branding, Gestão de Redes Sociais, Infraestrutura e Segurança em Angola.',
    path: '/services',
});

export default function ServicesPage() {
    const serviceJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": servicesData.map((service, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Service",
                "name": service.title,
                "description": service.description,
                "url": `https://vitaleevo.ao/services/${service.slug}`,
                "provider": {
                    "@type": "Organization",
                    "name": "VitalEvo",
                    "url": "https://vitaleevo.ao"
                }
            }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
            />
            <FeatureLayout>
                <Services />
            </FeatureLayout>
        </>
    );
}
