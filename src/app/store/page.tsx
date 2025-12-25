import { Metadata } from 'next';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Store from '@/features/store/components/Store';

export const metadata: Metadata = {
    title: 'Loja | VitalEvo',
    description: 'Compre equipamentos de rede, câmeras de segurança e hardware com os melhores preços.',
};

export default function StorePage() {
    return (
        <FeatureLayout>
            <Store />
        </FeatureLayout>
    );
}
