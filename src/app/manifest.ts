import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Vitaleevo',
        short_name: 'Vitaleevo',
        description: 'Inovação tecnológica e design de alto impacto em Angola.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#8625d2',
        icons: [
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
