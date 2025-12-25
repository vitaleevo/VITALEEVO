import { Metadata } from 'next';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Cart from '@/features/cart/components/Cart';

export const metadata: Metadata = {
    title: 'Carrinho | VitalEvo',
    description: 'Revise os itens do seu carrinho e finalize sua compra.',
};

export default function CartPage() {
    return (
        <FeatureLayout>
            <Cart />
        </FeatureLayout>
    );
}
