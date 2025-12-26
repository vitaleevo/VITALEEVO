export interface Product {
    id: number;
    name: string;
    description: string;
    fullDescription?: string;
    price: number;
    oldPrice: number | null;
    rating: number;
    stars: number;
    image: string;
    images?: string[];
    isNew: boolean;
    category: string;
    brand: string;
    specs?: { label: string; value: string }[];
}

export const products: Product[] = [
    {
        id: 1,
        name: "Câmera IP Dome 1080p Wi-Fi",
        description: "Monitoramento em tempo real com visão noturna e áudio bidirecional.",
        fullDescription: "A Câmera IP Dome oferece segurança completa para sua casa ou negócio. Com resolução Full HD 1080p, visão noturna de até 30 metros e proteção contra intempéries (IP66), ela é ideal para ambientes internos e externos. Possui áudio bidirecional, detecção de movimento e acesso remoto via aplicativo.",
        price: 24900.00,
        oldPrice: 29900.00,
        rating: 42,
        stars: 4.5,
        category: "Câmeras de Segurança",
        brand: "Intelbras",
        image: "https://images.unsplash.com/photo-1557597774-9d2739fb88b9?auto=format&fit=crop&q=80&w=800",
        isNew: false,
        specs: [
            { label: 'Resolução', value: '1920x1080p (Full HD)' },
            { label: 'Conectividade', value: 'Wi-Fi 2.4GHz / Cabo RJ45' },
            { label: 'Armazenamento', value: 'Cartão MicroSD até 128GB' },
            { label: 'Visão Noturna', value: 'Sim, infravermelho 30m' },
            { label: 'Proteção', value: 'IP66 (Resistente à água e poeira)' }
        ]
    },
    {
        id: 2,
        name: "Roteador Gigabit Dual Band AX3000",
        description: "Velocidade ultrarrápida com tecnologia Wi-Fi 6 para múltiplos dispositivos.",
        fullDescription: "Experimente a nova geração de Wi-Fi com o Roteador AX3000. Projetado para casas inteligentes e escritórios com alta demanda de conexão, ele suporta dezenas de dispositivos simultaneamente sem perda de velocidade. Ideal para streaming 4K/8K, jogos online e videoconferências.",
        price: 58990.90,
        oldPrice: null,
        rating: 128,
        stars: 5,
        category: "Redes & Wi-Fi",
        brand: "TP-Link",
        image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800",
        isNew: true,
        specs: [
            { label: 'Padrão Wi-Fi', value: 'Wi-Fi 6 (802.11ax)' },
            { label: 'Velocidade', value: 'Até 3000 Mbps (2402 Mbps em 5 GHz)' },
            { label: 'Portas', value: '4x Gigabit LAN, 1x Gigabit WAN' },
            { label: 'Antenas', value: '4 antenas externas de alto ganho' },
            { label: 'Processador', value: 'Dual-Core CPU' }
        ]
    },
    {
        id: 3,
        name: "Switch 8 Portas Gigabit",
        description: "Expanda sua rede cabeada com facilidade e alta performance.",
        description_long: "Switch não gerenciável de 8 portas 10/100/1000 Mbps. Gabinete metálico robusto, ideal para expandir redes em escritórios e pequenas empresas.",
        price: 14990.90,
        oldPrice: null,
        rating: 15,
        stars: 4,
        category: "Redes & Wi-Fi",
        brand: "TP-Link",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
        isNew: false,
        specs: [
            { label: 'Portas', value: '8x 10/100/1000 Mbps' },
            { label: 'Capacidade de Comutação', value: '16 Gbps' },
            { label: 'Auto MDI/MDIX', value: 'Sim' },
            { label: 'Material', value: 'Metal' }
        ]
    },
    {
        id: 4,
        name: "Cabo de Rede CAT6 - 305m",
        description: "Bobina de cabo UTP CAT6 homologado para infraestrutura robusta.",
        fullDescription: "Cabo de rede UTP Categoria 6 (CAT6) com 4 pares trançados. Revestimento em PVC retardante a chamas.",
        price: 74900.00,
        oldPrice: 89000.00,
        rating: 89,
        stars: 5,
        category: "Cabos e Conectores",
        brand: "Ubiquiti",
        image: "https://images.unsplash.com/photo-1558494949-efdeb6bf80a1?auto=format&fit=crop&q=80&w=800",
        isNew: false,
        specs: [
            { label: 'Categoria', value: 'CAT6' },
            { label: 'Comprimento', value: '305 metros' },
            { label: 'Condutor', value: 'Cobre Puro' }
        ]
    },
    {
        id: 5,
        name: "Kit DVR 4 Canais + 4 Câmeras",
        description: "Solução completa para CFTV com gravação em nuvem opcional.",
        fullDescription: "Kit completo de segurança eletrônica contendo 1 DVR Stand Alone de 4 canais e 4 Câmeras Bullet HD 720p.",
        price: 129900.00,
        oldPrice: null,
        rating: 8,
        stars: 5,
        category: "Câmeras de Segurança",
        brand: "Hikvision",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800",
        isNew: false,
        specs: [
            { label: 'Câmeras', value: '4x Bullet HD 720p' },
            { label: 'DVR', value: '4 Canais Hibrido' }
        ]
    },
    {
        id: 6,
        name: "HD Externo Portátil 2TB USB 3.0",
        description: "Armazenamento seguro e backup rápido para seus arquivos importantes.",
        fullDescription: "Mantenha seus backups atualizados e seus arquivos seguros com este HD externo de 2TB.",
        price: 44990.90,
        oldPrice: 52000.00,
        rating: 56,
        stars: 4.5,
        category: "Hardware",
        brand: "Intelbras",
        image: "https://images.unsplash.com/photo-1531492746076-1a1bd9b29fc0?auto=format&fit=crop&q=80&w=800",
        isNew: false,
        specs: [
            { label: 'Capacidade', value: '2TB' },
            { label: 'Interface', value: 'USB 3.0' }
        ]
    }
];
