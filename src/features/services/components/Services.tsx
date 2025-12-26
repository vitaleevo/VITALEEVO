"use client";

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Calendar,
  Brush,
  Code,
  Smartphone,
  Rocket,
  Brain,
  BarChart3,
  Router,
  CheckCircle,
  ArrowRight,
  Headset,
  Zap,
  Shield,
  TrendingUp
} from "lucide-react";
import FeaturedProjectsSlider from '@/shared/components/FeaturedProjectsSlider';
import FeaturedArticlesSlider from '@/shared/components/FeaturedArticlesSlider';

const Services: React.FC = () => {
  const categories = [
    {
      icon: <Brush className="w-8 h-8 text-primary" />,
      title: 'Branding e Design',
      desc: 'Criamos identidades visuais memoráveis que conectam sua marca ao coração do público.',
      items: ['Logotipos & Identidade', 'UI/UX Design', 'Material Gráfico', 'Design Systems']
    },
    {
      icon: <Code className="w-8 h-8 text-primary" />,
      title: 'Desenvolvimento Web',
      desc: 'Sites e aplicações web de alta performance, seguros e otimizados para conversão.',
      items: ['Websites Institucionais', 'E-commerce', 'Sistemas Web (SaaS)', 'Landing Pages']
    },
    {
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      title: 'Apps Mobile',
      desc: 'Aplicativos nativos e híbridos que colocam seu negócio na palma da mão do cliente.',
      items: ['iOS & Android', 'React Native / Flutter', 'Prototipagem', 'Hospedagem em Lojas']
    },
    {
      icon: <Rocket className="w-8 h-8 text-primary" />,
      title: 'Marketing Digital',
      desc: 'Estratégias baseadas em dados para escalar suas vendas e presença online.',
      items: ['Gestão de Tráfego', 'SEO & Conteúdo', 'Social Media', 'E-mail Marketing']
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: 'Consultoria Tech',
      desc: 'Orientação especializada para modernizar processos e escolher as melhores ferramentas.',
      items: ['Transformação Digital', 'Arquitetura de Software', 'Auditoria de Código', 'Cloud Computing']
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: 'Data & Analytics',
      desc: 'Transforme dados brutos em insights acionáveis para tomadas de decisão inteligentes.',
      items: ['Dashboards BI', 'Google Analytics 4', 'Rastreament de Dados', 'Relatórios Mensais']
    },
    {
      icon: <Router className="w-8 h-8 text-primary" />,
      title: 'Infra E Segurança',
      desc: 'Soluções robustas para proteção e conectividade do seu negócio.',
      items: ['Redes e Cabeamento', 'Câmeras de Segurança (CFTV)', 'Sistemas Biométricos', 'Controlo de Acesso']
    }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0f172a]">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white font-medium text-sm tracking-wider uppercase shadow-lg shadow-purple-500/10 mb-8">
            <Layers className="w-4 h-4 text-secondary" />
            Soluções 360º
          </div>

          <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl leading-tight text-white mb-8">
            Tecnologia de ponta para <br className="hidden md:block" />
            <span className="text-primary">resultados reais</span>.
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Não entregamos apenas serviços; entregamos ecossistemas digitais completos. Do design à infraestrutura, cuidamos de tudo para que você foque no crescimento do seu negócio.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="group relative bg-[#8625d2] hover:bg-[#701db5] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(134,37,210,0.5)] transition-all hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Agendar Consultoria
                <Calendar className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Services Grid Section */}
      <section className="py-24 bg-white dark:bg-[#0b1120] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => {
              const slugMap: Record<string, string> = {
                'Branding e Design': 'branding-design',
                'Desenvolvimento Web': 'web-development',
                'Apps Mobile': 'mobile-apps',
                'Marketing Digital': 'marketing-digital',
                'Consultoria Tech': 'tech-consulting',
                'Data & Analytics': 'data-analytics',
                'Infra E Segurança': 'infra-security'
              };
              const slug = slugMap[cat.title] || '#';

              return (
                <Link key={idx} href={`/services/${slug}`} className="group relative p-8 rounded-[2rem] bg-gray-50 dark:bg-[#151e32] border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 block">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </div>

                  <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors">{cat.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-light">{cat.desc}</p>

                  <div className="space-y-3 border-t border-gray-200 dark:border-white/5 pt-6">
                    {cat.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-secondary" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-black/5 dark:ring-white/5 pointer-events-none"></div>

                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      Saber mais <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Slide Section - Featured Projects */}
      <FeaturedProjectsSlider />

      {/* Tech Stack Banner */}
      <section className="py-20 bg-[#0f172a] border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-10">Tecnologias que Dominamos</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind', 'Python', 'AWS', 'Flutter'].map((tech, i) => (
              <span key={i} className="text-2xl md:text-3xl font-black text-white/50 hover:text-white transition-colors cursor-default">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us (Detailed) */}
      <section className="py-24 bg-white dark:bg-[#0b1120] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-primary opacity-20 blur-3xl rounded-full"></div>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-video lg:aspect-square bg-gray-900">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <img src="https://images.unsplash.com/photo-1553877606-3c6691aac949?auto=format&fit=crop&q=80&w=800" alt="Team Working" className="w-full h-full object-cover" />

                <div className="absolute bottom-0 left-0 w-full p-8 z-20 bg-black/90">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                      <Headset className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Suporte Dedicado</p>
                      <p className="text-gray-300 text-sm">Acompanhamento pós-entrega incluso.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-secondary font-bold tracking-widest uppercase text-sm">Nosso Diferencial</span>
              <h2 className="font-display font-black text-3xl md:text-5xl text-gray-900 dark:text-white mt-4 mb-6 leading-tight">
                Por que empresas líderes escolhem a <span className="text-primary">VitalEvo?</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Não somos apenas "fazedores de sites". Somos engenheiros de crescimento. Cada linha de código que escrevemos tem um propósito comercial claro.
              </p>

              <div className="space-y-6">
                {[
                  { title: 'Velocidade Incomparável', desc: 'Sites que carregam em milissegundos, melhorando seu ranking no Google e a satisfação do cliente.', icon: <Zap className="w-6 h-6 text-primary" /> },
                  { title: 'Segurança Militar', desc: 'Proteção contra ataques DDoS, criptografia de dados e backups automáticos diários.', icon: <Shield className="w-6 h-6 text-primary" /> },
                  { title: 'Escalabilidade', desc: 'Sistemas preparados para crescer junto com seu negócio, sem necessidade de refazer tudo do zero.', icon: <TrendingUp className="w-6 h-6 text-primary" /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 group-hover:border-primary/50 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Slide Section - Featured Articles */}
      <FeaturedArticlesSlider />

      {/* Final CTA */}
      <section className="py-24 bg-gray-50 dark:bg-[#0f172a] border-t border-gray-200 dark:border-white/5 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-display font-black text-3xl md:text-5xl text-gray-900 dark:text-white mb-6">Tenha uma equipe de TI completa à sua disposição</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Por uma fração do custo de contratar internamente, você tem acesso a especialistas em Design, Desenvolvimento e Marketing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="bg-secondary hover:bg-emerald-400 text-white px-10 py-5 rounded-xl font-black text-xl shadow-xl shadow-secondary/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Falar com Especialistas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
