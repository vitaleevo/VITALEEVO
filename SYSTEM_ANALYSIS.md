# Análise do Sistema VitalEvo

Este documento serve como referência central para a arquitetura, estrutura e funcionalidades do sistema VitalEvo. Ele deve ser mantido atualizado a cada alteração significativa no sistema.

**Última Atualização:** 07 de Janeiro de 2026

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
