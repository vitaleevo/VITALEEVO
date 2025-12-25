"use client";

import React from 'react';
import Link from 'next/link';

const About: React.FC = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0f172a]">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 mb-32">

            {/* Image Side */}
            <div className="w-full lg:w-1/2 relative perspective-1000">
              <div className="relative animate-float will-change-transform">
                <div className="absolute inset-0 bg-primary opacity-30 rounded-[2rem] blur-[40px] transform rotate-3"></div>
                <img
                  alt="About Us"
                  className="rounded-[2rem] shadow-2xl relative z-10 w-full object-cover h-[500px] border border-white/10"
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                />
                {/* Floating Stats */}
                <div className="absolute -bottom-6 -right-6 bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl z-20 hidden md:block max-w-xs animate-float" style={{ animationDelay: '1.5s' }}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-secondary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                    </span>
                    <span className="text-secondary font-bold text-sm uppercase tracking-wider">Experiência</span>
                  </div>
                  <p className="font-display font-black text-5xl mb-1 text-white">10+</p>
                  <p className="text-sm font-medium text-gray-300">Anos transformando negócios digitais em Angola.</p>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div className="w-full lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white font-medium text-sm tracking-wider uppercase shadow-lg shadow-purple-500/10 mb-6">
                <span className="material-icons-round text-sm text-secondary">verified</span>
                Quem Somos
              </div>

              <h1 className="font-display font-black text-4xl md:text-5xl lg:text-px leading-tight text-white mb-6">
                Nós somos a <span className="text-primary">VitalEvo</span>.
              </h1>

              <p className="text-lg text-gray-400 mb-6 leading-relaxed font-light">
                Mais do que uma agência digital, somos parceiros estratégicos para empresas que desejam liderar o mercado angolano. Unificamos criatividade, dados e tecnologia para construir marcas fortes e duradouras.
              </p>

              <div className="relative pl-6 border-l-2 border-secondary/30 my-8">
                <p className="text-xl text-gray-300 italic font-light leading-relaxed">
                  "Acreditamos que o potencial de Angola é ilimitado. Nossa missão é desbloquear esse potencial através da transformação digital."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values Section */}
      <section className="py-24 bg-white dark:bg-[#0b1120] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Nossa Bússola</span>
            <h2 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mt-4">Missão, Visão e Valores</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Os pilares que sustentam cada linha de código, cada pixel e cada estratégia que desenvolvemos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="group p-8 rounded-3xl bg-gray-50 dark:bg-[#151e32] border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <span className="material-icons-round text-3xl">flag</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-4">Missão</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Empoderar empresas angolanas com soluções digitais de classe mundial, transformando desafios locais em oportunidades globais através da inovação e excelência técnica.
              </p>
            </div>

            {/* Vision */}
            <div className="group p-8 rounded-3xl bg-gray-50 dark:bg-[#151e32] border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <span className="material-icons-round text-3xl">visibility</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-4">Visão</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Ser o principal catalisador da economia digital em Angola até 2030, reconhecidos como referência em qualidade, integridade e impacto real nos negócios.
              </p>
            </div>

            {/* Values */}
            <div className="group p-8 rounded-3xl bg-gray-50 dark:bg-[#151e32] border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                <span className="material-icons-round text-3xl">diamond</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-4">Valores</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Inovação Constante</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Transparência Radical</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Foco no Cliente</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Excelência Angolana</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Focus on Angola Market */}
      <section className="py-24 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold uppercase tracking-wider mb-6">
                Compromisso Nacional
              </span>
              <h2 className="font-display font-black text-4xl lg:text-5xl text-white mb-6 leading-tight">
                Objetivos para o Mercado <span className="text-secondary">Angolano</span>
              </h2>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                O mercado angolano é vibrante, cheio de potencial e único. Não trazemos apenas soluções prontas; adaptamos a tecnologia de ponta à realidade local para resolver problemas reais.
              </p>

              <div className="space-y-6">
                {[
                  { title: 'Digitalização de PMEs', desc: 'Levar ferramentas de gestão e presença online para pequenas e médias empresas, a espinha dorsal da economia.' },
                  { title: 'Educação Tecnológica', desc: 'Capacitar equipes locais com workshops e transferências de conhecimento em cada projeto.' },
                  { title: 'Conectividade Global', desc: 'Criar plataformas que permitam produtos angolanos alcançarem mercados internacionais.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <span className="material-icons-round text-secondary">{['storefront', 'school', 'public'][i]}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{item.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-primary opacity-30 blur-2xl rounded-3xl"></div>
              <div className="relative bg-[#151e32] border border-white/10 p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-gray-400 text-sm uppercase font-bold">Crescimento Digital (Estimado)</p>
                    <h3 className="text-3xl text-white font-black">2024 - 2030</h3>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                    <span className="material-icons-round">trending_up</span>
                  </div>
                </div>
                {/* Abstract Chart Representation */}
                <div className="h-48 flex items-end gap-2">
                  {[30, 45, 40, 60, 75, 65, 90, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary rounded-t-lg relative group" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {h}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between text-sm text-gray-400">
                  <span>Adoção Tech</span>
                  <span>Impacto Econômico</span>
                  <span>Inovação</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Process Section */}
      <section className="py-24 bg-white dark:bg-[#0b1120] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Metodologia</span>
            <h2 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mt-4">Nosso Processo de Trabalho</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="relative">
            {/* Connecting Line (Hidden on mobile) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-primary/20 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                { icon: 'search', title: 'Imersão', desc: 'Entendemos profundamente seus objetivos e mercado.' },
                { icon: 'architecture', title: 'Estratégia', desc: 'Definimos o plano de ação e cronograma.' },
                { icon: 'code', title: 'Execução', desc: 'Designers e devs trabalham juntos para dar vida.' },
                { icon: 'rocket_launch', title: 'Entrega', desc: 'Lançamento e monitoramento contínuo.' }
              ].map((step, idx) => (
                <div key={idx} className="group relative p-8 pt-12 rounded-3xl bg-gray-50 dark:bg-[#151e32] border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 text-center">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full bg-[#0f172a] border-4 border-gray-50 dark:border-[#0b1120] flex items-center justify-center z-20 shadow-xl">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
                      <span className="font-black text-lg">{idx + 1}</span>
                    </div>
                  </div>

                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                      <span className="material-icons-round text-3xl">{step.icon}</span>
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50 dark:bg-[#0f172a] border-t border-gray-200 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display font-black text-3xl md:text-5xl text-gray-900 dark:text-white mb-6">Pronto para transformar sua empresa?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Junte-se à VitalEvo e faça parte da revolução digital em Angola. Vamos construir o futuro juntos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Falar com um Especialista
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
