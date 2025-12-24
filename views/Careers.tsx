
import React from 'react';
import { JobOpening } from '../types';

const Careers: React.FC = () => {
  const jobs: JobOpening[] = [
    { id: '1', title: 'Senior Product Designer', category: 'Design', type: 'Full-time', location: 'Remoto', isNew: true },
    { id: '2', title: 'Frontend Developer - React', category: 'Technology', type: 'Full-time', location: 'Híbrido' },
    { id: '3', title: 'Digital Marketing Specialist', category: 'Marketing', type: 'Full-time', location: 'Remoto' },
  ];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Careers Hero */}
        <section className="relative rounded-3xl overflow-hidden mb-20">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://picsum.photos/1200/600?random=20)' }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-black/40 to-transparent"></div>
          <div className="relative z-10 p-8 md:p-20 text-white max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-gray-900 bg-[#C6F91F] text-[10px] font-bold uppercase tracking-wider mb-6">
              Hiring Now
            </span>
            <h1 className="font-display font-black text-4xl md:text-6xl leading-tight mb-6">
              Modele o Futuro Digital com a VitalEvo
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Buscamos inovadores em Design, Tecnologia e Marketing para construir a próxima geração de experiências digitais.
            </p>
            <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-transform">
              Ver Vagas Abertas
            </button>
          </div>
        </section>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: 'public', title: 'Remote First', desc: 'Trabalhe de onde quiser com nossa política de flexibilidade total.' },
            { icon: 'favorite', title: 'Saúde & Bem-estar', desc: 'Planos completos e suporte a saúde mental para você e sua família.' },
            { icon: 'trending_up', title: 'Growth Budget', desc: 'Orçamento anual para cursos, conferências e certificações.' }
          ].map((item, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-center md:text-left">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto md:mx-0 mb-6">
                <span className="material-icons-round">{item.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Openings */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white">Vagas Atuais</h2>
          </div>
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="group p-6 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-primary hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between cursor-pointer">
                <div className="flex flex-col gap-1 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors dark:text-white">{job.title}</h3>
                    {job.isNew && <span className="bg-[#C6F91F] text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">New</span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><span className="material-icons-round text-sm">schedule</span> {job.type}</span>
                    <span className="flex items-center gap-1"><span className="material-icons-round text-sm">location_on</span> {job.location}</span>
                  </div>
                </div>
                <button className="mt-4 md:mt-0 text-primary font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  Candidatar-se <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
