import { Article } from '@/shared/types';

export const articles: (Article & { content: string; author: string; authorRole: string; authorImage: string; relatedArticles: string[] })[] = [
    {
        id: '1',
        title: 'Princípios de UX para SaaS B2B',
        category: 'Design',
        date: 'Out 24, 2023',
        readTime: '5 min',
        excerpt: 'O design para empresas requer uma mentalidade diferente. Aprenda a focar na eficiência e converter usuários complexos em promotores.',
        image: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d07?auto=format&fit=crop&q=80&w=600',
        content: `
      <p>Quando falamos de B2B (Business to Business), o design de experiência do usuário (UX) assume um papel crítico e muitas vezes diferente do B2C (Business to Consumer). No mundo corporativo, o software é uma ferramenta de trabalho, não apenas entretenimento.</p>
      
      <h3>1. Eficiência acima de tudo</h3>
      <p>Usuários B2B usam seu software todos os dias, muitas vezes por horas. Pequenos atritos se acumulam. Atalhos de teclado, densidade de informação correta e fluxos de trabalho otimizados são essenciais.</p>

      <h3>2. Gestão de Complexidade</h3>
      <p>Softwares B2B lidam com grandes volumes de dados. Tabelas avançadas, filtros poderosos e visualização de dados clara não são diferenciais, são requisitos básicos.</p>

      <h3>3. Consistência e Previsibilidade</h3>
      <p>Mudanças drásticas na interface podem custar milhões em retreinamento. A evolução deve ser iterativa e bem comunicada.</p>
      
      <p>Em resumo, UX para SaaS B2B é sobre empoderar o usuário a fazer seu trabalho melhor e mais rápido.</p>
    `,
        author: 'Ana Costa',
        authorRole: 'Senior Product Designer',
        authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        relatedArticles: ['4', '6']
    },
    {
        id: '2',
        title: 'Dominando CSS Grid em 2024',
        category: 'Tech',
        date: 'Out 18, 2023',
        readTime: '8 min',
        excerpt: 'Pare de brigar com floats e flexbox. Descubra o poder do grid moderno para criar layouts responsivos e robustos.',
        image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=600',
        content: `
      <p>O CSS Grid Layout mudou o jogo do desenvolvimento web. Permite criar layouts bidimensionais complexos com uma facilidade que o Flexbox (focado em uma dimensão) não consegue igualar.</p>
      
      <h3>Grid vs Flexbox</h3>
      <p>Use Flexbox para componentes e alinhamentos lineares. Use Grid para a estrutura macro da página ou componentes complexos.</p>
      
      <h3>Subgrid: O próximo nível</h3>
      <p>Com o subgrid, filhos de um grid podem herdar as linhas do pai, permitindo alinhamentos perfeitos mesmo em estruturas aninhadas.</p>
      
      <p>Dominar essas ferramentas é essencial para qualquer desenvolvedor frontend moderno.</p>
    `,
        author: 'Carlos Manuel',
        authorRole: 'Lead Frontend dev',
        authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
        relatedArticles: ['5']
    },
    {
        id: '3',
        title: 'SEO para Startups de Tecnologia',
        category: 'Marketing',
        date: 'Out 12, 2023',
        readTime: '6 min',
        excerpt: 'Visibilidade é tudo. Aprenda táticas de SEO que não exigem orçamentos milionários e trazem resultados orgânicos.',
        image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=600',
        content: `<p>Conteúdo em desenvolvimento...</p>`,
        author: 'Mariana Silva',
        authorRole: 'Marketing Specialist',
        authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        relatedArticles: ['6']
    },
    {
        id: '4',
        title: 'A Revolução da IA no Design',
        category: 'Inovação',
        date: 'Out 05, 2023',
        readTime: '4 min',
        excerpt: 'Como ferramentas generativas estão mudando o workflow dos designers e o que esperar do futuro.',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600',
        content: `<p>Conteúdo em desenvolvimento...</p>`,
        author: 'Ana Costa',
        authorRole: 'Senior Product Designer',
        authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        relatedArticles: ['1']
    },
    {
        id: '5',
        title: 'Next.js 14: O que há de novo?',
        category: 'Tech',
        date: 'Set 28, 2023',
        readTime: '10 min',
        excerpt: 'Server Actions, Partial Prerendering e muito mais. Um mergulho profundo nas novidades do framework.',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600',
        content: `<p>Conteúdo em desenvolvimento...</p>`,
        author: 'Carlos Manuel',
        authorRole: 'Lead Frontend dev',
        authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
        relatedArticles: ['2']
    },
    {
        id: '6',
        title: 'Estratégias de Branding Digital',
        category: 'Branding',
        date: 'Set 20, 2023',
        readTime: '7 min',
        excerpt: 'Sua marca é oque dizem sobre você quando você não está na sala. Como construir uma reputação sólida online.',
        image: 'https://images.unsplash.com/photo-1493612276216-9c5901955d43?auto=format&fit=crop&q=80&w=600',
        content: `<p>Conteúdo em desenvolvimento...</p>`,
        author: 'Mariana Silva',
        authorRole: 'Marketing Specialist',
        authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        relatedArticles: ['1']
    },
];
