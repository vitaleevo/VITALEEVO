---
description: Plano completo para implementar a área do usuário normal
---

# 🎯 Plano: Conta do Usuário Normal - Implementação Completa

## Visão Geral
Criar uma experiência completa para o usuário normal que compra produtos, incluindo gestão de perfil, histórico de pedidos, endereços de entrega, favoritos e notificações.

---

## 📋 Fase 1: Perfil do Usuário (Básico)
**Status:** ✅ Parcialmente implementado

### 1.1 Informações Pessoais
- [x] Nome completo
- [x] E-mail (não editável)
- [x] Telefone
- [ ] **Avatar/Foto de perfil** (upload via Convex Storage)
- [ ] **NIF** (para faturas)
- [ ] **Data de nascimento**

### 1.2 Alteração de Senha
- [x] Senha atual + nova senha
- [ ] **Esqueci minha senha** (envio de e-mail com link de reset)

### 1.3 Ações
- [ ] **Excluir conta** (soft delete - desativar)
- [ ] **Baixar meus dados** (LGPD compliance)

---

## 📋 Fase 2: Endereços de Entrega
**Status:** 🔴 Não implementado

### 2.1 Schema Convex (nova tabela)
```typescript
addresses: defineTable({
    userId: v.id("users"),
    label: v.string(), // "Casa", "Trabalho", etc.
    name: v.string(), // Nome do destinatário
    phone: v.string(),
    city: v.string(),
    municipality: v.string(),
    neighborhood: v.string(),
    street: v.string(),
    reference: v.optional(v.string()),
    isDefault: v.boolean(),
    createdAt: v.number(),
}).index("by_user", ["userId"])
```

### 2.2 Funcionalidades
- [ ] Adicionar novo endereço
- [ ] Editar endereço existente
- [ ] Remover endereço
- [ ] Definir endereço padrão
- [ ] Selecionar endereço no checkout

### 2.3 UI
- [ ] Tab "Endereços" na página /conta
- [ ] Modal de adicionar/editar endereço
- [ ] Lista de endereços com cards
- [ ] Badge "Padrão" no endereço principal

---

## 📋 Fase 3: Histórico de Pedidos (Avançado)
**Status:** 🟡 Parcialmente implementado

### 3.1 Lista de Pedidos
- [x] Ver todos os pedidos
- [x] Status do pedido
- [ ] **Filtrar por status** (Pendente, Em andamento, Concluído)
- [ ] **Buscar por número do pedido**
- [ ] **Ordenar por data**

### 3.2 Detalhe do Pedido (Nova página: /conta/pedidos/[id])
- [ ] Número do pedido
- [ ] Data e hora do pedido
- [ ] Status com timeline visual
- [ ] Lista de itens comprados (imagem, nome, quantidade, preço)
- [ ] Subtotal, frete e total
- [ ] Endereço de entrega
- [ ] Método de pagamento
- [ ] **Botão "Repetir Pedido"** (adiciona itens ao carrinho)
- [ ] **Botão "Contactar Suporte"** (WhatsApp)

### 3.3 Comprovativo
- [ ] **Download de recibo em PDF** (gerado dinamicamente)

---

## 📋 Fase 4: Lista de Favoritos (Wishlist)
**Status:** 🔴 Não implementado

### 4.1 Schema Convex (nova tabela)
```typescript
favorites: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_user_product", ["userId", "productId"])
```

### 4.2 Funcionalidades
- [ ] Adicionar produto aos favoritos
- [ ] Remover produto dos favoritos
- [ ] Ver lista de favoritos na /conta
- [ ] Botão de coração nos cards de produto

### 4.3 UI
- [ ] Tab "Favoritos" na página /conta
- [ ] Grid de produtos favoritos
- [ ] Botão "Mover para Carrinho"
- [ ] Indicador de disponibilidade

---

## 📋 Fase 5: Notificações
**Status:** 🔴 Não implementado

### 5.1 Preferências de Notificação
- [ ] Receber e-mails de promoções
- [ ] Receber atualizações de pedidos
- [ ] Receber newsletter

### 5.2 Centro de Notificações (In-App)
- [ ] Lista de notificações recentes
- [ ] Marcar como lida
- [ ] Badge de notificações não lidas no ícone do usuário

---

## 📋 Fase 6: Checkout Integrado
**Status:** 🟡 Parcialmente implementado

### 6.1 Melhorias no Checkout
- [ ] **Pré-preencher dados do usuário logado**
- [ ] **Selecionar endereço salvo**
- [ ] **Salvar pedido no Convex** (atualmente só envia e-mail)
- [ ] **Associar pedido ao userId**

---

## 📋 Fase 7: Segurança & UX
**Status:** 🔴 Não implementado

### 7.1 Segurança
- [ ] **Rate limiting** no login (máximo 5 tentativas)
- [ ] **Sessão expira** após 7 dias de inatividade
- [ ] **Logout de todos os dispositivos**
- [ ] **Histórico de logins** (IP, data, dispositivo)

### 7.2 UX
- [ ] **Skeleton loading** em todas as tabs
- [ ] **Animações** ao trocar de tab (framer-motion)
- [ ] **Toast notifications** para ações (sucesso/erro)
- [ ] **Responsividade mobile** completa

---

## 🚀 Ordem de Implementação Recomendada

| Prioridade | Fase | Descrição | Esforço |
|------------|------|-----------|---------|
| 1 | 3.2 | Detalhe do pedido | Médio |
| 2 | 6 | Checkout integrado com Convex | Alto |
| 3 | 2 | Endereços de entrega | Médio |
| 4 | 1.1 | Upload de avatar | Baixo |
| 5 | 4 | Lista de favoritos | Médio |
| 6 | 3.3 | Download de recibo PDF | Médio |
| 7 | 5 | Notificações | Alto |
| 8 | 7 | Segurança avançada | Alto |

---

## 📁 Estrutura de Arquivos Final

```
src/app/conta/
├── page.tsx                    # Página principal da conta
├── pedidos/
│   └── [id]/
│       └── page.tsx           # Detalhe do pedido
├── enderecos/
│   └── page.tsx               # Gestão de endereços (opcional)
└── favoritos/
    └── page.tsx               # Lista de favoritos (opcional)

convex/
├── auth.ts                    # Autenticação (existente)
├── users.ts                   # Usuários (existente)
├── orders.ts                  # Pedidos (existente)
├── addresses.ts               # Endereços (novo)
└── favorites.ts               # Favoritos (novo)
```

---

## ✅ Próximos Passos Imediatos

1. **Fase 3.2** - Criar página de detalhe do pedido
2. **Fase 6** - Integrar checkout com Convex (salvar pedido real)
3. **Fase 2** - Implementar gestão de endereços

Deseja que eu comece a implementar alguma fase específica?
