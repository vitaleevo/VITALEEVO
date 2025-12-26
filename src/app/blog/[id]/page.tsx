import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles } from '@/features/blog/data';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";

interface Props {
    params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const article = articles.find((a) => a.id === id);

    if (!article) return { title: 'Artigo Não Encontrado' };

    return {
        title: article.title,
        description: article.excerpt,
        openGraph: {
            title: `${article.title} | VitalEvo Blog`,
            description: article.excerpt,
            type: 'article',
            url: `https://vitalevo.com/blog/${id}`,
            images: [{ url: article.image }],
        },
    };
}

export default async function ArticlePage({ params }: Props) {
    const { id } = await params;
    const article = articles.find((a) => a.id === id);

    if (!article) {
        notFound();
    }

    return (
        <FeatureLayout>
            <div className="bg-white dark:bg-[#0b1120] min-h-screen pt-32 pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs mb-6 hover:underline">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para o Blog
                        </Link>

                        <div className="flex items-center justify-center gap-4 mb-6">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">{article.category}</span>
                            <span className="text-gray-400 text-sm">{article.date} · {article.readTime}</span>
                        </div>

                        <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-gray-900 dark:text-white mb-8 leading-tight">
                            {article.title}
                        </h1>

                        <div className="flex items-center justify-center gap-3">
                            {article.authorImage && (
                                <img src={article.authorImage} alt={article.author} className="w-12 h-12 rounded-full border-2 border-white dark:border-[#0b1120]" />
                            )}
                            <div className="text-left">
                                <p className="text-gray-900 dark:text-white font-bold text-sm">{article.author}</p>
                                <p className="text-gray-500 text-xs">{article.authorRole}</p>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="rounded-[2rem] overflow-hidden mb-16 shadow-2xl">
                        <img src={article.image} alt={article.title} className="w-full object-cover max-h-[500px]" />
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary-dark mx-auto">
                        <p className="lead text-xl text-gray-600 dark:text-gray-300 font-light mb-8 border-l-4 border-primary pl-6 italic">
                            {article.excerpt}
                        </p>
                        <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
                    </div>

                    {/* Share & Tags */}
                    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                        <div className="font-bold text-gray-900 dark:text-white">Compartilhar:</div>
                        <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                                <span className="text-sm font-bold">in</span>
                            </button>
                            <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors">
                                <span className="text-sm font-bold">tw</span>
                            </button>
                            <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                                <span className="text-sm font-bold">wa</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
