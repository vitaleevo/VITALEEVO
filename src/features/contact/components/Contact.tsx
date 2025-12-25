"use client";

import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="pt-28 pb-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-10 lg:sticky lg:top-32">
            <div className="space-y-4">
              <h4 className="text-secondary font-bold tracking-wider uppercase text-sm">VitalEvo Angola</h4>
              <h1 className="font-display font-black text-4xl sm:text-6xl text-gray-900 dark:text-white leading-tight">
                Dê vida à sua <br />
                <span className="text-primary">Visão Digital.</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
                Estamos localizados no coração de Benfica. Venha tomar um café conosco ou envie-nos uma mensagem agora mesmo!
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-icons-round text-secondary">schedule</span>
                  Horário de Funcionamento
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span>Segunda a Sexta</span>
                    <span className="font-bold">08:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span>Sábado</span>
                    <span className="font-bold">08:00 - 12:00</span>
                  </div>
                  <div className="flex justify-between py-1 text-red-500">
                    <span>Domingo</span>
                    <span className="font-bold">Fechado</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { icon: 'location_on', title: 'Localização', line1: 'Bairro Benfica ao lado da dona xepa', line2: 'Luanda, Angola' },
                  { icon: 'email', title: 'E-mail', line1: 'info@vitaleevo.ao', line2: 'Resposta em 24h' },
                  { icon: 'phone', title: 'Contacto', line1: '+244 935 348 327', line2: '+244 959 822 513' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <span className="material-icons-round">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{item.line1}</p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">{item.line2}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-8">Solicitar Consultoria Gratuita</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seu Nome</label>
                  <input className="w-full h-14 px-5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all" placeholder="Ex: Lucas Silva" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seu WhatsApp</label>
                  <input className="w-full h-14 px-5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all" placeholder="+244 ..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Assunto do Projecto</label>
                <select className="w-full h-14 px-5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all">
                  <option>Criação de Website</option>
                  <option>Design & Branding</option>
                  <option>Marketing Digital (Tráfego)</option>
                  <option>Gestão de Redes Sociais</option>
                  <option>Consultoria de TI</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Descreva sua Necessidade</label>
                <textarea rows={4} className="w-full p-5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all resize-none" placeholder="Conte-nos um pouco sobre sua ideia..."></textarea>
              </div>
              <button className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-xl font-black text-xl shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                <span className="material-icons-round">send</span>
                Enviar Proposta
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
