
import React, { useState } from 'react';
import { Project } from '../types';

const Portfolio: React.FC = () => {
  const [filter, setFilter] = useState('Todos');

  const projects: Project[] = [
    { id: '1', title: 'EcoStream Rebrand', category: 'Branding', tags: ['Identity', 'Packaging'], image: 'https://picsum.photos/800/600?random=1' },
    { id: '2', title: 'FinTrack Dashboard', category: 'Tech', tags: ['React', 'SaaS'], image: 'https://picsum.photos/800/600?random=2' },
    { id: '3', title: 'City Fest 2024', category: 'Marketing', tags: ['Wayfinding', 'Banners'], image: 'https://picsum.photos/800/600?random=3' },
    { id: '4', title: 'Urban Architects', category: 'Design', tags: ['UX/UI', 'Webflow'], image: 'https://picsum.photos/800/600?random=4' },
    { id: '5', title: 'GreenLeaf App', category: 'Tech', tags: ['Mobile', 'Flutter'], image: 'https://picsum.photos/800/600?random=5' },
    { id: '6', title: 'TechCorp Strategy', category: 'Marketing', tags: ['B2B', 'Branding'], image: 'https://picsum.photos/800/600?random=6' },
  ];

  const categories = ['Todos', 'Branding', 'Tech', 'Marketing', 'Design'];

  const filteredProjects = filter === 'Todos' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
           <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            Portfolio VitalEvo
          </span>
          <h2 className="font-display font-black text-4xl md:text-6xl text-gray-900 dark:text-white leading-tight">
            Transformando Ideias em <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Realidade Digital</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                filter === cat ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <div key={project.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-4">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-primary px-6 py-2 rounded-full font-bold">Ver Projeto</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                <p className="text-primary text-xs font-bold uppercase tracking-wider">{project.category}</p>
              </div>
              <h3 className="text-xl font-bold dark:text-white">{project.title}</h3>
              <p className="text-gray-500 text-sm">{project.tags.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
