import Link from 'next/link';
import FeatureLayout from '@/shared/components/FeatureLayout';
import { Home, Compass } from "lucide-react";

export default function NotFound() {
    return (
        <FeatureLayout>
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-light dark:bg-background-dark">
                {/* Background Elements */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-full w-full max-w-7xl -translate-x-1/2">
                    <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-primary-glow/40 blur-[120px]" />
                    <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-secondary-light/20 blur-[100px]" />
                </div>

                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.3]"></div>

                <div className="relative z-10 px-4 text-center">
                    <div className="relative mb-10 inline-block">
                        <h1 className="font-display text-[9rem] font-black leading-none text-slate-900/5 select-none md:text-[14rem] dark:text-white/10">
                            404
                        </h1>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-background-dark px-6 py-2 text-2xl font-bold uppercase tracking-widest text-white backdrop-blur-md md:text-3xl">
                            Página não encontrada
                        </div>
                    </div>

                    <p className="mx-auto mb-12 max-w-lg text-lg leading-relaxed text-slate-500 md:text-xl dark:text-gray-400">
                        Ops! Parece que você se perdeu no espaço digital. A página que você está
                        procurando não existe ou foi movida.
                    </p>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href="/" className="btn-primary px-8 py-4 text-lg">
                            <Home className="h-4 w-4" />
                            Voltar para o Início
                        </Link>
                        <Link href="/services" className="btn-ghost px-8 py-4 text-lg">
                            <Compass className="h-4 w-4" />
                            Explorar Serviços
                        </Link>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}