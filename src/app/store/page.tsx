import { generateSEOMetadata } from '@/shared/utils/seo';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Store from '@/features/store/components/Store';
import { api } from '@/shared/utils/apiClient';

export const revalidate = 10;

export const metadata = generateSEOMetadata({
    title: 'Loja de Tecnologia para Empresas em Angola',
    description: 'Explore software, equipamentos, CCTV, redes, informática e acessórios para empresas em Angola. Adicione produtos e peça uma proposta comercial.',
    path: '/store',
});

export default async function StorePage() {
    let initialProducts = null;
    let initialCategories = null;
    let initialBrands = null;

    try {
        [initialProducts, initialCategories, initialBrands] = await Promise.all([
            api.products.list({ page_size: 100 }).then(data => data.results),
            api.categories.getByType('store'),
            api.brands.list(),
        ]);
    } catch {
        // O cliente mantém a retentativa e o estado de erro já existente.
    }

    return (
        <FeatureLayout>
            <Store
                initialProducts={initialProducts}
                initialCategories={initialCategories}
                initialBrands={initialBrands}
            />
        </FeatureLayout>
    );
}
