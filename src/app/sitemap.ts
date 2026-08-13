import { MetadataRoute } from 'next';
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

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
        '/login',
        '/cadastro',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Produtos
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const products = await fetchQuery(api.products.getAll, {});
        productRoutes = products.map((product: any) => ({
            url: `${baseUrl}/store/${product._id}`,
            lastModified: new Date(product._creationTime),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }));
    } catch (e) { console.error("Sitemap: Failed to fetch products", e); }

    // Artigos do Blog
    let postRoutes: MetadataRoute.Sitemap = [];
    try {
        const posts = await fetchQuery(api.articles.getPublished, {});
        postRoutes = posts.map((post: any) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: new Date(post.createdAt || post._creationTime),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (e) { console.error("Sitemap: Failed to fetch posts", e); }

    // Portfólio
    let projectRoutes: MetadataRoute.Sitemap = [];
    try {
        const projects = await fetchQuery(api.projects.getVisibleProjects, {});
        projectRoutes = projects.map((project: any) => ({
            url: `${baseUrl}/portfolio/${project._id}`,
            lastModified: new Date(project.createdAt || project._creationTime),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));
    } catch (e) { console.error("Sitemap: Failed to fetch projects", e); }

    return [...routes, ...productRoutes, ...postRoutes, ...projectRoutes];
}
