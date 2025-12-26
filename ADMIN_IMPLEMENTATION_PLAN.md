# Plano de Implementação: Painel Administrativo (Admin Dashboard)

Este documento detalha o plano técnico para criar um sistema de **Gestão Administrativa** seguro e exclusivo para os proprietários do site VitalEvo.

## 1. Segurança e Controle de Acesso

O objetivo principal é garantir que **apenas** o proprietário tenha acesso. Como já utilizamos o **Clerk** para autenticação, usaremos uma abordagem baseada em e-mails autorizados (Whitelist).

### Estratégia de Proteção
1.  **Variável de Ambiente**: Definir o e-mail do administrador no arquivo `.env.local` (ex: `NEXT_PUBLIC_ADMIN_EMAIL=info@vitaleevo.ao`).
2.  **Verificação Frontend**: Criar um componente/hook que verifica se o usuário logado possui este e-mail. Caso contrário, redireciona para a Home.
3.  **Verificação Backend (Convex)**: (Opcional, mas recomendado para segurança máxima) As funções de escrita (mutações) administrativas verificam se o e-mail do chamador é o do admin.

## 2. Estrutura das Rotas

Criaremos uma nova área `/admin` completamente separada da área pública e da conta do usuário comum.

```bash
src/app/admin/
├── layout.tsx       # Layout com Sidebar exclusiva do Admin e proteção de rota
├── page.tsx         # Dashboard Principal (Visão Geral)
├── orders/          # Gestão de Pedidos da Loja
│   └── page.tsx
├── contacts/        # Mensagens recebidas pelo formulário
│   └── page.tsx
├── products/        # Adicionar/Editar Produtos (CRUD)
│   ├── page.tsx
│   └── [id]/page.tsx
├── blog/            # Escrever/Editar Artigos
│   └── page.tsx
└── users/           # (Futuro) Ver lista de clientes cadastrados
```

## 3. Funcionalidades Detalhadas

### A. Dashboard Principal (`/admin`)
- **Resumo Financeiro**: Total vendido, vendas do mês.
- **Contadores Rápidos**: Mensagens não lidas, pedidos pendentes.
- **Gráficos**: (Futuro) Vendas x Tempo.

### B. Gestão de Pedidos (`/admin/orders`)
- Listar todos os pedidos.
- Filtrar por status (Pendente, Pago, Enviado, Entregue).
- **Ação**: Alterar o status do pedido (ex: marcar como "Entregue").
- Ver detalhes de envio e itens comprados.

### C. Mensagens (`/admin/contacts`)
- Listar contatos recebidos pelo site.
- Visualizar detalhes (Nome, Email, Telefone, Mensagem).
- **Ação**: Marcar como "Lido".

### D. Gestão de Produtos (`/admin/products`)
- Listar produtos atuais.
- **Botão "Novo Produto"**: Formulário para cadastrar itens na loja.
- Editar preço, estoque, descrição e imagens.
- Ativar/Desativar produtos (sem deletar do banco).

### E. Blog & Conteúdo (`/admin/blog`)
- Editor de texto simples para postar novas notícias/artigos.
- Otimização de SEO básica nos posts.

## 4. Passo a Passo Técnico para Implementação

### Passo 1: Configuração de Segurança (Imediato)
1.  Adicionar `NEXT_PUBLIC_ADMIN_EMAIL` no `.env`.
2.  Criar função utilitária `isAdmin(user)`.
3.  Criar `src/app/admin/layout.tsx` com a lógica de proteção.

### Passo 2: Construção da Interface
1.  Criar Sidebar Administrativa (diferente da sidebar do usuário).
2.  Criar página inicial do Dashboard com estatísticas vindas do Convex.

### Passo 3: Conexão com Banco de Dados
1.  Criar queries no Convex específicas para o Admin (ex: `api.orders.getAdminOrders`, `api.contacts.getAllMessages`).
2.  Diferente das queries atuais, estas NÃO filtrarão pelo `userId`, permitindo ao admin ver TUDO.

### Passo 4: Testes
1.  Logar com email comum -> Acesso negado.
2.  Logar com email admin -> Acesso permitido.

---

**Deseja iniciar a implementação pelo Passo 1 agora mesmo?**
