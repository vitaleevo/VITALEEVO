import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { api } from '@/shared/utils/apiClient';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, ArrowRight, Eye } from "lucide-react";
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
                const unquoted = cleaned.replace(/^"|"$/g, '');
                if (unquoted) return unquoted;
            }
        }
        return null;
    } catch {
        return null;
    }
}

async function resolveProject(slug: string, token?: string | null) {
    try {
        return await api.projects.getBySlug(slug, token ?? undefined);
    } catch {
        return null;
    }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const { slug } = params;
    const sp = props.searchParams ? await props.searchParams : undefined;
    const isPreview = sp?.preview === 'true';
    const token = isPreview ? await getPreviewToken() : null;

    try {
        const project = await resolveProject(slug, token);

        if (!project) {
            return { title: 'Projeto Não Encontrado' };
        }

        const isDraft = (project as any).status && (project as any).status !== 'published';
        if (isDraft && !isPreview) return { title: 'Projeto Não Encontrado' };

        return {
            title: `${project.seoTitle || project.title} | VitalEvo Portfolio`,
            description: project.seoDescription || project.description || project.fullDescription || project.title,
            ...(isPreview && isDraft ? { robots: { index: false, follow: false } } : {}),
        };
    } catch (e) {
        return { title: 'Projeto Não Encontrado' };
    }
}

export default async function ProjectPage(props: Props) {
    const params = await props.params;
    const { slug } = params;
    const sp = props.searchParams ? await props.searchParams : undefined;
    const isPreview = sp?.preview === 'true';
    const previewToken = isPreview ? await getPreviewToken() : null;

    const project = await resolveProject(slug, previewToken);

    if (!project) {
        notFound();
    }

    const projectStatus = (project as any).status as string | undefined;
    const isDraft = projectStatus && projectStatus !== 'published';
    if (isDraft && !isPreview) {
        notFound();
    }
    const showPreviewBanner = isPreview && isDraft;

    return (
        <FeatureLayout>
            {showPreviewBanner && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-900/50">
                    <div className="wrap flex items-center gap-3 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                        <Eye className="h-5 w-5 shrink-0" />
                        <span className="font-semibold">Modo Preview —</span>
                        <span>Este projeto está em rascunho (status: {projectStatus}) e é visível apenas para staff com permissão <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-900/40">content:manage</code>.</span>
                    </div>
                </div>
            )}
            <div className="min-h-screen bg-white dark:bg-[#0b1120]">
                {/* Hero Header */}
                <div className="relative h-[55vh] min-h-[420px] w-full overflow-hidden bg-background-light dark:bg-background-dark">
                    <div className="absolute inset-0 opacity-40">
                        <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background-light via-background-light/60 to-transparent dark:from-background-dark dark:via-background-dark/70"></div>

                    <div className="absolute bottom-0 left-0 w-full p-8 pb-14">
                        <div className="wrap">
                            <Link href="/portfolio" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-primary dark:text-slate-400">
                                <ArrowLeft className="h-5 w-5" />
                                Voltar ao Portfolio
                            </Link>
                            <div className="mb-4 flex flex-wrap gap-2">
                                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">{project.category}</span>
                                {project.year && <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-sm dark:bg-white/10 dark:text-white">{project.year}</span>}
                            </div>
                            <h1 className="mb-4 font-display text-4xl font-extrabold leading-tight text-slate-900 md:text-6xl dark:text-white">{project.title}</h1>
                            {project.client && <p className="text-xl text-slate-500 dark:text-slate-400">Cliente: <span className="font-bold text-slate-900 dark:text-white">{project.client}</span></p>}
                        </div>
                    </div>
                </div>

                <div className="wrap py-20">
                    <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-16 lg:col-span-2">
                            {/* Rich Text Description */}
                            {project.fullDescription && (
                                <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:font-bold prose-img:rounded-2xl">
                                    <div dangerouslySetInnerHTML={{ __html: sanitizeRichText(project.fullDescription) }} />
                                </div>
                            )}

                            {/* Challenge & Solution */}
                            {(project.challenge || project.solution) && (
                                <div className="grid grid-cols-1 gap-12 border-t border-gray-100 pt-8 md:grid-cols-2 dark:border-white/5">
                                    {project.challenge && (
                                        <div>
                                            <h2 className="mb-4 font-display text-2xl font-bold text-slate-900 dark:text-white">O Desafio</h2>
                                            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                                {project.challenge}
                                            </p>
                                        </div>
                                    )}
                                    {project.solution && (
                                        <div>
                                            <h2 className="mb-4 font-display text-2xl font-bold text-slate-900 dark:text-white">A Solução</h2>
                                            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                                {project.solution}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Gallery Section */}
                            {project.images && project.images.length > 0 && (
                                <div className="border-t border-gray-100 pt-12 dark:border-white/5">
                                    <h2 className="mb-8 font-display text-3xl font-bold text-slate-900 dark:text-white">Galeria do Projeto</h2>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {project.images.map((img: string, i: number) => (
                                            <div key={i} className={`group relative overflow-hidden rounded-2xl ${i % 3 === 0 ? 'aspect-video md:col-span-2' : 'aspect-square'}`}>
                                                <img
                                                    src={img}
                                                    alt={`Gallery ${i}`}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-8">
                            <div className="sticky top-24 rounded-3xl border border-gray-100 bg-gray-50 p-8 dark:border-white/5 dark:bg-[#151e32]">
                                <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Resultados Chave</h3>
                                <ul className="mb-8 space-y-4">
                                    {project.results && project.results.length > 0 ? project.results.map((res: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                            </div>
                                            <span className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">{res}</span>
                                        </li>
                                    )) : (
                                        <li className="italic text-slate-500">Resultados em processamento.</li>
                                    )}
                                </ul>

                                <div className="mb-8 border-t border-gray-200 pt-6 dark:border-white/10">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Tecnologias</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags && project.tags.map((tag: string) => (
                                            <span key={tag} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-primary/30 hover:text-primary dark:border-white/10 dark:bg-black/20 dark:text-slate-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-center text-white">
                                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-30"></div>
                                    <div className="relative z-10">
                                        <h3 className="mb-2 text-lg font-bold">Gostou desse projeto?</h3>
                                        <p className="mb-5 text-sm opacity-90">Podemos fazer algo incrível pela sua empresa também.</p>
                                        <Link href="/contact" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary shadow-lg transition-transform hover:scale-105">
                                            Falar Conosco <ArrowRight className="h-4 w-4" />
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
