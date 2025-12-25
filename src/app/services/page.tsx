import FeatureLayout from "@/shared/components/FeatureLayout";
import Services from "@/features/services/components/Services";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Nossos Serviços | VitalEvo',
    description: 'Conheça nossos serviços de Design, Desenvolvimento, Marketing e Tecnologia.',
};

export default function ServicesPage() {
    return (
        <FeatureLayout>
            <Services />
        </FeatureLayout>
    );
}
