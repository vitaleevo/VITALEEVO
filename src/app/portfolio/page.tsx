import { generateSEOMetadata } from '@/shared/utils/seo';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Portfolio from '@/features/portfolio/components/Portfolio';

export const metadata = generateSEOMetadata({
    title: 'Portfólio',
    description: 'Veja nossos projetos de sucesso em websites, branding, marketing digital e muito mais. Cases reais de clientes em Angola.',
    path: '/portfolio',
});

export default function PortfolioPage() {
    return (
        <FeatureLayout>
            <Portfolio />
        </FeatureLayout>
    );
}
