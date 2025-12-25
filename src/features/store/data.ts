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
    specs?: { label: string; value: string }[];
}

export const products: Product[] = [
    {
        id: 1,
        name: "Câmera IP Dome 1080p Wi-Fi",
        description: "Monitoramento em tempo real com visão noturna e áudio bidirecional.",
        fullDescription: "A Câmera IP Dome oferece segurança completa para sua casa ou negócio. Com resolução Full HD 1080p, visão noturna de até 30 metros e proteção contra intempéries (IP66), ela é ideal para ambientes internos e externos. Possui áudio bidirecional, detecção de movimento e acesso remoto via aplicativo.",
        price: 249.00,
        oldPrice: 299.00,
        rating: 42,
        stars: 4.5,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuABcWMISndX6pv2fQQPg99VGi-i8_P3_wq9cU9-HM2TrDkA3mK4qGdT4gPW-tG_fmqqx-Hu1P2uqBvOAnAcMpoUedfR7P5BYDC9AMV4BHN90hA_PTEY34EWkkgUM8VEhxIUacyr3Cy2DAtlNKc80k1tf3CiaGMQEISii7UyY-fc3G1-oFeqBe1-jssVc3L0dSmUoMM25HFVp03xj5sQWZSWt8rjwBb9ogYrwEy3UrodbIkDskCYOp7QgxsyZ3hIySrw1Swahu6bEcC5",
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
        price: 589.90,
        oldPrice: null,
        rating: 128,
        stars: 5,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJ8h9AocixsCy8hMrbos9rtyw7wWpsXDIDwyoC8IK1XesvAVs_oQnushttRo8VC-0kqvKZxSjEGFHY6aSYhyYyG71NXu9j8VWHSOTh-75T0zHw0GAosgLFpyW8zg5wp_8VMAGolKXjyhdCrT6i8rfjfv_pVKaIUqckUxHr3KalWZjIG62WViXq1YCMvfwv7jl7rXURJJ_hA2kN9_EH2DZlwq2HUVvfXNxGq1ZR3b-8pe_8n3a1Ly_6SlnwB-NSs4tiDPPCZ5gDnkRP",
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
        fullDescription: "Switch não gerenciável de 8 portas 10/100/1000 Mbps. Gabinete metálico robusto, ideal para expandir redes em escritórios e pequenas empresas. Instalação Plug and Play, sem necessidade de configuração.",
        price: 149.90,
        oldPrice: null,
        rating: 15,
        stars: 4,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoCjLdO0xZnzz3RnsTM2FXlFFmrImwWFDFtWE9BDaUTutQyAKJ6qJ2fubxXxwoM8eVxCrK2Q-aqYw8b4jK_O-4xSUXknZX4YNIf6ljY1asBE_JnD71IFUh8rx9WBVRS2e6nXj9jELFA_4hBFynBoIk9po9mILwB59Rx6nrhxf11S-CSGMSzm3pN27ne2MlzIG5dosIFGp2O9HT9qV8GFxFaStKivyP3cA_h96bRAt0qXN09d5tw_o5Lyfo7062DDrxVnsWoDQWe054",
        isNew: false,
        specs: [
            { label: 'Portas', value: '8x 10/100/1000 Mbps' },
            { label: 'Capacidade de Comutação', value: '16 Gbps' },
            { label: 'Auto MDI/MDIX', value: 'Sim' },
            { label: 'Material', value: 'Metal' },
            { label: 'Energia', value: 'Bivolt Automático' }
        ]
    },
    {
        id: 4,
        name: "Cabo de Rede CAT6 - 305m",
        description: "Bobina de cabo UTP CAT6 homologado para infraestrutura robusta.",
        fullDescription: "Cabo de rede UTP Categoria 6 (CAT6) com 4 pares trançados. Revestimento em PVC retardante a chamas, ideal para instalações internas verticais e horizontais. Garante estabilidade e alta velocidade para sua infraestrutura de rede.",
        price: 749.00,
        oldPrice: 890.00,
        rating: 89,
        stars: 5,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD36i7Ax1h-MGJ--Z2ZoyOwbsPsdfDLmOi1EFFcEQ86qFRA9Nl2_ozr0Xg401BE79AzOqA81FRwpvfuYpTfMsSKG2LD9nbAUcBRLekgcQMMZkx8fuI57UN0gIa5vfDkUFqp7ogmp5tjMhaAO9j17YWHeQS0o-H_8N87zw9Mascx0cjPv19u5M2iWuHdJGePtHjUn1jmOETQRIHeTl_8kp2pqy_n6XuN6sS99fIwtkNBDZmr0HHfdck9GsP6ZhFnLgVMeFkIld9XNesK",
        isNew: false,
        specs: [
            { label: 'Categoria', value: 'CAT6' },
            { label: 'Comprimento', value: '305 metros' },
            { label: 'Condutor', value: 'Cobre Puro' },
            { label: 'Revestimento', value: 'PVC Anti-chama (CM)' },
            { label: 'Cor', value: 'Azul' }
        ]
    },
    {
        id: 5,
        name: "Kit DVR 4 Canais + 4 Câmeras",
        description: "Solução completa para CFTV com gravação em nuvem opcional.",
        fullDescription: "Kit completo de segurança eletrônica contendo 1 DVR Stand Alone de 4 canais e 4 Câmeras Bullet HD 720p. Acompanha cabos, conectores e fonte de alimentação. Visualize suas câmeras de qualquer lugar através do aplicativo no celular.",
        price: 1299.00,
        oldPrice: null,
        rating: 8,
        stars: 5,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxy2z0PmiH2vPB6C5mjeOnFRmIaNLgPcV24LTPI9pd1qcU4UblU3dnMjuL48xs3VIp3hUZhhDxcKVgPQW7apCUtjFrmma43i2GXbJ_nRufTGzLiIZ46u96Iu1pzqp5YKjDCvU7s4LTbUwNzr9y7nITjW04zMWIQM65agfNityKYPguLM16Wk4qsyqOh9ZWuJOhcSxnstvx6D_J3bYtlZmyWT6CXjVf84kcTgHWS17S4n85MHslyRIsC1WkE92cZYL1q5B3S6SsJlMM",
        isNew: false,
        specs: [
            { label: 'Câmeras', value: '4x Bullet HD 720p' },
            { label: 'DVR', value: '4 Canais Hibrido' },
            { label: 'Visão Noturna', value: '20 metros' },
            { label: 'Acesso Remoto', value: 'Sim, gratuito (P2P)' },
            { label: 'Armazenamento', value: 'Suporta HD SATA até 10TB (não incluso)' }
        ]
    },
    {
        id: 6,
        name: "HD Externo Portátil 2TB USB 3.0",
        description: "Armazenamento seguro e backup rápido para seus arquivos importantes.",
        fullDescription: "Mantenha seus backups atualizados e seus arquivos seguros com este HD externo de 2TB. Design compacto e portátil, compatível com USB 3.0 para transferências de dados ultra-rápidas. Funciona em Windows e Mac.",
        price: 449.90,
        oldPrice: 520.00,
        rating: 56,
        stars: 4.5,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqQ5VgkWUunjiHd1n9iL7P1qgK5VIH_xlKEcxx3urYmzfPGm_HsYAaYwSFLhi2yoKUKSOXAvQQGJLUyDqK-qqCUIR6wJvJrboauh0CJwHIwarqF9np3jIy2XDrvm0JEEWVDBtA-vLYYYdrn8l_hUstgjjOZKjifRJA3lDVYc6vZ73gWcBCcpzeDT-Tf1vVFIl0wV-qKkWW4O7irpWkEwq_OnR0GeFrjdCyd8lLRwrzcS13LNiG18LVOaaweNcYk1dkYVmIPWaDkmxK",
        isNew: false,
        specs: [
            { label: 'Capacidade', value: '2TB' },
            { label: 'Interface', value: 'USB 3.0 (Compatível com 2.0)' },
            { label: 'Tamanho', value: '2.5 polegadas' },
            { label: 'Compatibilidade', value: 'Windows, macOS, Linux' },
            { label: 'Garantia', value: '2 Anos' }
        ]
    }
];
