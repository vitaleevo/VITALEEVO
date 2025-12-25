import FeatureLayout from "@/shared/components/FeatureLayout";
import Contact from "@/features/contact/components/Contact";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Fale Conosco | VitalEvo',
    description: 'Entre em contato com a VitalEvo e transforme sua visão digital em realidade.',
};

export default function ContactPage() {
    return (
        <FeatureLayout>
            <Contact />
        </FeatureLayout>
    );
}
