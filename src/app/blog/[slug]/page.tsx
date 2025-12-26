import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, User, Share2 } from "lucide-react";
import { formatDate } from "@/shared/utils/format";

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const article = await fetchQuery(api.articles.getBySlug, { slug });
        if (!article) return { title: 'Artigo Não Encontrado' };

        return {
            title: article.title,
            description: article.excerpt,
            openGraph: {
                title: `${article.title} | Vitaleevo Blog`,
                description: article.excerpt,
                type: 'article',
                url: `https://vitaleevo.ao/blog/${slug}`,
                images: [{ url: article.image }],
            },
        };
    } catch (error) {
        console.error("Failed to fetch article metadata:", error);
        return { title: 'Blog | Vitaleevo' };
    }
}

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params;
    let article = null;
    try {
        article = await fetchQuery(api.articles.getBySlug, { slug });
    } catch (error) {
        console.error("Failed to fetch article for page:", error);
    }

    if (!article) {
        notFound();
    }

    return (
        <FeatureLayout>
            <div className="bg-white dark:bg-[#0b1120] min-h-screen pt-32 pb-24">
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
                    <div className="rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl relative aspect-video">
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
                            dangerouslySetInnerHTML={{ __html: article.content || '' }}
                        />
                    </div>

                    {/* Share & Footer */}
                    <div className="mt-20 pt-10 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                            <Share2 className="w-5 h-5 text-primary" />
                            Compartilhe esse artigo:
                        </div>
                        <div className="flex gap-3">
                            <button className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white font-bold hover:bg-primary hover:text-white transition-all">
                                LinkedIn
                            </button>
                            <button className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white font-bold hover:bg-[#1DA1F2] hover:text-white transition-all">
                                Twitter
                            </button>
                            <button className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white font-bold hover:bg-[#25D366] hover:text-white transition-all">
                                WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
