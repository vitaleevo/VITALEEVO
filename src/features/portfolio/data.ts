import { Project } from '@/shared/types';

export const projects: (Project & { fullDescription: string; client: string; year: string; challenge: string; solution: string; results: string[] })[] = [
    {
        id: '1',
        title: 'EcoStream Rebrand',
        category: 'Branding',
        tags: ['Identity', 'Packaging', 'Eco-friendly'],
        image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800',
        client: 'EcoStream Solutions',
        year: '2023',
        fullDescription: 'Redesign completo da identidade visual da EcoStream, uma empresa focada em soluções sustentáveis de purificação de água.',
        challenge: 'A marca antiga não transmitia a inovação tecnológica e o compromisso ambiental da empresa. Precisava-se de uma identidade que unisse natureza e tecnologia.',
        solution: 'Desenvolvemos um sistema visual baseado em fluidez e pureza. A paleta de cores combina tons de azul profundo e verde água. A tipografia moderna reflete a precisão técnica.',
        results: ['Aumento de 40% no reconhecimento de marca', 'Embalagens 100% recicláveis implementadas', 'Prêmio de Design Sustentável 2023']
    },
    {
        id: '2',
        title: 'FinTrack Dashboard',
        category: 'Tech',
        tags: ['React', 'SaaS', 'Fintech'],
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
        client: 'FinTrack Lda',
        year: '2024',
        fullDescription: 'Desenvolvimento de uma plataforma SaaS para gestão financeira de pequenas e médias empresas em Angola.',
        challenge: 'Criar uma interface intuitiva para usuários sem background financeiro, mantendo a complexidade das funcionalidades contábeis.',
        solution: 'Utilizamos React e Next.js para uma experiência SPA rápida. Implementamos gráficos interativos com Recharts e uma UX focada em automação de tarefas repetitivas.',
        results: ['Mais de 500 empresas cadastradas no beta', 'Redução de 30% no tempo gasto com contabilidade pelos usuários', 'Investimento série A garantido']
    },
    {
        id: '3',
        title: 'City Fest 2024',
        category: 'Marketing',
        tags: ['Event', 'Social Media', 'Banners'],
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
        client: 'Luanda Eventos',
        year: '2024',
        fullDescription: 'Campanha 360º para o maior festival de música de Luanda, cobrindo desde a identidade do evento até a cobertura em tempo real.',
        challenge: 'Esgotar os ingressos em tempo recorde e criar um hype nunca antes visto para o festival.',
        solution: 'Estratégia agressiva de mídia paga combinada com influenciadores digitais. Identidade visual vibrante e energética que dominou os outdoors da cidade.',
        results: ['Sold out em 2 semanas', 'Trending topic no Twitter/X por 3 dias', '+50k menções nas redes sociais']
    },
    {
        id: '4',
        title: 'Urban Architects',
        category: 'Design',
        tags: ['UX/UI', 'Webflow', 'Architecture'],
        image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=800',
        client: 'Urban Arch Studio',
        year: '2023',
        fullDescription: 'Website portfólio imersivo para um renomado escritório de arquitetura, focado em minimalismo e grandes imagens.',
        challenge: 'Traduzir a filosofia minimalista e espacial do escritório para o ambiente digital sem sacrificar a usabilidade.',
        solution: 'Design clean com foco total nas imagens dos projetos. Animações sutis de scroll e transição de páginas que remetem ao movimento através de espaços arquitetônicos.',
        results: ['Aumento de 200% em leads qualificados', 'Destaque em galerias de web design (Awwwards Nomination)', 'Tempo de permanência no site triplicado']
    },
    {
        id: '5',
        title: 'GreenLeaf App',
        category: 'Tech',
        tags: ['Mobile', 'Flutter', 'Health'],
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
        client: 'GreenLeaf Saúde',
        year: '2023',
        fullDescription: 'Aplicativo móvel para delivery de comida saudável e planos de dieta personalizados.',
        challenge: 'Concorrer com grandes apps de delivery focando em um nicho específico com alta exigência de qualidade.',
        solution: 'App desenvolvido em Flutter para iOS e Android. Features exclusivas como contador de calorias integrado ao pedido e agendamento de refeições semanais.',
        results: ['10k downloads no primeiro mês', 'Alta taxa de retenção de usuários (40% de recompra)', 'Avaliação 4.8 nas lojas de apps']
    },
    {
        id: '6',
        title: 'TechCorp Strategy',
        category: 'Marketing',
        tags: ['B2B', 'Branding', 'Strategy'],
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
        client: 'TechCorp Angola',
        year: '2022',
        fullDescription: 'Reestruturação completa do posicionamento de mercado B2B da maior empresa de tecnologia corporativa do país.',
        challenge: 'A empresa era vista como obsoleta. O desafio era reposicioná-la como líder em inovação.',
        solution: 'Nova estratégia de comunicação focada em "Futuro Agora". Eventos corporativos, whitepapers e uma nova identidade verbal.',
        results: ['Reconquista de 5 grandes contas corporativas', 'Melhoria na percepção de marca em pesquisas de mercado', 'Aumento de 50% no valuation da marca']
    },
];
