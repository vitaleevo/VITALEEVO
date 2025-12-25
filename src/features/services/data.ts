export interface ServiceDetail {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    image: string; // Placeholder for now, would be the AI generated one
    features: string[];
    benefits: { title: string; desc: string; icon: string }[];
    process: { step: string; title: string; desc: string }[];
    ctaText: string;
}

export const servicesData: ServiceDetail[] = [
    {
        id: 'branding',
        slug: 'branding-design',
        title: 'Branding & Design Estratégico',
        subtitle: 'Identidades visuais que não são apenas vistas, mas sentidas.',
        description: 'Mais do que logotipos bonitos, criamos sistemas visuais completos que comunicam a essência da sua marca. Unimos psicologia das cores, tipografia e design thinking para construir autoridades de mercado.',
        image: 'https://images.unsplash.com/photo-1626785774573-4b799314346d?auto=format&fit=crop&q=80&w=1600',
        features: ['Identidade Visual Completa', 'Manual da Marca (Brandbook)', 'Design de Interfaces (UI/UX)', 'Materiais Promocionais'],
        benefits: [
            { title: 'Reconhecimento', desc: 'Sua marca será lembrada instantaneamente pelo seu público.', icon: 'visibility' },
            { title: 'Consistência', desc: 'Comunicação visual coerente em todos os pontos de contato.', icon: 'style' },
            { title: 'Valor Percebido', desc: 'Design premium permite cobrar mais pelos seus produtos.', icon: 'monetization_on' }
        ],
        process: [
            { step: '01', title: 'Imersão', desc: 'Mergulhamos no seu universo para entender seus valores e diferenciais.' },
            { step: '02', title: 'Conceituação', desc: 'Exploração criativa e desenvolvimento de caminhos visuais.' },
            { step: '03', title: 'Refinamento', desc: 'Polimento da direção escolhida até a perfeição.' },
            { step: '04', title: 'Entrega', desc: 'Arquivos finais em todos os formatos necessários.' }
        ],
        ctaText: 'Elevar minha marca'
    },
    {
        id: 'webdev',
        slug: 'web-development',
        title: 'Desenvolvimento Web de Alta Performance',
        subtitle: 'Sites e aplicações que carregam na velocidade do pensamento.',
        description: 'Desenvolvemos soluções web robustas, escaláveis e seguras. Do front-end interativo ao back-end complexo, utilizamos as tecnologias mais modernas (Next.js, React, Node) para garantir que seu negócio opere sem interrupções.',
        image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=1600',
        features: ['Sites Institucionais & Landing Pages', 'E-commerce & Marketplaces', 'Plataformas SaaS', 'Webapps Progressivos (PWA)'],
        benefits: [
            { title: 'Velocidade', desc: 'Otimização extrema para Core Web Vitals e SEO.', icon: 'speed' },
            { title: 'Segurança', desc: 'Proteção contra ataques e vazamento de dados.', icon: 'shield' },
            { title: 'Escalabilidade', desc: 'Sistemas que crescem junto com o seu negócio.', icon: 'trending_up' }
        ],
        process: [
            { step: '01', title: 'Arquitetura', desc: 'Definição da stack tecnológica e estrutura de dados.' },
            { step: '02', title: 'Desenvolvimento', desc: 'Codificação limpa e modular com versionamento.' },
            { step: '03', title: 'Testes', desc: 'QA rigoroso para garantir zero bugs em produção.' },
            { step: '04', title: 'Deploy', desc: 'Configuração de servidores e lançamento seguro.' }
        ],
        ctaText: 'Construir meu projeto'
    },
    {
        id: 'mobile',
        slug: 'mobile-apps',
        title: 'Desenvolvimento de Apps Mobile',
        subtitle: 'Seu negócio na palma da mão dos seus clientes.',
        description: 'Criamos aplicativos nativos e híbridos que oferecem experiências fluidas e engajadoras. Seja iOS ou Android, transformamos sua ideia em um produto mobile de sucesso.',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1600',
        features: ['Apps iOS & Android', 'React Native / Flutter', 'Integração com APIs', 'Publicação nas Lojas'],
        benefits: [
            { title: 'Engajamento', desc: 'Notificações push e acesso direto aumentam a retenção.', icon: 'touch_app' },
            { title: 'Performance', desc: 'Fluidez nativa para uma experiência de uso superior.', icon: 'bolt' },
            { title: 'Offline First', desc: 'Funcionalidades que operam mesmo sem internet.', icon: 'wifi_off' }
        ],
        process: [
            { step: '01', title: 'Prototipagem', desc: 'Wireframes e telas de alta fidelidade clicáveis.' },
            { step: '02', title: 'Codificação', desc: 'Desenvolvimento ágil com sprints quinzenais.' },
            { step: '03', title: 'Beta Testing', desc: 'Validação com usuários reais antes do lançamento.' },
            { step: '04', title: 'Publicação', desc: 'Gestão de todo o processo de aprovação na Apple e Google.' }
        ],
        ctaText: 'Criar meu App'
    },
    {
        id: 'marketing',
        slug: 'marketing-digital',
        title: 'Marketing Digital & Growth',
        subtitle: 'Nós não trazemos likes, trazemos vendas.',
        description: 'Estratégias de growth hacking baseadas em dados. Gestão de tráfego, SEO, conteúdo e automação para atrair leads qualificados e convertê-los em clientes fiéis.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1600',
        features: ['Gestão de Tráfego Pago', 'SEO Técnico & Conteúdo', 'Social Media Management', 'E-mail Marketing'],
        benefits: [
            { title: 'ROI Focado', desc: 'Cada kwanza investido deve retornar multiplicado.', icon: 'attach_money' },
            { title: 'Segmentação', desc: 'Atingimos exatamente o seu público ideal.', icon: 'target' },
            { title: 'Mensuração', desc: 'Relatórios detalhados de performance e conversão.', icon: 'analytics' }
        ],
        process: [
            { step: '01', title: 'Diagnóstico', desc: 'Análise da sua presença digital atual e concorrentes.' },
            { step: '02', title: 'Planejamento', desc: 'Definição de canais, verba e kpis principais.' },
            { step: '03', title: 'Execução', desc: 'Rodamos as campanhas com otimização diária.' },
            { step: '04', title: 'Análise', desc: 'Ajustes de rota baseados nos dados coletados.' }
        ],
        ctaText: 'Acelerar minhas vendas'
    },
    {
        id: 'consulting',
        slug: 'tech-consulting',
        title: 'Consultoria Tecnológica',
        subtitle: 'A inteligência técnica que faltava para suas decisões.',
        description: 'Orientação especializada para empresas que precisam modernizar seus processos. Ajudamos na escolha de ferramentas, arquitetura de sistemas e transformação digital segura.',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1600',
        features: ['Transformação Digital', 'Cloud Computing', 'Cibersegurança', 'Gestão de TI'],
        benefits: [
            { title: 'Redução de Custos', desc: 'Eliminação de processos e ferramentas ineficientes.', icon: 'savings' },
            { title: 'Agilidade', desc: 'Processos mais enxutos e automatizados.', icon: 'rocket_launch' },
            { title: 'Governança', desc: 'Melhores práticas e conformidade com padrões.', icon: 'gavel' }
        ],
        process: [
            { step: '01', title: 'Assessment', desc: 'Mapeamento completo do cenário atual.' },
            { step: '02', title: 'Roadmap', desc: 'Plano de ação faseado para implementação.' },
            { step: '03', title: 'Acompanhamento', desc: 'Supervisão técnica durante a execução.' },
            { step: '04', title: 'Review', desc: 'Avaliação dos resultados e próximos passos.' }
        ],
        ctaText: 'Agendar consultoria'
    },
    {
        id: 'data',
        slug: 'data-analytics',
        title: 'Data & Analytics',
        subtitle: 'Transforme dados brutos em ouro estratégico.',
        description: 'Implementação de cultura data-driven. Coleta, estruturação e visualização de dados para que você tome decisões baseadas em fatos, não em intuição.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1600',
        features: ['Dashboards BI', 'Google Analytics 4', 'Engenharia de Dados', 'Machine Learning'],
        benefits: [
            { title: 'Previsibilidade', desc: 'Antecipe tendências e movimentos do mercado.', icon: 'query_stats' },
            { title: 'Clareza', desc: 'Veja a saúde do seu negócio em uma tela única.', icon: 'screen_search_desktop' },
            { title: 'Assertividade', desc: 'Diminua drasticamente o risco nas tomadas de decisão.', icon: 'check_circle' }
        ],
        process: [
            { step: '01', title: 'Mapeamento', desc: 'Identificação das fontes de dados existentes.' },
            { step: '02', title: 'ETL', desc: 'Extração, Transformação e Carregamento dos dados.' },
            { step: '03', title: 'Visualização', desc: 'Criação dos dashboards interativos.' },
            { step: '04', title: 'Treinamento', desc: 'Capacitação da equipe para uso das ferramentas.' }
        ],
        ctaText: 'Começar com dados'
    },
    {
        id: 'infra-security',
        slug: 'infra-security',
        title: 'Infraestrutura e Segurança',
        subtitle: 'Proteção e conectividade robusta para o seu negócio.',
        description: 'Oferecemos soluções completas em infraestrutura de TI e segurança eletrônica. Desde o cabeamento estruturado até sistemas biométricos avançados, garantimos que sua operação esteja sempre conectada e protegida contra ameaças físicas e digitais.',
        image: 'https://images.unsplash.com/photo-1558494949-efdeb6bf80a1?auto=format&fit=crop&q=80&w=1600',
        features: ['Redes e Cabeamento Estruturado', 'Câmeras de Segurança (CFTV)', 'Sistemas Biométricos', 'Controlo de Acesso', 'Segurança de Redes'],
        benefits: [
            { title: 'Confiabilidade', desc: 'Redes estáveis e de alta performance.', icon: 'router' },
            { title: 'Segurança', desc: 'Monitoramento 24/7 do seu patrimônio.', icon: 'security' },
            { title: 'Controle', desc: 'Gestão total de quem entra e sai da sua empresa.', icon: 'how_to_reg' }
        ],
        process: [
            { step: '01', title: 'Vistoria', desc: 'Análise técnica do local e levantamento de necessidades.' },
            { step: '02', title: 'Projeto', desc: 'Desenho da infraestrutura e posicionamento de equipamentos.' },
            { step: '03', title: 'Instalação', desc: 'Implementação física com equipe certificada.' },
            { step: '04', title: 'Manutenção', desc: 'Suporte contínuo e preventivo.' }
        ],
        ctaText: 'Proteger meu negócio'
    }
];
