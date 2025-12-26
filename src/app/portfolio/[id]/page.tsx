import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from "lucide-react";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const { id } = params;

    try {
        const project = await fetchQuery(api.projects.getById, { id: id as Id<"projects"> });

        if (!project) {
            return { title: 'Projeto Não Encontrado' };
        }

        return {
            title: `${project.title} | VitalEvo Portfolio`,
            description: project.fullDescription || project.title,
        };
    } catch (e) {
        return { title: 'Projeto Não Encontrado' };
    }
}

export default async function ProjectPage(props: Props) {
    const params = await props.params;
    const { id } = params;

    let project;
    try {
        project = await fetchQuery(api.projects.getById, { id: id as Id<"projects"> });
    } catch (e) {
        notFound();
    }

    if (!project) {
        notFound();
    }

    return (
        <FeatureLayout>
            <div className="bg-white dark:bg-[#0b1120] min-h-screen">
                {/* Hero Header */}
                <div className="relative h-[60vh] min-h-[500px] w-full bg-[#0f172a] overflow-hidden">
                    <div className="absolute inset-0 opacity-60">
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-[#0f172a]/70"></div>

                    <div className="absolute bottom-0 left-0 w-full p-8 pb-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <Link href="/portfolio" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                                Voltar ao Portfolio
                            </Link>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{project.category}</span>
                                {project.year && <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold">{project.year}</span>}
                            </div>
                            <h1 className="font-display font-black text-4xl md:text-6xl text-white mb-4">{project.title}</h1>
                            {project.client && <p className="text-xl text-gray-300">Cliente: <span className="font-bold text-white">{project.client}</span></p>}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-16">

                            {/* Rich Text Description */}
                            {project.fullDescription && (
                                <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:font-bold prose-img:rounded-2xl">
                                    <div dangerouslySetInnerHTML={{ __html: project.fullDescription }} />
                                </div>
                            )}

                            {/* Challenge & Solution (Legacy/Optional fields) */}
                            {(project.challenge || project.solution) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-100 dark:border-white/5">
                                    {project.challenge && (
                                        <div>
                                            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-4">O Desafio</h2>
                                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {project.challenge}
                                            </p>
                                        </div>
                                    )}
                                    {project.solution && (
                                        <div>
                                            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-4">A Solução</h2>
                                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {project.solution}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Gallery Section */}
                            {project.images && project.images.length > 0 && (
                                <div className="pt-12 border-t border-gray-100 dark:border-white/5">
                                    <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-8">Galeria do Projeto</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {project.images.map((img: string, i: number) => (
                                            <div key={i} className={`relative overflow-hidden rounded-2xl group ${i % 3 === 0 ? 'md:col-span-2 aspect-video' : 'aspect-square'}`}>
                                                <img
                                                    src={img}
                                                    alt={`Gallery ${i}`}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-8">
                            <div className="bg-gray-50 dark:bg-[#151e32] p-8 rounded-3xl border border-gray-100 dark:border-white/5 sticky top-24">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-xl">Resultados Chave</h3>
                                <ul className="space-y-4 mb-8">
                                    {project.results && project.results.length > 0 ? project.results.map((res: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                            </div>
                                            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed">{res}</span>
                                        </li>
                                    )) : (
                                        <li className="text-gray-500 italic">Resultados em processamento.</li>
                                    )}
                                </ul>

                                <div className="border-t border-gray-200 dark:border-white/10 pt-6 mb-8">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Tecnologias</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags && project.tags.map((tag: string) => (
                                            <span key={tag} className="px-3 py-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-primary hover:border-primary/30 transition-colors">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-primary text-center text-white relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-30"></div>
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-lg mb-2">Gostou desse projeto?</h3>
                                        <p className="text-sm opacity-90 mb-5">Podemos fazer algo incrível pela sua empresa também.</p>
                                        <Link href="/contact" className="inline-block w-full bg-white text-primary px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                                            Falar Conosco
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
