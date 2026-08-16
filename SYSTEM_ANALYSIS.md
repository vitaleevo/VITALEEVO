# Análise do Sistema VitalEvo

Este documento serve como referência central para a arquitetura, estrutura e funcionalidades do sistema VitalEvo. Ele deve ser mantido atualizado a cada alteração significativa no sistema.

**Última Atualização:** 16 de Agosto de 2026

## 1. Visão Geral
O VitalEvo é uma plataforma web corporativa integrada com funcionalidades de E-commerce, Blog, Portfólio e Gestão Administrativa. O sistema é construído como uma aplicação moderna full-stack utilizando Next.js para o frontend e Convex para o backend.

## 2. Stack Tecnológico

### Core
- **Framework Frontend**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Backend / Database**: Convex (Real-time database & Backend-as-a-Service)
- **Runtime**: Node.js

### UI & UX
- **Estilização**: Tailwind CSS (v3)
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Componentes**: React 19
- **Carrossel**: Swiper

### Bibliotecas Chave
- **Editor de Texto Rico**: Tiptap
- **Emails**: Resend / Nodemailer
- **Geração de PDF**: jsPDF / jspdf-autotable
- **Planilhas**: xlsx
- **Notificações**: Sonner

## 3. Estrutura do Projeto

### Diretórios Principais
- **/convex**: Contém toda a lógica de backend, schema do banco de dados e funções da API (Queries, Mutations, Actions).
- **/src**: Código fonte do frontend.
  - **/src/app**: Rotas da aplicação (Next.js App Router).
  - **/src/features**: Componentes específicos de cada módulo de negócio (ex: loja, blog, portfólio).
  - **/src/shared**: Componentes reutilizáveis, hooks, utilitários e tipos globais.

### Módulos Funcionais (Features)

#### 3.1. Loja (E-commerce)
- **Catálogo**: Produtos, Categorias, Marcas.
- **Compra**: Carrinho de Compras, Checkout, Pedidos.
- **Usuário**: Lista de Desejos (Wishlist).

#### 3.2. Conteúdo
- **Blog**: Artigos com editor rico.
- **Portfólio**: Projetos e casos de sucesso.
- **Institucional**: Sobre, Contato, Serviços, Legal.

#### 3.3. Usuários e Autenticação
- **Auth**: Login, Cadastro, Recuperação de Senha.
- **Conta**: Perfil, Endereços, Histórico de Pedidos.

#### 3.4. Administrativo (`/admin`)
- Dashboard Geral.
- Gestão de Produtos, Pedidos e Clientes.
- Gestão de Conteúdo (Blog, Portfólio).
- Importação de Dados.

#### 3.5. Sistema & Infraestrutura
- **Newsletter**: Inscrição e gestão.
- **Notificações**: Sistema de alertas.
- **Tarefas Agendadas (Crons)**: Manutenção e rotinas automáticas com Convex Crons.

## 4. Banco de Dados (Schema Convex)
O banco de dados é relacional e definido em `convex/schema.ts`. As principais tabelas incluem:
- `users`: Usuários do sistema.
- `products`: Catálogo de produtos.
- `categories`: Categorias de produtos/blog.
- `orders` / `orderItems`: Pedidos de venda.
- `articles`: Postagens do blog.
- `projects`: Itens do portfólio.
- `cartItems`: Itens no carrinho (persistência server-side).

## 5. Regras de Desenvolvimento
- **Atualização deste Documento**: Toda alteração arquitetural ou criação de novos módulos deve ser refletida neste arquivo.
- **Estilo**: Uso estrito de Tailwind CSS e componentes modulares.
- **Backend First**: A lógica de negócios deve residir preferencialmente nas funções do Convex.

---
*Este arquivo é gerado e mantido pelo Agente de IA como fonte de verdade sobre o sistema.*


## Atualização de Produção — 2026-08-15

- Autenticação: redefinição de senha processada no backend Convex, política mínima de senha e limitação de pedidos.
- Conteúdo: sanitização centralizada de HTML para artigos, projetos e importação.
- Segredos: chaves de IA cifradas em repouso com AES-GCM; a tabela mantém campos de migração temporários para dados antigos.
- E-mail: actions exigem remetente configurado e escapam dados de utilizador antes do HTML.
- Frontend: rota dos produtos corrigida, acessibilidade de zoom e teclado reforçada e provas sociais não verificadas removidas.
- Operação: README, .env.local.example, PRODUCTION_CHECKLIST.md e PROJECT_MEMORY.md descrevem configuração e validação.

## Atualização — 2026-08-16

- Rotas de produto e portfólio migradas de IDs internos do Convex (`/store/[id]`, `/portfolio/[id]`) para slugs (`/store/[slug]`, `/portfolio/[slug]`), com fallback para IDs antigos; sitemap passou a usar slugs e deixou de listar `/login` e `/cadastro`.
- Contactos unificados: os JSON-LD de `layout.tsx` e `page.tsx` passaram a usar as constantes canónicas de `src/shared/utils/contact.ts` (antes existiam três telefones diferentes).
- Removido `src/proxy.ts` (middleware no-op); corrigido JSX partido em `Contact.tsx` e import de `Clock`.
- `public/logo.png` atualizado para o novo logo da identidade visual (`novo logo-01.png`).

## Redesign da Homepage — 2026-08-16

- Hero substituído: o slideshow (`HeroSlider.tsx`) foi removido em favor de `Hero.tsx` — mensagem principal fixa, partículas, gradiente em movimento e mockups flutuantes (framer-motion), com suporte a `prefers-reduced-motion`.
- Novo `AnimatedCounter.tsx` (contador animado com `useInView` + `animate`) usado nos contadores de prova social.
- Secção Serviços: contadores animados (+250 Projetos, +120 Clientes, +15 Províncias) e animação de hover nos cartões.
- Nova secção "Soluções Tecnológicas Recomendadas" (Impressoras, Computadores, CCTV, Biometria, Redes) antes da loja.
- CTA final: contadores animados (+150 Projetos, +80 Clientes, +5 Anos de Experiência).

## Homepage com foco comercial — 2026-08-16

Reestruturação da homepage em pirâmide comercial (mensagem única → prova → conversão):

1. **Hero**: "Transformamos Empresas com Tecnologia, Marketing e Automação" + checklist de 4 soluções (Websites, Marketing Digital, Sistemas Empresariais, Infraestrutura TI).
2. **Prova Social** (imediatamente após o Hero): +150 Projetos, +80 Clientes, +14 Províncias, 98% Satisfação.
3. **Empresas que confiam**: IPS Visão, Bajaj Angola, Traders Agrícola, Silvaparque, RCCG.
4. **Serviços** concretos por prioridade: Desenvolvimento Web, Marketing Digital, Sistemas & Automação, Infraestrutura TI (com sub-serviços).
5. **Casos de Sucesso** em destaque: 4 projetos com Problema/Solução/Resultado.
6. **Porque escolher a VitalEvo**: 5 diferenciais com ✓.
7. **CTA Final**: "Receba uma Proposta Gratuita" com CTA único.

Removidos da homepage: loja (produtos/equipamentos), "Soluções Tecnológicas Recomendadas", blog e FAQ — a loja permanece em `/store`. Os componentes `FeaturedProductsSlider`, `FeaturedArticlesSlider` e `FeaturedProjectsSlider` continuam disponíveis no código (`FeaturedProjectsSlider` ainda é usado na página de contacto).

## Logo do menu — 2026-08-16

- `public/logo-novo.png` recortado das margens transparentes (3200x3200 → 2668x542, ~84% de área morta removida) para o logo renderizar maior sem mudar a altura/largura do menu.
- `Logo.tsx`: caixa padrão `w-40 h-10` → `w-48 h-12 sm:w-56` (menu mantém `h-16`/`h-[76px]`); sidebar do admin continua com `w-40 h-10`.
- **2026-08-16 (2)**: `public/logo-novo.png` substituído por `Asset 3.png` (wordmark roxo horizontal 634x124, da pasta `01_Identidade_Visual\png 2\1x`) — usado no menu e footer via componente `Logo`; escolhido por ser visível em tema claro e escuro (o footer é `bg-white` em claro; os assets 4/7 brancos ficariam invisíveis). Assets 4/7 (brancos, idênticos entre si) e Asset 6 (símbolo verde) ficam disponíveis para contextos escuros se necessário.
- Contactos públicos: src/shared/utils/contact.ts é a fonte canónica de telefones, e-mail, WhatsApp, morada e ligação do Google Maps; os dados estruturados e fluxos de pedidos usam estes valores.
