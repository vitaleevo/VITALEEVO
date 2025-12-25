import FeatureLayout from "@/shared/components/FeatureLayout";
import Blog from "@/features/blog/components/Blog";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog | VitalEvo',
    description: 'Fique por dentro das últimas novidades e insights sobre tecnologia e marketing.',
};

export default function BlogPage() {
    return (
        <FeatureLayout>
            <Blog />
        </FeatureLayout>
    );
}
