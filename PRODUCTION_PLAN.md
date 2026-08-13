# Plano de Lançamento para Produção - VitalEvo

Este plano descreve as etapas necessárias para levar o site da VitalEvo do ambiente de desenvolvimento para um estado de produção completo, seguro e otimizado.

---

## 1. Preparação Técnica e Otimização

### 🚀 Performance e Assets
- [ ] **Otimização de Imagens:** 
  - Converter imagens pesadas (ex: `hero-card.png`) para formatos modernos como WebP ou AVIF.
  - Implementar "Blur-up" loading para uma experiência de carregamento mais fluida.
- [ ] **Code Splitting:** Verificar se todos os componentes pesados estão usando `dynamic imports` onde apropriado para reduzir o Bundle inicial.
- [ ] **Geração Estática (SSG/ISR):** Configurar `generateStaticParams` para páginas de serviços e blog para carregamento instantâneo.

### 🔐 Variáveis de Ambiente e Segurança
- [ ] **Chaves de Produção:**
  - Configurar chaves de Produção do **Clerk** (Auth).
  - Configurar chaves de Produção do **Convex** (Backend).
  - Configurar credenciais de e-mail (Resend/SendGrid) para formulários de contato.
- [ ] **Middleware:** Revisar `middleware.ts` para garantir que rotas sensíveis (dashboard, conta) estejam devidamente protegidas.
- [ ] **CORS e Headers:** Configurar headers de segurança no `next.config.mjs` (Content Security Policy, Strict-Transport-Security).

---

## 2. SEO e Visibilidade

### 🔍 Otimização para Motores de Busca
- [ ] **Metadados Completos:** 
  - Implementar `OpenGraph` e `Twitter Cards` no `layout.tsx`.
  - Adicionar `canonical URLs` dinamicamente em cada página.
- [ ] **Sitemap e Robots:**
  - Gerar `sitemap.xml` dinamicamente via Next.js.
  - Configurar `robots.txt` para permitir indexação correta.
- [ ] **JSON-LD (Structured Data):** Adicionar dados estruturados para a organização e serviços para melhorar a aparência nos resultados do Google.

### 📊 Analytics e Monitoramento
- [ ] **Google Analytics 4 / Tag Manager:** Instalar scripts de rastreamento de conversão.
- [ ] **Monitoramento de Erros:** Configurar Sentry ou ferramenta similar para capturar erros em tempo real no cliente.

---

## 3. Conformidade Legal e Checkout

### ⚖️ Jurídico
- [ ] **Páginas Legais:** Finalizar o conteúdo de:
  - Políticas de Privacidade.
  - Termos de Uso.
  - Política de Cookies.
- [ ] **Consentimento de Cookies:** Implementar banner de consentimento (LGPD/GDPR compliance).

### 🛒 Checkout e Loja (Se aplicável)
- [ ] **Fluxo de Pagamento:** Testar o fluxo completo do carrinho até o sucesso do pedido com dados reais de teste.
- [ ] **E-mails Transacionais:** Garantir que o usuário receba confirmação de contato ou pedido.

---

## 4. Garantia de Qualidade (QA)

### 🧪 Testes
- [ ] **Cross-browser Testing:** Verificar funcionamento no Chrome, Safari, Firefox e Edge.
- [ ] **Mobile-First Check:** Testar toda a jornada do usuário em dispositivos Android e iOS (iPhone SE até Pro Max).
- [ ] **Formulários:** Validar todos os campos e estados (sucesso/erro/carregando).

### ⚡ Auditoria Lighthouse
- [ ] Atingir pontuação > 90 em:
  - Performance.
  - Acessibilidade.
  - Best Practices.
  - SEO.

---

## 5. Deployment Final

### ☁️ Infraestrutura
- [ ] **Vercel Production Domain:** Conectar o domínio final (ex: `vital-evo.com` ou `tradersagricola.com`) e validar certificados SSL.
- [ ] **Deployment Final:** Realizar o `git push` para a branch `main` e monitorar o build de produção.
- [ ] **Health Check:** Verificar logs pós-lançamento para garantir que não haja erros de hidratação ou de API.

---

## Cronograma Sugerido
- **Dia 1:** Otimização de Assets e Variáveis de Produção.
- **Dia 2:** Implementação completa de SEO e Analytics.
- **Dia 3:** Finalização de textos legais e revisão de UX/Mobile.
- **Dia 4:** QA final e Deployment.
