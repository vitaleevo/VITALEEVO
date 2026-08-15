import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import ProductClient from "./ProductClient";
import FeatureLayout from "@/shared/components/FeatureLayout";

interface Props {
    params: Promise<{ slug: string }>;
}

async function resolveProduct(slug: string) {
    try {
        const bySlug = await fetchQuery(api.products.getBySlug, { slug });
        if (bySlug) return bySlug;
    } catch {
        // Slug not found; fall through to legacy ID lookup below.
    }
    try {
        return await fetchQuery(api.products.getById, { id: slug as Id<"products"> });
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const product = await resolveProduct(slug);
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
    const { slug } = await params;
    const product = await resolveProduct(slug);

    if (!product) {
        notFound();
    }

    return (
        <FeatureLayout>
            <ProductClient product={product} />
        </FeatureLayout>
    );
}
