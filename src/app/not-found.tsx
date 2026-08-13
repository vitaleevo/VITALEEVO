import Link from 'next/link';
import FeatureLayout from '@/shared/components/FeatureLayout';
import { Home } from "lucide-react";

export default function NotFound() {
    return (
        <FeatureLayout>
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center"></div>

                <div className="relative z-10 text-center px-4">
                    <div className="mb-8 relative inline-block">
                        <h1 className="font-display font-black text-[10rem] md:text-[14rem] leading-none text-white/10 select-none">
                            404
                        </h1>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-2xl md:text-3xl uppercase tracking-widest bg-[#0f172a] px-6 py-2 rounded-xl border border-white/10 whitespace-nowrap backdrop-blur-md">
                            Página não encontrada
                        </div>
                    </div>

                    <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
                        Ops! Parece que você se perdeu no espaço digital. A página que você está procurando não existe ou foi movida.
                    </p>

                    <Link
                        href="/"
                        className="group relative inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(134,37,210,0.5)] transition-all hover:scale-105"
                    >
                        <span>Voltar para o Início</span>
                        <Home className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </FeatureLayout>
    );
}
