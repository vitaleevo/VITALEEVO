import { generateSEOMetadata } from '@/shared/utils/seo';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Store from '@/features/store/components/Store';

export const metadata = generateSEOMetadata({
    title: 'Loja',
    description: 'Loja oficial VitalEvo. Câmeras de segurança, equipamentos de rede, hardware e acessórios com os melhores preços em Angola.',
    path: '/store',
});

export default function StorePage() {
    return (
        <FeatureLayout>
            <Store />
        </FeatureLayout>
    );
}
