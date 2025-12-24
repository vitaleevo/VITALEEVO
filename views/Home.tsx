
import React, { useState } from 'react';
import { View } from '../types';

interface HomeProps {
  onNavigate: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const stats = [
    { label: 'Projetos Entregues', value: '500+' },
    { label: 'Clientes Satisfeitos', value: '250+' },
    { label: 'Anos de Experiência', value: '10+' },
    { label: 'Especialistas', value: '45' },
  ];

  const faqs = [
    { q: "Quais serviços a VitalEvo oferece?", a: "Oferecemos soluções completas em Design Gráfico, Desenvolvimento Web, Marketing Digital, Gestão de Redes Sociais e Infraestrutura de TI." },
    { q: "Como posso solicitar um orçamento?", a: "Você pode clicar no botão 'Falar com Consultor' ou preencher o formulário na nossa página de contato. Respondemos em até 24 horas úteis." },
    { q: "A VitalEvo atende fora de Luanda?", a: "Sim! Embora nossa sede seja em Luanda, atendemos clientes em todo o território nacional e internacional de forma remota." },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-white font-semibold text-sm tracking-wider uppercase">
                <span className="material-icons-round text-sm text-secondary">bolt</span>
                Conectando Possibilidades em Angola
              </div>
              <h1 className="font-display font-black text-4xl md:text-5xl lg:text-7xl leading-tight text-gray-900 dark:text-white">
                Onde a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Inovação</span> encontra o <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-green-400">Resultados</span>.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Transformamos marcas através de tecnologia de ponta e design estratégico. A agência líder em Luanda para empresas que buscam o próximo nível.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => onNavigate(View.Contact)}
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 transition-all hover:-translate-y-1"
                >
                  Solicitar Orçamento
                </button>
                <button 
                  onClick={() => onNavigate(View.Portfolio)}
                  className="bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary text-gray-700 dark:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <span>Ver Portfólio</span>
                  <span className="material-icons-round text-secondary">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-lg aspect-square">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary opacity-10 rounded-full blur-2xl"></div>
                <img 
                  alt="Tech Hero" 
                  className="relative rounded-3xl shadow-2xl z-10 w-full h-full object-cover border-4 border-white dark:border-gray-800 transform rotate-2 hover:rotate-0 transition-transform duration-500" 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                />
                
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 flex items-center gap-3">
                  <div className="bg-secondary/20 p-2 rounded-lg text-secondary">
                    <span className="material-icons-round">trending_up</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Performance</p>
                    <p className="font-bold text-gray-900 dark:text-white">Foco em ROI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-5xl font-display font-black text-white mb-2">{stat.value}</p>
                <p className="text-white/70 font-semibold uppercase tracking-wider text-xs md:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="py-24 bg-white dark:bg-surface-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Por que nos escolher?</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mt-4 mb-6">Excelência em Cada Detalhe</h2>
            <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'brush', title: 'Design de Elite', desc: 'Identidades visuais que comunicam autoridade e modernidade.' },
              { icon: 'code', title: 'Tech Avançada', desc: 'Websites e apps ultra-velozes, seguros e otimizados.' },
              { icon: 'ads_click', title: 'Marketing Direto', desc: 'Campanhas focadas em atrair os clientes certos para o seu negócio.' },
              { icon: 'support_agent', title: 'Suporte Local', desc: 'Estamos em Luanda para oferecer um atendimento próximo e ágil.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-background-light dark:bg-background-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 text-primary">
                  <span className="material-icons-round text-3xl">{item.icon}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners/Clients Section */}
      <section className="py-16 bg-gray-50 dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-10">Empresas que confiam em nós</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
             {/* Simulação de logos */}
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="font-display font-black text-2xl text-gray-400 dark:text-gray-600">CLIENTE {i}</div>
             ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-3xl md:text-5xl dark:text-white">O que dizem os nossos clientes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "João Silva", role: "CEO, Tech Angola", text: "A VitalEvo transformou nossa presença digital. O novo site triplicou nossos leads." },
              { name: "Maria Antónia", role: "Diretora de Marketing", text: "Profissionalismo impecável. O design da nossa marca agora é referência no setor." },
              { name: "Pedro Kiala", role: "Empreendedor", text: "Melhor agência em Luanda. Atendimento rápido e entrega de alta qualidade." }
            ].map((t, i) => (
              <div key={i} className="bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 relative">
                <span className="material-icons-round text-5xl text-primary/10 absolute top-4 right-4">format_quote</span>
                <div className="flex text-secondary mb-4">
                  {[1,2,3,4,5].map(s => <span key={s} className="material-icons-round text-sm">star</span>)}
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic mb-6">"{t.text}"</p>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-sm text-primary">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white dark:bg-surface-dark">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display font-black text-3xl text-center mb-12 dark:text-white">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {faq.q}
                  <span className={`material-icons-round transition-transform ${activeFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {activeFaq === i && (
                  <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed bg-white dark:bg-surface-dark">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="font-display font-black text-4xl md:text-6xl text-white mb-8">
            Vamos começar o seu projeto hoje?
          </h2>
          <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">
            Não importa o tamanho da sua empresa, temos a solução certa para acelerar o seu crescimento em Angola e no mundo.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => onNavigate(View.Contact)}
              className="bg-secondary hover:bg-emerald-400 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all hover:-translate-y-2"
            >
              Falar com Consultor
            </button>
            <button 
              onClick={() => onNavigate(View.Portfolio)}
              className="bg-white/10 border-2 border-white/30 hover:bg-white/20 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all hover:-translate-y-2"
            >
              Ver Cases
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
