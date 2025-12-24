
import React from 'react';

const Services: React.FC = () => {
  const categories = [
    {
      icon: 'brush',
      title: 'Branding e Design Gráfico',
      desc: 'Identidade visual forte para destacar sua marca no mercado.',
      items: ['Criação de Logotipos', 'Manual de Marca', 'Identidade Visual Completa', 'Design para Social Media']
    },
    {
      icon: 'code',
      title: 'Desenvolvimento Web e Software',
      desc: 'Soluções digitais robustas e escaláveis.',
      items: ['Sites Institucionais', 'Landing Pages de Alta Conversão', 'Aplicativos Mobile (iOS/Android)', 'Sistemas Web Personalizados']
    },
    {
      icon: 'rocket_launch',
      title: 'Marketing Digital',
      desc: 'Estratégias para aumentar sua visibilidade e vendas online.',
      items: ['Gestão de Tráfego Pago', 'SEO (Otimização de Busca)', 'Inbound Marketing', 'Gestão de Redes Sociais']
    },
    {
      icon: 'dns',
      title: 'Tecnologia e Infraestrutura',
      desc: 'Base sólida para manter sua empresa conectada e segura.',
      items: ['Servidores e Cloud', 'Cabeamento Estruturado', 'Segurança da Informação', 'Suporte Técnico Especializado']
    },
    {
      icon: 'smart_toy',
      title: 'Automação e IA',
      desc: 'Otimize processos e economize tempo com tecnologia inteligente.',
      items: ['Chatbots Inteligentes', 'Automação de Marketing (CRM)', 'Integração de Sistemas (API)', 'RPA (Automação de Processos)']
    },
    {
      icon: 'print',
      title: 'Gráfica e Impressão',
      desc: 'Materiais tangíveis que transmitem profissionalismo.',
      items: ['Cartões de Visita', 'Folders e Catálogos', 'Banners e Fachadas', 'Brindes Corporativos']
    }
  ];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-secondary font-bold tracking-widest uppercase text-sm">Nossas Áreas de Atuação</span>
          <h2 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white mt-2">Como podemos ajudar você?</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-primary to-secondary mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="group bg-surface-light dark:bg-surface-dark p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white text-primary transition-colors duration-300">
                <span className="material-icons-round text-3xl">{cat.icon}</span>
              </div>
              <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-4">{cat.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{cat.desc}</p>
              <ul className="space-y-2">
                {cat.items.map((item, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                    <span className="material-icons-round text-secondary text-lg mr-2">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
