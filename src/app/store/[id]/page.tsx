import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import ProductClient from "./ProductClient";
import FeatureLayout from "@/shared/components/FeatureLayout";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const product = await fetchQuery(api.products.getById, { id: id as Id<"products"> });
        if (!product) return { title: 'Produto Não Encontrado' };

        return {
            title: product.name,
            description: product.description,
            openGraph: {
                title: `${product.name} | Vitaleevo Loja`,
                description: product.description,
                images: [{ url: product.image }],
                type: 'website',
            },
        };
    } catch (error) {
        return { title: 'Loja | Vitaleevo' };
    }
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    let product = null;
    try {
        product = await fetchQuery(api.products.getById, { id: id as Id<"products"> });
    } catch (e) {
        console.error("Failed to fetch product:", e);
    }

    if (!product) {
        notFound();
    }

    return (
        <FeatureLayout>
            <ProductClient product={product} />
        </FeatureLayout>
    );
}
