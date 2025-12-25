import FeatureLayout from "@/shared/components/FeatureLayout";
import About from "@/features/about/components/About";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sobre Nós | VitalEvo',
    description: 'Conheça a VitalEvo, uma agência de tecnologia e marketing em Angola focada em resultados.',
};

export default function AboutPage() {
    return (
        <FeatureLayout>
            <About />
        </FeatureLayout>
    );
}
