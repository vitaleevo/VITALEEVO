"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const Home: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const stats = [
    { label: 'Projetos Entregues', value: '500+' },
    { label: 'Clientes Satisfeitos', value: '250+' },
    { label: 'Anos de Experiência', value: '10+' },
    { label: 'Especialistas', value: '45' },
  ];

  const faqs = [
    { q: "Quais serviços a VitalEvo oferece?", a: "Oferecemos soluções completas em Design Gráfico, Desenvolvimento Web, Marketing Digital, Gestão de Redes Sociais, Infraestrutura de Redes, Sistemas Biométricos e Segurança Eletrônica." },
    { q: "Como posso solicitar um orçamento?", a: "Você pode clicar no botão 'Falar com Consultor' ou preencher o formulário na nossa página de contato. Respondemos em até 24 horas úteis." },
    { q: "A VitalEvo atende fora de Luanda?", a: "Sim! Embora nossa sede seja em Luanda, atendemos clientes em todo o território nacional e internacional de forma remota." },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0f172a]">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white font-medium text-sm tracking-wider uppercase shadow-lg shadow-purple-500/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                Conectando Possibilidades
              </div>

              <h1 className="font-display font-black text-5xl lg:text-7xl leading-[1.1] text-white tracking-tight">
                Eleve sua marca para a <span className="text-primary">Nova Era Digital</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Combinamos design futurista, tecnologia de ponta e estratégias de dados para criar experiências digitais que não apenas impressionam, mas convertem.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link
                  href="/contact"
                  className="group relative bg-[#8625d2] hover:bg-[#701db5] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(134,37,210,0.5)] transition-all hover:scale-105"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Solicitar Orçamento
                    <span className="material-icons-round text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </span>
                  <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                </Link>
                <Link
                  href="/portfolio"
                  className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Nossos Cases</span>
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center perspective-1000">
              <div className="relative w-full max-w-lg aspect-square lg:scale-125 animate-float will-change-transform">
                {/* Glow behind the card */}
                <div className="absolute inset-10 bg-primary opacity-30 rounded-full blur-[60px]"></div>

                {/* The Realistic Card Image */}
                <div className="relative z-10 w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-gpu rotate-[-10deg] hover:rotate-[0deg] transition-all duration-700 ease-out">
                  <img
                    src="/hero-card.webp"
                    alt="VitalEvo Digital Interface"
                    className="w-full h-auto object-contain pointer-events-none"
                  />
                </div>

                {/* Floating elements resembling UI components */}
                <div className="absolute -right-8 top-20 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                      <span className="material-icons-round">trending_up</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-bold">Crescimento</div>
                      <div className="text-white font-bold text-lg">+127%</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-4 bottom-20 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <span className="material-icons-round text-sm">storage</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-bold">Base de Dados</div>
                      <div className="text-white font-bold text-sm">Otimizada</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Glassmorphism */}
      <section className="py-12 bg-[#0f172a] border-t border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <p className="text-4xl md:text-5xl font-display font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                <p className="text-primary font-semibold uppercase tracking-wider text-xs md:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials - Modern Cards */}
      <section className="py-24 bg-white dark:bg-[#0b1120] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Nossos Diferenciais</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mt-4 mb-6">Excelência em Cada Pixel</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Entregamos mais do que software e design; entregamos resultados mensuráveis e experiências memoráveis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'diamond', title: 'Design Premium', desc: 'Interfaces que encantam e fidelizam usuários desde o primeiro clique.' },
              { icon: 'rocket_launch', title: 'Alta Performance', desc: 'Códigos otimizados para velocidade máxima e SEO de ponta.' },
              { icon: 'psychology', title: 'Estratégia IA', desc: 'Utilizamos inteligência artificial para otimizar campanhas e processos.' },
              { icon: 'verified_user', title: 'Segurança Total', desc: 'Proteção de dados e infraestrutura robusta para sua tranquilidade.' }
            ].map((item, idx) => (
              <div key={idx} className="group relative p-8 rounded-3xl bg-gray-50 dark:bg-[#151e32] border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons-round text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>

                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50 dark:bg-[#0f172a] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <span className="text-secondary font-bold tracking-widest uppercase text-sm">Depoimentos</span>
              <h2 className="font-display font-black text-3xl md:text-5xl text-gray-900 dark:text-white mt-2">O sucesso dos clientes</h2>
            </div>
            <Link href="/portfolio" className="text-primary font-bold hover:text-primary-dark transition-colors flex items-center gap-2">
              Ver todos os cases <span className="material-icons-round">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "João Silva", role: "CEO, Tech Angola", text: "A VitalEvo transformou nossa presença digital. O novo site triplicou nossos leads e a identidade visual nos colocou em outro patamar." },
              { name: "Maria Antónia", role: "Diretora de Marketing", text: "Profissionalismo impecável. A equipe entendeu nossa visão e entregou muito além do esperado. Recomendo fortemente." },
              { name: "Pedro Kiala", role: "Empreendedor", text: "Melhor agência em Luanda. Atendimento rápido, entrega de alta qualidade e suporte contínuo que faz a diferença." }
            ].map((t, i) => (
              <div key={i} className="bg-white dark:bg-[#1e293b]/50 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 relative hover:-translate-y-2 transition-transform duration-500">
                <div className="flex text-amber-400 mb-6">
                  {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-icons-round text-sm">star</span>)}
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic mb-8 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-sm text-primary font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white dark:bg-[#0b1120]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display font-black text-3xl text-center mb-12 text-gray-900 dark:text-white">Dúvidas Frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#151e32]">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  {faq.q}
                  <span className={`material-icons-round transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 mx-6 mt-2">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[#0f172a]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]"></div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-display font-black text-4xl md:text-6xl text-white mb-8 tracking-tight">
            Pronto para revolucionar seu negócio?
          </h2>
          <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto font-light">
            Junte-se às empresas líderes que escolheram a VitalEvo para construção do seu futuro digital.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/contact"
              className="bg-secondary hover:bg-emerald-400 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-[0_0_50px_-15px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-2 text-center"
            >
              Iniciar Projeto
            </Link>
            <Link
              href="/portfolio"
              className="bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all hover:-translate-y-2 text-center"
            >
              Ver Portfólio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
