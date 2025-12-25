import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { servicesData } from '@/features/services/data';
import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';

interface Props {
    params: { slug: string };
}

// Generate metadata for each page for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const service = servicesData.find((s) => s.slug === slug);

    if (!service) {
        return {
            title: 'Serviço Não Encontrado',
        };
    }

    return {
        title: `${service.title} | VitalEvo`,
        description: service.subtitle,
    };
}

// The dynamic page component
export default async function ServicePage({ params }: Props) {
    const { slug } = await params;
    const service = servicesData.find((s) => s.slug === slug);

    if (!service) {
        notFound();
    }

    return (
        <FeatureLayout>
            <div className="overflow-x-hidden">
                {/* Hero Section with Parallax Feel */}
                <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0f172a]">

                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-[#0f172a]/70 z-10"></div>
                        <img src={service.image} alt={service.title} className="w-full h-full object-cover opacity-60" />
                    </div>

                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 z-10 pointer-events-none"></div>

                    {/* Floating Abstract Shapes */}
                    <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-slow z-10"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full pt-20">
                        <div className="max-w-4xl">
                            <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                                <span className="material-icons-round text-sm">arrow_back</span>
                                <span className="text-sm font-bold uppercase tracking-wider">Voltar para Serviços</span>
                            </Link>

                            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight">
                                {service.title.split(' ').map((word, i) => (
                                    <span key={i} className={i % 2 !== 0 ? "text-primary" : ""}>
                                        {word}{' '}
                                    </span>
                                ))}
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed mb-12 max-w-2xl border-l-4 border-primary pl-6">
                                {service.subtitle}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/contact"
                                    className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(134,37,210,0.6)] hover:shadow-primary/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    {service.ctaText}
                                    <span className="material-icons-round">arrow_forward</span>
                                </Link>
                                <a
                                    href="#details"
                                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center"
                                >
                                    Saber mais
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Description & Features */}
                <section id="details" className="py-24 bg-white dark:bg-[#0b1120] relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

                            {/* Left Content */}
                            <div className="w-full lg:w-1/2">
                                <span className="text-secondary font-bold text-sm uppercase tracking-widest mb-4 block">Sobre o Serviço</span>
                                <h2 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-8">
                                    Como transformamos o seu negócio com {service.title}
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                    {service.description}
                                </p>

                                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6">O que está incluso:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {service.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                            <span className="material-icons-round text-primary">check_circle</span>
                                            <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Benefits Cards */}
                            <div className="w-full lg:w-1/2 space-y-6">
                                {service.benefits.map((benefit, idx) => (
                                    <div key={idx} className="flex group bg-white dark:bg-[#151e32] p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-colors">
                                        <div className="flex-shrink-0 mr-6">
                                            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                                <span className="material-icons-round text-2xl">{benefit.icon}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{benefit.title}</h4>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Process Steps Dark */}
                <section className="py-24 bg-[#0f172a] relative overflow-hidden">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 hidden lg:block"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="font-display font-black text-3xl md:text-5xl text-white">Nosso Processo</h2>
                            <p className="text-gray-400 mt-4">Metodologia comprovada para resultados consistentes.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {service.process.map((step, idx) => (
                                <div key={idx} className="relative bg-[#1e293b] p-8 rounded-3xl border border-white/5 hover:border-primary/50 transition-colors group">
                                    <span className="absolute -top-6 left-8 text-6xl font-black text-white/5 group-hover:text-primary/20 transition-colors">{step.step}</span>
                                    <h3 className="font-display font-bold text-xl text-white mb-4 mt-4 relative z-10">{step.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed relative z-10">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 bg-white dark:bg-[#0b1120]">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white mb-6">
                            Pronto para começar?
                        </h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
                            Não deixe para amanhã a inovação que pode mudar o seu negócio hoje.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block bg-secondary hover:bg-emerald-400 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-xl shadow-secondary/30 transition-all hover:scale-105"
                        >
                            {service.ctaText}
                        </Link>
                    </div>
                </section>

            </div>
        </FeatureLayout>
    );
}
