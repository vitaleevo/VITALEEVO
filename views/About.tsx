
import React from 'react';
import { View } from '../types';

interface AboutProps {
  onNavigate: (view: View) => void;
}

const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="pt-28 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-dots-pattern opacity-20"></div>
            <img 
              alt="About Us" 
              className="rounded-3xl shadow-2xl relative z-10 w-full object-cover h-[500px]" 
              src="https://picsum.photos/1000/1000?random=10" 
            />
            <div className="absolute -bottom-6 -right-6 bg-primary text-white p-8 rounded-2xl shadow-lg z-20 hidden md:block max-w-xs">
              <p className="font-display font-bold text-4xl mb-1">10+</p>
              <p className="text-sm font-medium opacity-90">Anos transformando negócios digitais.</p>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <span className="text-secondary font-bold uppercase tracking-widest text-sm mb-2 block">Sobre Nós</span>
            <h2 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white mb-6 leading-tight">
              Criatividade, Tecnologia e <span className="text-primary">Estratégia</span>.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              A <span className="text-primary font-bold">VitalEvo</span> nasceu da necessidade de unificar o processo criativo e tecnológico. Entendemos que um design bonito sem funcionalidade é apenas arte, e tecnologia sem usabilidade é desperdício.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed italic border-l-4 border-secondary pl-4">
              "Nossa missão é oferecer serviços de excelência que combinam criatividade, tecnologia e estratégia, sempre focados nas necessidades de cada cliente."
            </p>
            <ul className="space-y-4 mb-8">
              {['Foco total na experiência do usuário (UX)', 'Metodologias ágeis de desenvolvimento', 'Suporte contínuo e evolutivo'].map((li, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="material-icons-round text-secondary">check_circle</span>
                  <span className="text-gray-700 dark:text-gray-200">{li}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => onNavigate(View.Contact)}
              className="inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors"
            >
              Conheça nossa cultura
              <span className="material-icons-round ml-2">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Work Process */}
        <section className="py-20">
          <h2 className="font-display font-black text-3xl md:text-4xl text-center mb-16 text-gray-900 dark:text-white">Nosso Processo de Trabalho</h2>
          <div className="relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 z-0"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
              {[
                { icon: 'search', title: 'Imersão', desc: 'Entendemos profundamente seus objetivos e mercado.' },
                { icon: 'architecture', title: 'Estratégia', desc: 'Definimos o plano de ação e cronograma.' },
                { icon: 'code', title: 'Execução', desc: 'Designers e devs trabalham juntos para dar vida.' },
                { icon: 'rocket', title: 'Entrega', desc: 'Lançamento e monitoramento contínuo.' }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center group">
                  <div className="size-24 rounded-full bg-white dark:bg-surface-dark border-4 border-primary/20 group-hover:border-primary transition-colors flex items-center justify-center mb-6 relative shadow-lg">
                    <span className="material-icons-round text-4xl text-primary">{step.icon}</span>
                    <div className="absolute -top-2 -right-2 size-8 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-sm shadow-md">{idx + 1}</div>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
