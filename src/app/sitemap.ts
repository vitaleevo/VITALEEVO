import { MetadataRoute } from 'next';
import { request } from '@/shared/utils/apiClient';

export const dynamic = "force-dynamic";

interface SitemapItem { slug: string; updated_at?: string | null; }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://vitaleevo.ao';

    // Páginas estáticas principais
    const routes = [
        '',
        '/store',
        '/blog',
        '/portfolio',
        '/services',
        '/contact',
        '/about',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Produtos
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const data = await request<{ results: SitemapItem[] }>("/catalog/products/", { params: { page_size: 200 } });
        productRoutes = data.results.map((product) => ({
            url: `${baseUrl}/store/${product.slug}`,
            lastModified: new Date(product.updated_at || Date.now()),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }));
    } catch (e) { console.error("Sitemap: Failed to fetch products", e); }

    // Artigos do Blog
    let postRoutes: MetadataRoute.Sitemap = [];
    try {
        const data = await request<{ results: SitemapItem[] }>("/blog/articles/", { params: { page_size: 200 } });
        postRoutes = data.results.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: new Date(post.updated_at || Date.now()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (e) { console.error("Sitemap: Failed to fetch posts", e); }

    // Serviços
    let serviceRoutes: MetadataRoute.Sitemap = [];
    try {
        const data = await request<{ results: SitemapItem[] }>("/cms/services/", { params: { page_size: 200 } });
        serviceRoutes = data.results.map((service) => ({
            url: `${baseUrl}/services/${service.slug}`,
            lastModified: new Date(service.updated_at || Date.now()),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));
    } catch (e) { console.error("Sitemap: Failed to fetch services", e); }

    // Documentos legais publicados
    let legalRoutes: MetadataRoute.Sitemap = [];
    try {
        const data = await request<{ results: SitemapItem[] }>("/cms/legal-documents/", { params: { page_size: 200 } });
        legalRoutes = data.results.map((doc) => ({
            url: `${baseUrl}/legal/${doc.slug}`,
            lastModified: new Date(doc.updated_at || Date.now()),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        }));
    } catch (e) { console.error("Sitemap: Failed to fetch legal docs", e); }

    // Portfólio
    let projectRoutes: MetadataRoute.Sitemap = [];
    try {
        const data = await request<{ results: SitemapItem[] }>("/portfolio/projects/", { params: { page_size: 200 } });
        projectRoutes = data.results.map((project) => ({
            url: `${baseUrl}/portfolio/${project.slug}`,
            lastModified: new Date(project.updated_at || Date.now()),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));
    } catch (e) { console.error("Sitemap: Failed to fetch projects", e); }

    return [...routes, ...serviceRoutes, ...legalRoutes, ...productRoutes, ...postRoutes, ...projectRoutes];
}