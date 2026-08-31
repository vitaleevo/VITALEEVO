import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { api } from '@/shared/utils/apiClient';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, User, Share2, Eye } from "lucide-react";
import { formatDate } from "@/shared/utils/format";
import ShareButtons from '@/features/blog/components/ShareButtons';
import { sanitizeRichText } from "@/shared/utils/sanitize";

interface Props {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ preview?: string }>;
}

async function getPreviewToken(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const headerStore = await headers();
        const authHeader = headerStore.get('authorization') || headerStore.get('Authorization') || headerStore.get('x-preview-token');
        if (authHeader) {
            const bearer = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
            if (bearer) return bearer;
        }
        const candidates = ['vitaleevo_auth', 'token', 'auth_token', 'access_token', 'vitaleevo_token'];
        for (const name of candidates) {
            const raw = cookieStore.get(name)?.value;
            if (!raw) continue;
            try {
                const parsed = JSON.parse(raw);
                if (parsed?.token) return parsed.token as string;
                if (typeof parsed === 'string' && parsed.length > 10) return parsed;
                if (parsed?.access) return parsed.access as string;
            } catch {
                const cleaned = raw.startsWith('Bearer ') ? raw.slice(7).trim() : raw.trim();
                // remove surrounding quotes if any
                const unquoted = cleaned.replace(/^"|"$/g, '');
                if (unquoted) return unquoted;
            }
        }
        return null;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { slug } = await params;
    const sp = searchParams ? await searchParams : undefined;
    const isPreview = sp?.preview === 'true';
    let token: string | null = null;
    if (isPreview) token = await getPreviewToken();
    try {
        const article = await api.articles.getBySlug(slug, token ?? undefined);
        if (!article) return { title: 'Artigo Não Encontrado' };

        // Draft não deve expor metadados indexáveis em preview
        const isDraft = (article as any).status && (article as any).status !== 'published';
        if (isDraft && !isPreview) return { title: 'Artigo Não Encontrado' };

        return {
            title: article.seoTitle || article.title,
            description: article.seoDescription || article.excerpt,
            openGraph: {
                title: `${article.seoTitle || article.title} | Vitaleevo Blog`,
                description: article.seoDescription || article.excerpt,
                type: 'article',
                url: `https://vitaleevo.ao/blog/${slug}`,
                images: [{ url: article.image }],
            },
            ...(isPreview && isDraft ? { robots: { index: false, follow: false } } : {}),
        };
    } catch (error) {
        console.error("Failed to fetch article metadata:", error);
        return { title: 'Blog | Vitaleevo' };
    }
}

export default async function ArticlePage({ params, searchParams }: Props) {
    const { slug } = await params;
    const sp = searchParams ? await searchParams : undefined;
    const isPreview = sp?.preview === 'true';
    let previewToken: string | null = null;
    if (isPreview) previewToken = await getPreviewToken();

    let article = null;
    try {
        article = await api.articles.getBySlug(slug, previewToken ?? undefined);
    } catch (error) {
        console.error("Failed to fetch article for page:", error);
    }

    if (!article) {
        notFound();
    }

    const articleStatus = (article as any).status as string | undefined;
    const isDraft = articleStatus && articleStatus !== 'published';
    if (isDraft && !isPreview) {
        notFound();
    }
    const showPreviewBanner = isPreview && isDraft;

    return (
        <FeatureLayout>
            <div className="bg-white dark:bg-[#0b1120] min-h-screen pt-32 pb-24">
                {showPreviewBanner && (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
                        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
                            <Eye className="h-5 w-5 shrink-0" />
                            <span className="font-semibold">Modo Preview —</span>
                            <span>Este artigo está em rascunho (status: {articleStatus}) e é visível apenas para staff com permissão <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/40">content:manage</code>.</span>
                        </div>
                    </div>
                )}
                <div className="max-w-4xl mx-auto px-4 sm:px-6">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs mb-6 hover:underline group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Voltar para o Blog
                        </Link>

                        <div className="flex items-center justify-center gap-4 mb-6">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                {article.category}
                            </span>
                            <span className="text-gray-400 text-sm flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" /> {formatDate(article.createdAt)}
                            </span>
                            <span className="text-gray-400 text-sm flex items-center gap-1.5">
                                <Clock className="w-4 h-4" /> {article.readTime}
                            </span>
                        </div>

                        <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-gray-900 dark:text-white mb-8 leading-tight">
                            {article.title}
                        </h1>

                        <div className="flex items-center justify-center gap-4 py-6 border-y border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                {article.authorImage ? (
                                    <img src={article.authorImage} alt={article.author} className="w-12 h-12 rounded-full border-2 border-white dark:border-[#0b1120] shadow-sm" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="text-gray-900 dark:text-white font-bold text-sm">{article.author}</p>
                                    <p className="text-gray-500 text-xs">{article.authorRole || 'Especialista'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="relative mb-16 aspect-video overflow-hidden rounded-3xl shadow-card">
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary-dark mx-auto prose-p:leading-relaxed prose-p:mb-6 prose-headings:mt-8">
                        <p className="lead text-xl text-gray-600 dark:text-gray-300 font-light mb-12 border-l-4 border-primary pl-6 italic">
                            {article.excerpt}
                        </p>
                        <div
                            className="article-content"
                            dangerouslySetInnerHTML={{ __html: sanitizeRichText(article.content || '') }}
                        />
                    </div>

                    {/* Share & Footer */}
                    <div className="mt-20 pt-10 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                            <Share2 className="w-5 h-5 text-primary" />
                            Compartilhe esse artigo:
                        </div>
                        <ShareButtons slug={slug} title={article.title} />
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
