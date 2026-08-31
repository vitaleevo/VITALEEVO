import FeatureLayout from "@/shared/components/FeatureLayout";
import Home from "@/features/home/components/Home";
import { SITE_CONTACT } from "@/shared/utils/contact";
import ManagedPageOrFallback from "@/shared/components/ManagedPageOrFallback";

export const revalidate = 10;

export default function HomePage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Vitaleevo',
        image: 'https://vitaleevo.ao/icon.png',
        '@id': 'https://vitaleevo.ao',
        url: 'https://vitaleevo.ao',
        telephone: SITE_CONTACT.primaryPhone,
        address: {
            '@type': 'PostalAddress',
            streetAddress: SITE_CONTACT.address,
            addressLocality: 'Luanda',
            addressCountry: 'AO'
        },
        description: 'Inovação tecnológica e design de alto impacto em Angola.',
        priceRange: 'KZ',
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday"
                ],
                "opens": "08:00",
                "closes": "17:00"
            }
        ]
    };

    return (
        <FeatureLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ManagedPageOrFallback slug="home" fallback={<Home />} />
        </FeatureLayout>
    );
}
