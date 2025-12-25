import FeatureLayout from "@/shared/components/FeatureLayout";
import Portfolio from "@/features/portfolio/components/Portfolio";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Portfólio | VitalEvo',
    description: 'Confira nosso portfólio de cases de sucesso em Design, Tecnologia e Marketing.',
};

export default function PortfolioPage() {
    return (
        <FeatureLayout>
            <Portfolio />
        </FeatureLayout>
    );
}
