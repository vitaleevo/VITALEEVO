import { mutation } from "./_generated/server";
import { v } from "convex/values";

const AUTHOR = "Equipe VitalEvo";
// Using a highly reliable generic business image as default
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800";

const BLOG_CATEGORIES = [
    { name: "Marketing", slug: "marketing", type: "blog", order: 10, isActive: true, description: "Estratégias e tendências de marketing." },
    { name: "Tecnologia", slug: "tecnologia", type: "blog", order: 11, isActive: true, description: "O mundo da tecnologia e inovação." },
    { name: "Vendas", slug: "vendas", type: "blog", order: 12, isActive: true, description: "Técnicas de vendas e negociação." },
    { name: "Social Media", slug: "social-media", type: "blog", order: 13, isActive: true, description: "Gestão e crescimento em redes sociais." },
];

function generateDetailedContent(title: string, category: string, specificContent: string, videoTopic: string): string {
    return `
    <article class="prose lg:prose-xl">
        <p class="lead"><strong>Resumo:</strong> Este guia completo explora a fundo <em>${title}</em>, trazendo uma visão prática e educativa para profissionais em Angola, Brasil e Portugal. Aprenda como aplicar estes conceitos hoje mesmo no seu negócio.</p>

        <h2>1. Introdução ao Tema</h2>
        <p>No dinâmico mercado de <strong>${category}</strong>, manter-se atualizado não é apenas uma vantagem competitiva, é uma questão de sobrevivência. O tema "<strong>${title}</strong>" tem dominado as conversas em luandas de negócios, conferências em Lisboa e startups em São Paulo.</p>
        <p>Mas por que isso importa agora? Vivemos uma era de saturação de informação. Filtraremos o ruído e focaremos no sinal: o que realmente funciona, por que funciona e como você, leitor, pode tirar proveito disso.</p>

        <h2>2. O Cenário em Angola e na Lusofonia</h2>
        <p>É crucial adaptar estratégias globais para nossa realidade local. Em Angola, por exemplo, desafios como a instabilidade da internet e a predominância do mobile-first moldam como aplicamos <em>${title}</em>.</p>
        <p>Enquanto no Brasil o e-commerce é maduro, em Angola o "Social Commerce" (vendas via WhatsApp e Instagram com pagamento por referência Multicaixa ou MCX Express) é rei. Este artigo leva em conta essas nuances culturais e infraestruturais, garantindo que o conhecimento aqui passado seja aplicável tanto em Luanda quanto no Rio de Janeiro.</p>
        
        <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 my-8">
            <h4 class="text-blue-700 font-bold mb-2">💡 Dica Global, Aplicação Local</h4>
            <p class="text-blue-600 m-0">Sempre considere a velocidade de carregamento do seu site e o consumo de dados móveis do seu cliente. Soluções leves e diretas vencem em mercados emergentes.</p>
        </div>

        <h2>3. Aprofundamento Técnico: Como Funciona?</h2>
        ${specificContent}
        <p>Para entender a magnitude disso, precisamos olhar para os dados. Empresas que adotaram essa metodologia viram um aumento médio de 30% em eficiência operacional no primeiro ano.</p>

        <h2>4. Tutorial: Passo a Passo Prático</h2>
        <p>Quer implementar isso hoje? Siga este roteiro simples:</p>
        <ol>
            <li><strong>Diagnóstico Inicial:</strong> Avalie sua situação atual. Você tem os recursos necessários? Sua equipe está pronta?</li>
            <li><strong>Planejamento Estratégico:</strong> Defina KPIs claros. Não diga "quero vender mais", diga "quero aumentar as vendas em 10% em 6 meses usando esta técnica".</li>
            <li><strong>Execução Piloto:</strong> Comece pequeno. Teste em um segmento de clientes ou em um departamento específico.</li>
            <li><strong>Mensuração e Ajuste:</strong> Use dados reais para corrigir o curso. O mercado angolano muda rápido; sua estratégia também deve mudar.</li>
        </ol>

        <h2>5. Material de Apoio e Aprendizado Visual</h2>
        <p>Para quem aprende melhor visualmente, selecionamos referências sobre o tema. Embora não possamos incorporar vídeos com direitos autorais diretamente, recomendamos fortemente buscar no YouTube por palestras de autoridades no assunto "${videoTopic}".</p>
        
        <p><strong>Canais Recomendados para Estudo:</strong></p>
        <ul>
            <li>TED Talks (Busque por Inovação e ${category})</li>
            <li>Canais de Educação Corporativa como Endeavor e Sebrae</li>
            <li>Tutoriais técnicos específicos sobre as ferramentas mencionadas</li>
        </ul>

        <h2>6. Recursos Adicionais e Referências</h2>
        <p>Para se aprofundar, sugerimos a leitura dos seguintes tópicos relacionados:</p>
        <ul>
            <li><a href="#" class="text-primary hover:underline">Guia de Transformação Digital para PMEs</a></li>
            <li><a href="#" class="text-primary hover:underline">Relatórios de Tendências de Mercado 2026</a></li>
            <li><a href="#" class="text-primary hover:underline">Casos de Sucesso em Mercados Emergentes</a></li>
        </ul>

        <h2>7. Conclusão</h2>
        <p>Dominar "<strong>${title}</strong>" é uma jornada, não um destino. Esperamos que este artigo tenha iluminado o caminho e fornecido ferramentas práticas para seu crescimento profissional.</p>
        <p>Seja você um empreendedor em Talatona, um gestor em Luanda Sul ou um estudante buscando qualificação, o conhecimento é a única moeda que nunca desvaloriza. Aplique o que aprendeu, teste, erre rápido e aprenda ainda mais rápido.</p>
        
        <hr class="my-8"/>
        <p class="text-sm text-gray-500 italic">Este conteúdo é original da VitalEvo, focado em educar e capacitar o mercado lusófono. Compartilhe o conhecimento!</p>
    </article>
    `;
}

const BLOG_POSTS = [
    // --- MARKETING ---
    {
        title: "O Futuro do Marketing Digital em 2026",
        slug: "futuro-marketing-digital-2026",
        category: "marketing",
        videoTopic: "Future of Digital Marketing AI 2026",
        excerpt: "Um guia profundo sobre como a IA e a personalização vão ditar as regras do jogo. Prepare sua empresa agora.",
        specificContent: `
        <h3>A Era da Inteligência Preditiva</h3>
        <p>Não estamos mais falando apenas de reagir ao cliente, mas de antecipar suas necessidades. Ferramentas de IA agora analisam petabytes de dados comportamentais para prever o que o consumidor angolano vai querer comprar antes mesmo de ele saber.</p>
        <p>Imagine um sistema que identifica que um cliente comprou fraldas há 3 semanas e automaticamente envia uma oferta de reposição no dia exato em que o estoque dele deve estar acabando. Isso é marketing preditivo.</p>
        <h3>Privacidade First no Pós-LGPD/LPD</h3>
        <p>Com as leis de proteção de dados cada vez mais rigorosas em Angola e no mundo, o marketing deve ser transparente. Construir sua própria base de dados (First-Party Data) é o ativo mais valioso que você pode ter. Depender de dados de terceiros é construir casa em terreno alugado.</p>
        `,
        image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&q=80&w=800", // Marketing strategy
        readTime: "12 min",
    },
    {
        title: "Personalização em Massa: O Novo Padrão",
        slug: "personalizacao-em-massa",
        category: "marketing",
        videoTopic: "Mass Personalization Strategy",
        excerpt: "Como falar com 1 milhão de pessoas como se fosse uma conversa 1 a 1. Estratégias e ferramentas.",
        specificContent: `
        <h3>Do Genérico para o Único</h3>
        <p>Ninguém mais presta atenção em e-mails que começam com "Prezado Cliente". A personalização em massa usa automação para inserir nome, empresa, e referências a compras anteriores em cada comunicação.</p>
        <p>Em um contexto local, isso significa identificar que o cliente está em Benguela e não oferecer frete grátis apenas para Luanda, ou saber que ele prefere pagar por transferência e já enviar o IBAN no corpo do e-mail. Pequenos detalhes, grande conversão.</p>
        <h3>Ferramentas de CDP (Customer Data Platform)</h3>
        <p>Para fazer isso, você precisa de um CDP. É o cérebro da operação, unificando dados do site, do app, do caixa da loja física e do suporte. Sem dados unificados, a personalização é impossível.</p>
        `,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800", // Data graphs
        readTime: "10 min",
    },
    {
        title: "Marketing de Conteúdo vs. Tráfego Pago",
        slug: "conteudo-vs-trafego-pago",
        category: "marketing",
        videoTopic: "Content Marketing vs Paid Ads ROI",
        excerpt: "A batalha final: onde investir seu Kwanza? Analisamos o ROI de longo vs curto prazo.",
        specificContent: `
        <h3>O Jogo do Longo Prazo: Conteúdo</h3>
        <p>Marketing de conteúdo é como comprar um imóvel: você paga a entrada (tempo de produção), mas ele valoriza com o tempo. Um bom artigo escrito hoje pode trazer clientes de graça daqui a 5 anos. Em Angola, onde o custo por clique ainda varia muito, ter tráfego orgânico é uma segurança.</p>
        <h3>A Velocidade do Tráfego Pago</h3>
        <p>Anúncios são como aluguel: pagou, morou. Parou de pagar, foi despejado. Para lançamentos de produtos ou promoções rápidas (Black Friday), o tráfego pago é imbatível. A estratégia ideal? Use o lucro do tráfego pago para financiar a construção da sua máquina de conteúdo orgânico.</p>
        `,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800", // Analytics visualization
        readTime: "15 min",
    },
    {
        title: "Branding na Era Digital",
        slug: "branding-era-digital",
        category: "marketing",
        videoTopic: "Digital Branding Strategy",
        excerpt: "Sua marca não é seu logotipo. É o que dizem de você quando você não está na sala.",
        specificContent: `
        <h3>Consistência Omnichannel</h3>
        <p>Se sua marca é divertida no Instagram, ela não pode ser burocrática e fria no atendimento telefônico. Branding é a soma de todas as experiências. Para empresas angolanas buscando internacionalização, ter uma identidade visual e verbal coerente é o primeiro passo para passar credibilidade lá fora.</p>
        <h3>Propósito como Diferencial</h3>
        <p>Consumidores modernos, especialmente a Gen Z, compram "porquês", não apenas "o quês". Sua marca apoia o desenvolvimento local? Tem práticas sustentáveis? Comunicar isso não é caridade, é estratégia de negócios inteligente.</p>
        `,
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800", // Team Discussion
        readTime: "11 min",
    },
    {
        title: "SEO para Busca por Voz",
        slug: "seo-busca-por-voz",
        category: "marketing",
        videoTopic: "Voice Search SEO Optimization",
        excerpt: "Ok Google, como vender mais? A revolução da busca sem tela e como adaptar seu site.",
        specificContent: `
        <h3>A Mudança na Semântica</h3>
        <p>Quando digitamos, somos robóticos: "restaurante luanda". Quando falamos, somos humanos: "qual o melhor restaurante para jantar hoje em Luanda?". Seu conteúdo precisa responder a perguntas completas, não apenas focar em palavras-chave soltas.</p>
        <h3>A Importância do SEO Local</h3>
        <p>Buscas por voz são predominantemente locais ("perto de mim"). Garanta que seu Google Meu Negócio esteja impecável, com endereço, horário e telefone atualizados. Em Angola, onde endereços podem ser confusos, referências visuais na descrição ajudam muito.</p>
        `,
        image: "https://images.unsplash.com/photo-1589254065878-42c9da9e2059?auto=format&fit=crop&q=80&w=800", // Voice/Microphone abstract
        readTime: "9 min",
    },

    // --- TECNOLOGIA ---
    {
        title: "IA Generativa nas Empresas",
        slug: "ia-generativa-empresas",
        category: "tecnologia",
        videoTopic: "Generative AI Business Use Cases",
        excerpt: "GPT, Claude, Gemini... Como essas siglas estão economizando milhões em custos operacionais.",
        specificContent: `
        <h3>Além do Chatbot Básico</h3>
        <p>Esqueça aqueles chatbots antigos que só respondiam "não entendi". A IA generativa permite criar assistentes virtuais que entendem contexto, sarcasmo e intenção. Para bancos e seguradoras em Angola, isso significa atendimento 24/7 de qualidade sem triplicar o call center.</p>
        <h3>Geração de Código e Conteúdo</h3>
        <p>Programadores estão usando IA para escrever a estrutura básica ("boilerplate") de códigos, focando na lógica complexa. Times de marketing criam rascunhos de 50 posts em minutos. O segredo não é substituir o humano, mas dar superpoderes a ele. Quem souber "promtar" (dar os comandos certos) será o profissional mais valorizado da década.</p>
        `,
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800", // AI Abstract
        readTime: "14 min",
    },
    {
        title: "Cibersegurança em 2026",
        slug: "ciberseguranca-2026",
        category: "tecnologia",
        videoTopic: "Cybersecurity Trends 2026",
        excerpt: "Ransomware, Phishing e Engenharia Social. Como blindar sua empresa contra ataques modernos.",
        specificContent: `
        <h3>O Fator Humano é o Elo Mais Fraco</h3>
        <p>Você pode ter o firewall mais caro do mundo, mas se um funcionário clicar num link de "fatura em atraso" falso, o hacker entra. Treinamento de conscientização é mais vital que software. Em Angola, temos visto um aumento de golpes via WhatsApp e engenharia social; educar a equipe é a primeira linha de defesa.</p>
        <h3>Arquitetura Zero Trust</h3>
        <p>O conceito antigo de "castelo e fosso" (tudo dentro da rede é seguro) morreu. O novo padrão é "Zero Trust": nunca confie, sempre verifique. Cada acesso, mesmo de dentro do escritório, deve ser autenticado e autorizado. Identidade é o novo perímetro.</p>
        `,
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800", // Lock/Security
        readTime: "13 min",
    },
    {
        title: "Blockchain para Supply Chain",
        slug: "blockchain-supply-chain",
        category: "tecnologia",
        videoTopic: "Blockchain Supply Chain Logistics",
        excerpt: "Rastreabilidade total do produtor ao consumidor final. Transparência que gera valor.",
        specificContent: `
        <h3>A Verdade Imutável</h3>
        <p>Imagine escanear um QR code num pacote de café e ver a data exata da colheita, o nome do agricultor no Uíge, e cada parada do caminhão até o supermercado em Luanda. Blockchain permite isso. É um registro público e imutável que combate falsificação e garante qualidade.</p>
        <h3>Smart Contracts na Logística</h3>
        <p>Pagamentos automáticos liberados assim que a carga chega ao porto? Sim. Contratos inteligentes eliminam a burocracia de papelada, despachantes e cartórios, acelerando o comércio internacional e reduzindo custos de "custo-Angola".</p>
        `,
        image: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?auto=format&fit=crop&q=80&w=800", // Container/Logistics
        readTime: "11 min",
    },

    // --- VENDAS ---
    {
        title: "Spin Selling em 2026",
        slug: "spin-selling-2026",
        category: "vendas",
        videoTopic: "Spin Selling Methodology Explained",
        excerpt: "A técnica clássica revisitada. Por que fazer as perguntas certas vende mais do que ter as melhores respostas.",
        specificContent: `
        <h3>Situação, Problema, Implicação, Necessidade</h3>
        <p>Muitos vendedores pulam direto para a solução ("olha meu produto!"). O SPIN ensina a investigar a dor.
        <ul>
            <li><strong>Situação:</strong> Como vocês fazem o processo hoje?</li>
            <li><strong>Problema:</strong> E isso gera atrasos?</li>
            <li><strong>Implicação (O Pulo do Gato):</strong> Quanto dinheiro vocês perdem por ano com esses atrasos? É aqui que o cliente sente a dor.</li>
            <li><strong>Necessidade:</strong> Se existisse uma forma de zerar isso, seria interessante?</li>
        </ul>
        Quando o cliente diz "sim" para a necessidade, a venda está 80% feita.</p>
        `,
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800", // Meetings/Handshake
        readTime: "12 min",
    },
    {
        title: "Social Selling no LinkedIn",
        slug: "social-selling-linkedin",
        category: "vendas",
        videoTopic: "LinkedIn Social Selling Tips",
        excerpt: "Pare de panfletar na DM. Como construir autoridade e atrair clientes corporativos sem ser chato.",
        specificContent: `
        <h3>Seja Interessante antes de ser Interesseiro</h3>
        <p>Social Selling é sobre nutrir relacionamentos. Comente nos posts dos seus prospects com insights valiosos (não apenas "parabéns"). Publique conteúdo que ajude seu cliente ideal a resolver problemas pequenos. Quando você entrar em contato, não será um estranho, será aquele especialista que sempre posta coisas boas.</p>
        <h3>O Perfil Campeão</h3>
        <p>Seu perfil não é um currículo para o RH, é uma landing page para seu cliente. Sua foto passa profissionalismo? Seu título diz como você ajuda as pessoas ("Ajudo empresas a economizar luz") ou apenas seu cargo ("Vendedor na Empresa X")? Otimize seu perfil para conversão.</p>
        `,
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800", // Professional suit
        readTime: "10 min",
    },
    {
        title: "CRM: Muito Além do Cadastro",
        slug: "crm-alem-cadastro",
        category: "vendas",
        videoTopic: "CRM Strategy for Sales Growth",
        excerpt: "Se não está no CRM, não aconteceu. Transformando sua equipe comercial em uma máquina de dados.",
        specificContent: `
        <h3>A Memória da Empresa</h3>
        <p>Vendedores vão e vêm, os dados ficam. Um CRM bem alimentado permite que, se um vendedor sair, outro assuma a carteira no dia seguinte sabendo que o Cliente X gosta de café sem açúcar e que a renovação do contrato é em Maio. Isso é valor patrimonial da empresa.</p>
        <h3>Follow-up Automático</h3>
        <p>A maioria das vendas acontece após o 5º contato, mas a maioria dos vendedores desiste no 2º. O CRM automatiza lembretes: "Ligar para fulano hoje". Em vendas B2B complexas em Angola, onde decisões levam meses, a persistência organizada vence a pressa desorganizada.</p>
        `,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800", // Dashboard/Analytics
        readTime: "9 min",
    },

    // --- SOCIAL MEDIA ---
    {
        title: "TikTok para Negócios",
        slug: "tiktok-para-negocios",
        category: "social-media",
        videoTopic: "TikTok Business Marketing Strategy",
        excerpt: "Não é só dancinha. É a plataforma de descoberta de produtos mais poderosa do mundo hoje.",
        specificContent: `
        <h3>O Algoritmo de Interesse</h3>
        <p>Diferente do Instagram, onde você vê quem segue, o TikTok mostra o que você GOSSTA. Isso significa que uma conta com 0 seguidores pode ter um vídeo com 1 milhão de views se o conteúdo for bom. É a democratização do alcance viral.</p>
        <h3>Conteúdo "Lo-Fi" (Baixa Fidelidade)</h3>
        <p>Vídeos super produzidos parecem propaganda e são ignorados. Vídeos gravados com celular, autênticos e "crus" performam melhor. Mostre os bastidores da sua empresa, empacotando um pedido, ou ensinando uma dica rápida. Humanização conecta.</p>
        `,
        image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&q=80&w=800", // Social icons
        readTime: "10 min",
    },
    {
        title: "Gestão de Crise nas Redes",
        slug: "gestao-crise-redes-sociais",
        category: "social-media",
        videoTopic: "Social Media Crisis Management",
        excerpt: "O cancelamento vem rápido. Tenha um plano de contingência antes que o incêndio comece.",
        specificContent: `
        <h3>A Regra dos 15 Minutos</h3>
        <p>Na internet, o vácuo de informação é preenchido por boatos. Você deve reconhecer o problema rapidamente, mesmo que seja apenas para dizer "estamos cientes e investigando". O silêncio é interpretado como arrogância ou culpa.</p>
        <h3>Leve para o Privado, Resolva no Público</h3>
        <p>Tente tirar a discussão acalorada dos comentários e leve para a DM/Email. Mas, após resolver, volte ao comentário público e diga "Problema resolvido com o cliente". Isso mostra para a audiência silenciosa (que está só assistindo) que você é confiável e resolve problemas.</p>
        `,
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800", // News/Papers - This one works, keeping it
        readTime: "11 min",
    },
    {
        title: "Social Commerce",
        slug: "social-commerce-tendencia",
        category: "social-media",
        videoTopic: "Social Commerce Instagram Shop",
        excerpt: "Vender sem sair do app. Reduzindo a fricção e aumentando a conversão impulsiva.",
        specificContent: `
        <h3>A Loja na Palma da Mão</h3>
        <p>Social Commerce integra catálogo de produtos ao Instagram/Face/TikTok. O cliente vê a foto, clica na etiqueta de preço e compra. Quanto menos cliques, mais vendas. Em Angola, integrar isso com links diretos para pagamento via MCX Express ou envio de comprovante no WhatsApp agiliza o fechamento.</p>
        <h3>Live Shopping</h3>
        <p>O retorno do "Shoptime", mas interativo. Fazer uma live mostrando as peças de roupa no corpo, tirando dúvidas no chat e soltando promoções relâmpago é uma máquina de vendas. Gera urgência e prova social instantânea.</p>
        `,
        image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=800", // Shopping bags
        readTime: "8 min",
    }
];

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        const results = {
            categoriesCreated: 0,
            postsUpdated: 0,
            postsCreated: 0
        };

        // 1. Categories
        for (const cat of BLOG_CATEGORIES) {
            const existing = await ctx.db.query("categories")
                .withIndex("by_slug", (q) => q.eq("slug", cat.slug))
                .filter((q) => q.eq(q.field("type"), "blog"))
                .first();

            if (!existing) {
                await ctx.db.insert("categories", cat);
                results.categoriesCreated++;
            } else {
                await ctx.db.patch(existing._id, { ...cat });
            }
        }

        // 2. Posts - Enhanced Content & Fixed Images
        for (const post of BLOG_POSTS) {
            // Generate the full HTML body
            const richContent = generateDetailedContent(
                post.title,
                post.category,
                post.specificContent,
                post.videoTopic
            );

            // Clean up helper props
            const { specificContent, videoTopic, ...postData } = post as any;

            const existing = await ctx.db.query("articles")
                .withIndex("by_slug", (q) => q.eq("slug", post.slug))
                .first();

            const finalData = {
                ...postData,
                content: richContent,
                author: AUTHOR,
                authorRole: "Especialista VitalEvo",
                image: post.image || DEFAULT_IMAGE,
                updatedAt: Date.now(),
                isPublished: true,
                isFeatured: Math.random() < 0.25, // 25% featured
            };

            if (!existing) {
                await ctx.db.insert("articles", {
                    ...finalData,
                    createdAt: Date.now(),
                    publishedAt: Date.now(),
                });
                results.postsCreated++;
            } else {
                await ctx.db.patch(existing._id, {
                    ...finalData,
                    image: post.image || DEFAULT_IMAGE // Force update image
                });
                results.postsUpdated++;
            }
        }

        return `Sucesso! Imagens corrigidas e conteúdo sincronizado: ${results.postsUpdated} atualizados, ${results.postsCreated} criados.`;
    },
});
