# Memória do Projeto VitalEvo

## Estado Atual

O frontend Next.js continua publicado na Vercel em `https://vitaleevo.ao`; o backend Django/DRF está ligado no Railway a PostgreSQL e Redis. O hardening de código do Gate 0 e o PR 1 de segurança/autenticação foram implementados na branch `codex/production-hardening` e publicados no draft PR GitHub #1. A produção continua bloqueada até concluir as ações operacionais do Gate 0 e a homologação integrada descrita em `PRODUCTION_IMPLEMENTATION_PLAN.md`.

## Última etapa concluída: Gate 0 de código e PR 1 de segurança/autenticação — 2026-08-23

Objetivo: remover credenciais fixas, fechar a exposição pública de cotações, endurecer JWT/recuperação de password/uploads/proxies e preparar uma entrega verificável no GitHub sem publicar código inseguro em produção.

Foi feito:

- Removidas credenciais fixas de `ensure_admin` e `seed`; criação/rotação de administrador agora exige variáveis ou argumentos explícitos, preserva passwords existentes e revoga refresh tokens quando há rotação.
- Sanitizados os ficheiros de exemplo que continham uma chave legada de deployment e uma chave de e-mail; nenhuma ocorrência dos prefixos pesquisados permanece na árvore atual.
- Adicionado token de capacidade forte para consulta pública de cotações, armazenado apenas como hash; a resposta pública não contém nome, e-mail, telefone, empresa ou proposta.
- Removido o GET público baseado apenas em referência e criado POST público com token, resposta mínima, `Cache-Control: no-store` e throttling.
- Ativada blacklist JWT, access token de 15 minutos, refresh rotativo, logout com revogação e invalidação das sessões após troca/reset de password.
- Separados os limites de login, refresh, registo, logout e recuperação de password para evitar interferência entre fluxos legítimos.
- Recuperação de password usa `uid` codificado e token assinado, expira em 15 minutos e exige SMTP em produção.
- Uploads bloqueiam SVG, validam assinatura/extensão e limitam tamanho; proxies Next.js usam allowlist de headers, timeout e limites de request/response.
- Separados liveness e readiness; readiness verifica PostgreSQL e Redis.
- Corrigido o refresh concorrente no frontend, persistência de refresh rotativo, sincronização do `AuthProvider`, logout e armazenamento de token de cotação apenas na sessão.
- Atualizados Next.js/dependências de produção, removidas dependências vulneráveis não utilizadas e alinhado `eslint-config-next`.
- Corrigida a configuração do ESLint para ignorar ambientes/artefactos gerados sem ocultar erros do código-fonte.
- Corrigido o GitHub Actions: frontend executa lint/typecheck/build e backend executa `pip check`, checks Django, validação de migrações e os 91 testes.
- Removidas da Vercel as cópias desnecessárias de segredos/variáveis internas do Railway, PostgreSQL, Redis e Elasticsearch, além das variáveis legadas Convex sem uso; os valores do backend permanecem apenas no Railway.

Arquivos principais:

- `PRODUCTION_IMPLEMENTATION_PLAN.md`
- `backend/apps/users/management/commands/ensure_admin.py`
- `backend/apps/users/views.py`
- `backend/apps/quotes/services.py`
- `backend/apps/quotes/migrations/0002_public_access_token_hash.py`
- `backend/config/settings/base.py`
- `backend/config/settings/production.py`
- `src/shared/utils/apiClient.ts`
- `src/shared/providers/AuthProvider.tsx`

Verificação executada:

```bash
cd backend && ../.venv/bin/python -m pytest
npm run lint
npm run typecheck
npm run build:app
npm audit --omit=dev --ignore-scripts
cd backend && ../.venv/bin/python manage.py makemigrations --check --dry-run
cd backend && ../.venv/bin/python -m pip check
git diff --check
```

Resultado: 91 testes backend passaram; lint passou com 0 erros e 84 avisos legados; typecheck e build Next.js 16.3.2 passaram com 44 páginas; audit reportou 0 vulnerabilidades de produção; não existem migrações não geradas nem dependências Python quebradas. Login inválido, reset de password e sucesso de cotação sem token também foram validados no browser local sem erros de console. O draft PR #1 foi aberto sem merge/deploy e todos os checks GitHub/Vercel passaram. O preview responde nas páginas, mas o proxy da API retorna 502 por decisão de isolamento: `NEXT_PUBLIC_API_URL` permanece apenas em Production até existir backend de staging. A configuração atual da Vercel está limpa; o deployment de produção anterior pode conservar o snapshot antigo até as chaves serem rotacionadas e ocorrer um novo deploy controlado.

Estado do projeto:

- Fase/trilha atual: draft PR #1 publicado e aguardando conclusão operacional do Gate 0 antes de revisão/merge.
- Sólido agora: código sem credenciais fixas, autenticação JWT revogável, cotações públicas sem PII, uploads/proxies/healthchecks endurecidos, configuração da Vercel sem segredos internos do backend e CI frontend/backend verde.
- Falta imediato: criar backup restaurável do PostgreSQL Railway; revogar as duas chaves encontradas no histórico; rotacionar a password do administrador real; configurar SMTP/SITE_URL/CSRF no Railway; só depois coordenar limpeza do histórico.
- Distância do fim: PR 1 está tecnicamente pronto, mas produção continua **NO-GO** até ações operacionais, PRs 2–4, staging e matriz completa de logins/admin.

## Próximo passo recomendado

Concluir o Gate 0 operacional no Railway e nos fornecedores de segredos, publicar/revisar o PR 1 e então iniciar o PR 2 de integridade de dados, CMS e analytics.

AVISO: O proximo passo e criar/implementar a conclusao operacional do Gate 0, revisar o PR 1 e iniciar o PR 2 de integridade de dados, CMS e analytics. Antes de iniciar, leia `PROJECT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

## Histórico anterior — publicação Convex (desatualizado)

As secções abaixo registram a arquitetura anterior baseada em Convex. Elas são mantidas apenas como histórico e não descrevem o backend atual.

## Alterações Principais

- Recuperação de senha passa a gerar e enviar o token no backend Convex, sem devolvê-lo ao browser.
- Senhas exigem 12 caracteres com letras e números; pedidos de recuperação têm janela de 15 minutos.
- Conteúdo rico de artigos e portfólio é sanitizado antes de persistir e antes de renderizar.
- Chaves de IA passam a ser cifradas com AES-GCM, com migração das chaves legadas pelo painel administrativo.
- E-mails escapam conteúdo fornecido pelo utilizador e exigem remetente configurado.
- Corrigida a rota dos produtos destacados para /store/<id>.
- Melhorias de acessibilidade: zoom permitido, atalho para o conteúdo principal e FAQ semântico.
- Depoimentos, estatísticas e avaliações não verificadas foram removidos.
- Next.js 16 usa a convenção proxy e o sitemap é explicitamente dinâmico.
- Contactos públicos centralizados em src/shared/utils/contact.ts: +244 950 744 445, +244 924 197 009, info@vitaleevo.ao e localização em Benfica.
- Página de contacto e rodapé receberam layout responsivo renovado, ligações telefónicas, e-mail, WhatsApp e Google Maps.

## Validação Executada

- npx convex codegen: passou.
- npm run typecheck: passou.
- npm run lint: passou sem erros; mantém avisos de legado.
- npm run build:app: passou; 36 rotas geradas e sitemap dinâmico.
- Atualização de contactos (2026-08-16): npm run typecheck e npm run build:app passaram; npm run lint passou sem erros e manteve 136 avisos de legado.

## Atualização de Contactos — 2026-08-16

- O número principal de WhatsApp usado nos pedidos é +244 950 744 445.
- Os dados estruturados do site usam a morada e telefone oficiais.

## Última etapa concluída: Publicação web em produção — 2026-08-16

Objetivo: concluir o deploy autorizado do frontend e do backend, evitando o envio de artefactos locais para a Vercel.

Foi feito:

- Convex publicado em `https://merry-fennec-711.convex.cloud`.
- Variáveis de produção configuradas no projeto Vercel para domínio, contactos e endpoint Convex.
- Criado `.vercelignore` para excluir dependências, builds, repositório Git e materiais internos do envio.
- Publicado o commit `3701907` em `main`; a Vercel construiu e associou a versão ao domínio oficial.

Arquivos principais:

- `.vercelignore`
- `.gitignore`
- `PROJECT_MEMORY.md`

Verificação executada:

```bash
vercel inspect https://vitaleevo-h82os0xa8-vitaleevos-projects.vercel.app --scope vitaleevos-projects
curl -fsSIL https://vitaleevo.ao
curl -fsS https://vitaleevo.ao/contact
vercel logs https://vitaleevo-h82os0xa8-vitaleevos-projects.vercel.app --level error --since 1h --scope vitaleevos-projects
```

Resultado: deployment `Ready`, domínio `https://vitaleevo.ao` respondeu HTTP 200, contactos e layout novo presentes; sem erros nos logs Vercel.

Estado do projeto:

- Fase/trilha atual: publicação web concluída.
- Sólido agora: GitHub, Convex, Vercel e domínio oficial estão alinhados com a versão publicada.
- Falta imediato: confirmar a entrega de e-mails pelo Convex com `RESEND_API_KEY` e migrar as chaves de IA legadas no painel administrativo.
- Distância do fim: esta trilha está concluída; a operação contínua ainda requer validação real dos fluxos externos.

## Próximo Passo

Validar a entrega de e-mails e migrar as chaves de IA pelo painel administrativo.

AVISO: O proximo passo e criar/implementar a validacao operacional de e-mail e a migracao das chaves de IA. Antes de iniciar, leia `PROJECT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.
