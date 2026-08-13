import FeatureLayout from "@/shared/components/FeatureLayout";
import Home from "@/features/home/components/Home";

export default function HomePage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Vitaleevo',
        image: 'https://vitaleevo.ao/icon.png',
        '@id': 'https://vitaleevo.ao',
        url: 'https://vitaleevo.ao',
        telephone: '+244 923 456 789',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Luanda',
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
            <Home />
        </FeatureLayout>
    );
}
