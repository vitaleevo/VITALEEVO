import type { Metadata } from 'next';

// Generate dynamic metadata for SEO
export function generateSEOMetadata({
    title,
    description,
    path = '',
    image = '/icon.png',
}: {
    title: string;
    description: string;
    path?: string;
    image?: string;
}): Metadata {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vitaleevo.ao';
    const fullUrl = `${baseUrl}${path}`;

    return {
        title: `${title} | VitalEvo`,
        description,
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: fullUrl,
        },
        openGraph: {
            title: `${title} | VitalEvo`,
            description,
            url: fullUrl,
            siteName: 'VitalEvo',
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'pt_AO',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | VitalEvo`,
            description,
            images: [image],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

// Common metadata for all pages
export const defaultMetadata: Metadata = {
    title: {
        default: 'VitalEvo - Conectando Possibilidades',
        template: '%s | VitalEvo',
    },
    description: 'Transformamos marcas através de tecnologia de ponta e design estratégico em Angola. Criação de sites, marketing digital, branding e muito mais.',
    keywords: [
        'VitalEvo',
        'Angola',
        'Luanda',
        'web design',
        'marketing digital',
        'branding',
        'desenvolvimento web',
        'agência digital',
        'criação de sites',
        'loja online',
        'e-commerce',
        'infraestrutura TI',
        'câmeras de segurança',
    ],
    authors: [{ name: 'VitalEvo' }],
    creator: 'VitalEvo',
    publisher: 'VitalEvo',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
};
