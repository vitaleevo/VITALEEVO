import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects } from '@/features/portfolio/data';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';

interface Props {
    params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const project = projects.find((p) => p.id === id);

    if (!project) {
        return { title: 'Projeto Não Encontrado' };
    }

    return {
        title: `${project.title} | VitalEvo Portfolio`,
        description: project.fullDescription || project.title,
    };
}

export default async function ProjectPage({ params }: Props) {
    const { id } = await params;
    const project = projects.find((p) => p.id === id);

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
                                <span className="material-icons-round">arrow_back</span>
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
                        <div className="lg:col-span-2 space-y-12">
                            <div>
                                <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-4">O Desafio</h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {project.challenge || "Descrição do desafio do projeto."}
                                </p>
                            </div>

                            <div>
                                <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-4">A Solução</h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {project.solution || "Detalhes da solução implementada."}
                                </p>
                            </div>

                            {/* Gallery Placeholders */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="aspect-video bg-gray-100 dark:bg-[#151e32] rounded-2xl"></div>
                                <div className="aspect-video bg-gray-100 dark:bg-[#151e32] rounded-2xl"></div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-8">
                            <div className="bg-gray-50 dark:bg-[#151e32] p-8 rounded-3xl border border-gray-100 dark:border-white/5">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-6">Resultados Chave</h3>
                                <ul className="space-y-4">
                                    {project.results ? project.results.map((res, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="material-icons-round text-green-500 mt-1">check_circle</span>
                                            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{res}</span>
                                        </li>
                                    )) : (
                                        <li className="text-gray-500 italic">Resultados em processamento.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="bg-gray-50 dark:bg-[#151e32] p-8 rounded-3xl border border-gray-100 dark:border-white/5">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Tecnologias</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-primary text-center text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-xl mb-4">Gostou desse projeto?</h3>
                                    <p className="text-sm opacity-90 mb-6">Podemos fazer algo incrível pela sua empresa também.</p>
                                    <Link href="/contact" className="inline-block bg-white text-primary px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                                        Falar Conosco
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
