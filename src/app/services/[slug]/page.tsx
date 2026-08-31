import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { servicesData } from '@/features/services/data';
import { api } from '@/shared/utils/apiClient';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Layers,
    Monitor,
    Smartphone,
    Rocket,
    Brain,
    BarChart3,
    Router,
    Shield,
    Zap,
    TrendingUp,
    Target,
    BarChart,
    Eye,
    Type,
    Coins,
    MousePointer2,
    Lock,
    WifiOff,
    PiggyBank,
    Gavel,
    History,
    Search,
    Check
} from "lucide-react";

interface Props { params: Promise<{ slug: string }>; }

async function resolveService(slug: string) {
    try {
        const managed: any = await api.services.getBySlug(slug);
        const fallback: any = servicesData.find((item) => item.slug === slug);
        return {
            ...fallback,
            ...managed,
            image: managed.image || fallback?.image || '/images/heros/services.webp',
            features: managed.features || fallback?.features || [],
            benefits: managed.benefits?.length ? managed.benefits : (fallback?.benefits || []),
            process: managed.process?.length ? managed.process : (fallback?.process || []),
            ctaText: managed.ctaText || fallback?.ctaText || 'Solicitar proposta',
        };
    } catch {
        return servicesData.find((item) => item.slug === slug) || null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const service = await resolveService(slug);

    if (!service) return { title: 'Serviço Não Encontrado' };

    return {
        title: service.title,
        description: service.subtitle,
        openGraph: {
            title: `${service.title} | VitalEvo`,
            description: service.subtitle,
            type: 'article',
            url: `https://vitalevo.com/services/${slug}`,
            images: [{ url: service.image }],
        },
    };
}

// The dynamic page component
export default async function ServicePage({ params }: Props) {
    const { slug } = await params;
    const service = await resolveService(slug);

    if (!service) {
        notFound();
    }

    const IconComponent = (icon: string) => {
        switch (icon) {
            case 'visibility': return Eye;
            case 'style': return Type;
            case 'monetization_on': return Coins;
            case 'speed': return Zap;
            case 'shield': return Shield;
            case 'trending_up': return TrendingUp;
            case 'touch_app': return MousePointer2;
            case 'bolt': return Zap;
            case 'wifi_off': return WifiOff;
            case 'attach_money': return Coins;
            case 'target': return Target;
            case 'analytics': return BarChart;
            case 'savings': return PiggyBank;
            case 'rocket_launch': return Rocket;
            case 'gavel': return Gavel;
            case 'query_stats': return History;
            case 'screen_search_desktop': return Search;
            case 'check_circle': return Check;
            case 'router': return Router;
            case 'security': return Shield;
            case 'how_to_reg': return CheckCircle;
            default: return Check;
        }
    };

    return (
        <FeatureLayout>
            <div className="overflow-x-hidden">
                {/* ===== Hero ===== */}
                <section className="relative flex items-center justify-center overflow-hidden bg-background-light pt-28 pb-16 md:pb-24 dark:bg-background-dark">
                    <div className="absolute inset-0 -z-10">
                        <img src={service.image} alt={service.title} className="h-full w-full object-cover opacity-25" />
                        <div className="absolute inset-0 bg-gradient-to-b from-background-light/90 via-background-light/70 to-background-light dark:from-background-dark/95 dark:via-background-dark/70 dark:to-background-dark"></div>
                        <div className="absolute -left-40 top-0 h-[460px] w-[460px] rounded-full bg-primary-glow/50 blur-[120px]" />
                    </div>

                    <div className="wrap relative z-10 w-full pt-8">
                        <div className="max-w-4xl">
                            <Link href="/services" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-primary dark:text-slate-400">
                                <ArrowLeft className="h-4 w-4" />
                                Voltar para Serviços
                            </Link>

                            <span className="eyebrow mb-4">
                                <Layers className="h-4 w-4" />
                                Soluções 360º
                            </span>

                            <h1 className="mb-6 font-display text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-6xl dark:text-white">
                                {service.title.split(' ').map((word: string, i: number) => (
                                    <span key={i} className={i % 2 !== 0 ? "text-primary" : ""}>
                                        {word}{' '}
                                    </span>
                                ))}
                            </h1>

                            <p className="mb-10 max-w-2xl border-l-4 border-primary pl-6 text-xl font-light leading-relaxed text-slate-600 md:text-2xl dark:text-slate-300">
                                {service.subtitle}
                            </p>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Link
                                    href="/contact"
                                    className="btn-primary px-8 py-4 text-lg"
                                >
                                    {service.ctaText}
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <a
                                    href="#details"
                                    className="btn-ghost px-8 py-4 text-lg"
                                >
                                    Saber mais
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== Description & Features ===== */}
                <section id="details" className="section-pad bg-white dark:bg-[#0b1120]">
                    <div className="wrap">
                        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
                            {/* Left Content */}
                            <div className="w-full lg:w-1/2">
                                <span className="eyebrow mb-4 block">Sobre o Serviço</span>
                                <h2 className="mb-8 font-display text-3xl font-extrabold text-slate-900 md:text-4xl dark:text-white">
                                    Como transformamos o seu negócio com {service.title}
                                </h2>
                                <p className="mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                    {service.description}
                                </p>

                                <h3 className="mb-6 font-bold text-xl text-slate-900 dark:text-white">O que está incluso:</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {service.features.map((feature: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                                            <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Benefits */}
                            <div className="w-full space-y-6 lg:w-1/2">
                                {service.benefits.map((benefit: { icon: string; title: string; desc: string }, idx: number) => {
                                    const Icon = IconComponent(benefit.icon);
                                    return (
                                        <div key={idx} className="group flex rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-colors hover:border-primary/50 dark:border-white/5 dark:bg-[#151e32]">
                                            <div className="mr-6 flex-shrink-0">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg transition-transform group-hover:scale-110">
                                                    <Icon className="h-7 w-7" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{benefit.title}</h4>
                                                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{benefit.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== Process ===== */}
                <section className="section-pad relative overflow-hidden bg-background-light dark:bg-background-dark">
                    <div className="hidden h-1 w-full bg-white/10 dark:bg-white/5 lg:block absolute top-1/2 -translate-y-1/2"></div>
                    <div className="wrap relative z-10">
                        <div className="mb-12 text-center">
                            <span className="eyebrow justify-center mb-3">
                                <Monitor className="h-4 w-4" />
                                Metodologia
                            </span>
                            <h2 className="font-display text-3xl font-extrabold text-slate-900 md:text-5xl dark:text-white">Nosso Processo</h2>
                            <p className="mt-4 text-slate-500 dark:text-slate-400">Metodologia comprovada para resultados consistentes.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {service.process.map((step: { step: string; title: string; desc: string }, idx: number) => (
                                <div key={idx} className="group relative rounded-3xl border border-white/10 bg-white p-8 shadow-card transition-colors hover:border-primary/50 dark:bg-[#1e293b] dark:border-white/5">
                                    <span className="absolute right-6 top-4 text-6xl font-black text-slate-100 transition-colors group-hover:text-primary/20 dark:text-white/5">{step.step}</span>
                                    <h3 className="relative z-10 mb-4 mt-6 font-display text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                                    <p className="relative z-10 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== Final CTA ===== */}
                <section className="section-pad bg-white dark:bg-[#0b1120]">
                    <div className="wrap">
                        <div className="mx-auto max-w-3xl text-center">
                            <span className="eyebrow justify-center mb-3">
                                <Rocket className="h-4 w-4" />
                                Vamos começar?
                            </span>
                            <h2 className="mb-6 font-display text-4xl font-extrabold text-slate-900 md:text-5xl dark:text-white">
                                Pronto para começar?
                            </h2>
                            <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-500 dark:text-slate-400">
                                Não deixe para amanhã a inovação que pode mudar o seu negócio hoje.
                            </p>
                            <Link
                                href="/contact"
                                className="btn-primary px-12 py-5 text-xl"
                            >
                                {service.ctaText}
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </FeatureLayout>
    );
}
