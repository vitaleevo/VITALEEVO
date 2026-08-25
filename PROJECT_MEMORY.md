# Memória do Projeto VitalEvo

## Estado Atual

**CUTOVER CONCLUÍDO — 2026-08-25**: `vitaleevo.ao` (Vercel, build de `main` pós-merge do PR #5) serve o frontend novo e o browser fala diretamente com `https://api.vitaleevo.ao` (Railway Django novo, deploy `4ec19743`/`b57d07a6` SUCCESS). O Convex `merry-fennec-711` está bypassed. Produção: health live/ready 200 (db+redis), 85 produtos, site_config com `siteName=Vitaleevo` (corrigido na BD), password-reset enviado via Resend produção, cotação pública sem token 400, Django Admin 200. `RQ_ASYNC=False` em produção (e-mails síncronos até existir worker). Pendente pós-cutover: revogar chave Resend `vitaleevo`/`re_87Qv...` (esta exposta em transcript via `vercel env pull` — ROTACIONAR), revogar `CONVEX_DEPLOY_KEY`, apagar projeto Convex, rotacionar `admin@vitaleevo.ao`, rotação de credenciais de staging expostas e limpeza de buckets órfãos.

## Checkpoint cutover produção — 2026-08-25

- PR #5 (`codex/cicd-railway-vercel` → `main`) criado e merged (`04:06:33Z`) com 14/14 checks verdes após fix dos mocks E2E (`file:e2e/auth-capabilities.spec.ts:15` normaliza trailing slash — o fix `b149415` do apiClient quebrou os mocks `endsWith("/auth/login")`).
- Railway production/web: deploy automático SUCCESS; migrações via preDeployCommand aplicadas na BD de produção.
- Vercel Production: `NEXT_PUBLIC_API_URL=https://api.vitaleevo.ao` e `SITE_URL=https://vitaleevo.ao` criadas (estavam vazias!), redeploy `k5scv250c`; bundle do browser confirma host `api.vitaleevo.ao` no chunk `13fulwe4qce25.js`.
- `vercel env pull` expôs no transcript `EMAIL_HOST_PASSWORD` de produção (`re_87Qv...`) — **rotação obrigatória**; ficheiro `.tmp-vercel-prod.json` apagado.
- Smoke produção: login (erro credenciais inválidas OK), reset enviado (Bounced — caixa inexistente), quotes 400, admin 200, proxy `/api/v1/*` no domínio responde do Django.

## Checkpoint bucket media-production — 2026-08-24

- Bucket de produção criado e ligado ao serviço `web` via browser CDP (`http://localhost:9222`, perfil `chrome-cdp-profile` autenticado no Railway): bucket `preserved-basketcase` (id `3373836c-b40d-49f6-8a06-68a8f84baa9f`, nome real S3 `preserved-basketcase-o5l8l0`, região EU West Amsterdam, endpoint `https://t3.storageapi.dev`).
- Fluxo que funcionou: command palette → `New Service` → `Bucket` (navegação por teclado ArrowDown×6+Enter; clique JS não regista no cmdk) → painel Settings confirmou região → `Shift+Enter` na palette aplicou as mudanças (o botão `Apply` não respondeu a cliques sintéticos).
- Variáveis injetadas pelo diálogo `Add to Service` com estilo **Django (django-storages)** — nomes exatos exigidos por `file:backend/config/settings/base.py:134`: `AWS_S3_ENDPOINT_URL`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (referências `${{preserved-basketcase.*}}`), confirmadas em `production/web` via `railway variable list`.
- `EMAIL_HOST_PASSWORD` (chave `vitaleevo-production` `re_87Qv...`) já estava selada em `production/web` com `--skip-deploys`.
- Agent do Railway não consegue definir região em buckets de ambiente (só templates); API GraphQL cria bucket mas não instancia (`BucketInstance not found` sem mutação pública); `bucketS3Credentials` retorna `Not Authorized` para token de CLI — credenciais só visíveis no dashboard.
- Limpieza pendente: buckets órfãos `2e62acb5` (criado por engano no projeto `profissionais`, env `328a5f6d`) e `10a7352e`/`ample-cornucopia-lJVK` + `64b21aa2`/`convenient-pantry` (sem instância, descartados) — apagar manualmente no dashboard.
- Produção agora cumpre `file:backend/config/settings/production.py:12` (`USE_S3_STORAGE`) e `:21` (SMTP) — pronta para o deploy do código novo após merge.

## Checkpoint Gate 0 operacional — SMTP, logins e correções — 2026-08-23

- Domínio `vitaleevo.ao` verificado no Resend (status `Verified` em `https://resend.com/domains/9dd3ed75-6501-4bfe-a865-fc9871d12e2a`): adicionados `resend._domainkey` TXT `p=MIGfMA0GCSqG...DAQAB`, `send` MX `feedback-smtp.us-east-1.amazonses.com` e `send` TXT `v=spf1 include:amazonses.com ~all` via `vercel dns add` e validados com `https://dns.google/resolve`; `_dmarc` já existia.
- Criadas duas novas chaves Resend `Sending access` via browser CDP (`chrome-cdp-profile` em `http://localhost:9222`): `vitaleevo-staging` (`re_VVJd...`, rotacionada após vazamento no `printenv`) e `vitaleevo-production` (`re_87Qv...`); instaladas via `railway variable set EMAIL_HOST_PASSWORD --stdin --skip-deploys` em `staging/api,worker,analytics-cleanup` e `production/web`.
- Chave antiga `erp geral` (`re_Dqwu...`, `Full access`, 5 meses sem uso) revogada no dashboard; `vitaleevo` (`re_FjKx...`, 8 meses) mantida até o cutover porque ainda alimenta e-mails do Convex em produção. Chave vazada no histórico `re_STYW...` (`file:.env.local.example:239`, removida em `dbe184a`) já não consta entre as chaves ativas.
- Staging migrado para `DJANGO_ENV=production`: corrigido `file:backend/config/settings/base.py:229` (`MAILERS["default"]["OPTIONS"]` com `host/port/username/password/use_tls`) e `file:backend/config/settings/production.py:14` (validação de `OPTIONS` + `SECURE_REDIRECT_EXEMPT = [r"^api/v1/health/"]` em `file:backend/config/settings/production.py:26` para o healthcheck `file:railway.json:9` não receber `301`). Deploys `a9f0f843` (`api`) e `fa242ad0` (`worker`) em `SUCCESS` em `2026-08-23 16:34:45 +01:00`.
- SMTP validado em staging: `POST https://api-staging-e6d1.up.railway.app/api/v1/auth/password-reset/` (`file:backend/apps/users/views.py:106`) para `e2e.user@vitaleevo.ao` retorna `200` e gera entrada em `https://resend.com/emails` (`Bounced` = caixa de teste inexistente, não falha de infra; `Duration 1775ms` vs `397ms` do `console`).
- 5 logins E2E validados via `POST /api/v1/auth/login/` (`e2e.user/commercial/content/operations/admin@vitaleevo.ao`) com passwords rotacionadas para `E2e*2026Test*` via `railway ssh -e staging -s api -- python manage.py shell`; secret `E2E_ROLE_CREDENTIALS` atualizado no environment `staging` do GitHub.
- Vercel Preview de `staging` em `https://vitaleevo-git-staging-vitaleevos-projects.vercel.app` (deploy `dpl_JnhXXgHEQGy5BC8xZmwk55Z8EGq7`, `16:34:45`) continua protegido por `x-vercel-protection-bypass` (workflow `file:.github/workflows/staging-smoke.yml:55` não despachável porque só existe em `staging`, não em `main`); `production` em `https://vitaleevo.ao` ainda aponta para Convex.
- Vazamentos nesta sessão: `AWS_*` de `media-staging` via `railway variable list` sem filtro e `re_auFRBcgY...` via `printenv` no SSH — ambas as credenciais de staging devem ser rotacionadas; ficheiros `key-*.txt` e `.tmp-*.sh` removidos.

Estado do release:

- Staging API/worker/cron, health `live`/`ready`/`worker`, SMTP, 5 logins: **GO**.
- Produção: **NO-GO** — bloqueada por falta de bucket S3 `media-production` (exigido em `file:backend/config/settings/production.py:12`) e por `EMAIL_HOST_PASSWORD` ainda com `--skip-deploys`; `Convex CONVEX_DEPLOY_KEY` (`prod:merry-fennec-711|...`) exposta no histórico (`5e5644d`, `dbe184a`) pendente de rotação manual no `dashboard.convex.dev` após cutover; `admin@vitaleevo.ao` (`is_superuser` único) ainda sem rotação/invalidação de sessões; `DATABASE_URL`/`REDIS_URL` expostas via túnel também pendentes de rotação pós-estabilização.

Próximo passo: no projeto `https://railway.com/project/879017da-2678-4ae5-a4ab-82bad3a220d1`, criar Bucket `media-production` (Tigris `t3.storageapi.dev`, privado) no environment `production`, injetar `AWS_*` em `production/web` (e `worker` quando existir), depois merge sequencial `main ← PR1 ← PR2 ← PR3 ← PR4`, redeploy `production/web` (migrations via `preDeployCommand`), trocar Vercel `Production` para `NEXT_PUBLIC_API_URL=https://api.vitaleevo.ao`, validar produção e só então revogar `vitaleevo`/`CONVEX_DEPLOY_KEY`, rotacionar `admin@vitaleevo.ao` e eliminar projeto Convex.

## Checkpoint PR 4, staging e integração — 2026-08-23

- Publicado o PR #4 (`codex/cicd-railway-vercel`); o código de infraestrutura foi validado no commit `6dc8828` e a branch remota `staging` acompanha o PR.
- Todos os checks do PR #4 estão verdes: backend com PostgreSQL/Redis/migrações/OpenAPI/testes, imagem Docker e liveness, frontend audit/lint/testes/build, Playwright, Vercel e os três serviços Railway.
- Criado ambiente Railway `staging` isolado com PostgreSQL, Redis persistente, bucket S3 privado `media-staging`, API, worker RQ e cron `analytics-cleanup`.
- API de staging publicada em `https://api-staging-e6d1.up.railway.app`; liveness, readiness (PostgreSQL/Redis) e heartbeat do worker respondem 200.
- Migrações executadas com sucesso como Pre-Deploy Command. API e worker são processos separados; o cron de limpeza está versionado e agendado.
- Vercel Preview das branches `staging` e `codex/cicd-railway-vercel` aponta exclusivamente para a API Railway de staging. O proxy do Preview até `/api/v1/health/live/` foi comprovado.
- Variáveis de backend/e-mail legadas foram removidas da Vercel. O bypass de proteção do Preview está selado no environment `staging` do GitHub.
- Foram provisionadas cinco contas E2E exclusivas de staging (cliente, comercial, conteúdo, operações e super admin). As credenciais aleatórias existem apenas como secret `E2E_ROLE_CREDENTIALS` no environment `staging` do GitHub; a cópia temporária no Railway foi removida.
- A configuração de staging permanece temporariamente em modo de desenvolvimento porque ainda não existe uma nova chave SMTP Resend. Produção não foi mesclada nem alterada por esta etapa.

Estado do release:

- Infraestrutura, CI/CD, storage, migrações e healthchecks de staging: **GO**.
- SMTP real, recuperação de password, rotação/revogação de chaves e matriz completa de logins/admin: **PENDENTE**.
- Decisão global: **NO-GO para produção** até concluir os itens pendentes, executar smoke/E2E real e revisar/mesclar os PRs 1–4 em ordem.

## Checkpoint operacional do Gate 0 — 2026-08-23

- Criado dump PostgreSQL de produção fora do repositório, protegido com permissão `600` e acompanhado de manifesto SHA-256.
- Validada a estrutura do dump com `pg_restore --list` e executada uma restauração integral em PostgreSQL 18 descartável; a tabela `django_migrations` foi confirmada.
- Configuradas no Railway, sem disparar deploy, as variáveis públicas `SITE_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_USE_TLS` e `DEFAULT_FROM_EMAIL`.
- Criado o domínio personalizado `api.vitaleevo.ao` no serviço web Railway; os registos CNAME e TXT de verificação foram adicionados ao DNS administrado pela Vercel. O Railway confirmou a propriedade e emitiu um certificado TLS válido; resolvers locais ainda podem servir temporariamente o antigo wildcard da Vercel durante a propagação.
- O domínio Railway nativo responde 200 em `/api/v1/health/`.
- O banco de produção contém exatamente um administrador ativo, staff e superutilizador. A password ainda não foi rotacionada para evitar bloqueio antes de SMTP/recuperação estarem operacionais.
- Resend e Convex exigem autenticação do proprietário no browser. Nenhuma chave foi criada ou revogada sem confirmação explícita no momento da ação.
- A credencial do PostgreSQL deve ser rotacionada depois de estabilizar o deploy, porque o túnel operacional a expôs à sessão privada de execução.

Estado do projeto:

- Fase/trilha atual: Gate 0 operacional parcialmente concluído; draft PR #1 permanece sem merge e sem deploy.
- Sólido agora: backup restaurável, saúde do backend no domínio Railway nativo, variáveis públicas preparadas e DNS do subdomínio da API configurado.
- Falta imediato: autenticar Resend/Convex, criar a chave Resend substituta, configurar `EMAIL_HOST_PASSWORD`, revogar as chaves antigas, rotacionar admin/tokens e PostgreSQL, aguardar a propagação DNS local e validar a API pelo domínio oficial.
- Decisão de release: **NO-GO** até concluir estes itens e a matriz de autenticação.

## Última etapa concluída: PR 2 e PR 3 — dados, CMS, analytics, frontend e logins — 2026-08-23

Objetivo: concluir a integridade transacional do catálogo/CMS/analytics e garantir que cliente, comercial, conteúdo, operações e super admin só acedem aos módulos permitidos.

Foi feito no PR 2 (`codex/data-cms-analytics`, commit `296d519`):

- Stock atómico com bloqueio de linha, rejeição de saldo negativo e movimentos consistentes para reserva/libertação.
- SKU não vazio único sem diferença de maiúsculas, limpeza de duplicados, validação de subcategoria e proteção contra ciclos de categorias.
- Newsletter assinada, broadcasts persistidos e executados por RQ com retentativas/contadores; contacto e e-mail centralizados no Django.
- Configurações públicas limitadas a `site_config`; analytics validado, limitado, paginado e com retenção/limpeza.
- Migrações de dados e testes para os contratos anteriores.

Foi feito no PR 3 (`codex/frontend-admin-logins`, commit `18c8a7d`):

- Camada única de capabilities no frontend e proteção real de cada rota administrativa, além da visibilidade do menu.
- Dashboard backend/frontend filtrado por capability; rascunhos, configurações privadas e encomendas deixaram de ser visíveis a staff sem autorização.
- Operações recebeu `orders:read` e `orders:manage`, incluindo migração segura das contas existentes.
- Cliente é direcionado para `/conta`; staff para `/admin`; alteração de password encerra a sessão; detalhe de encomenda redireciona utilizador não autenticado.
- Django Admin validado para superuser; links de cancelamento da newsletter usam token assinado sem e-mail na URL.
- Consentimento explícito antes de analytics/GA, melhorias de foco, labels, estados acessíveis, dimensões e carregamento diferido de imagens críticas.
- Vitest/Testing Library e Playwright adicionados com matriz para cliente, comercial, conteúdo, operações e admin.

Verificação executada:

```bash
cd backend && ../.venv/bin/python -m pytest
cd backend && ../.venv/bin/python manage.py makemigrations --check --dry-run
cd backend && ../.venv/bin/python manage.py check
cd backend && ../.venv/bin/python -m pip check
npm run test
npm run typecheck
npm run lint
npm run build:app
npx playwright test --workers=1
npm audit --omit=dev --ignore-scripts
git diff --check
```

Resultado: 116 testes backend, 8 testes frontend e 5 percursos Playwright passaram; build Next.js com 44 rotas, typecheck, checks Django, migrações e `pip check` passaram; lint ficou em 0 erros e 80 avisos legados; dependências de produção têm 0 vulnerabilidades reportadas.

Estado do projeto:

- Fase/trilha atual: PRs 1–3 implementados e branches publicadas; ainda não mesclados nem implantados.
- Ordem de revisão/merge: `main` ← PR 1 ← PR 2 ← PR 3, preservando a dependência entre as branches empilhadas.
- Falta imediato: concluir Gate 0 operacional, revisar/mesclar a sequência, executar migrações num staging restaurável e homologar Vercel + Railway + worker RQ + SMTP.
- Decisão de release: **NO-GO** até o Gate 0 externo, staging e homologação integrada passarem.

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

Com confirmação explícita no momento da ação, criar uma nova chave SMTP no Resend, instalá-la de forma selada no Railway staging/produção, validar envio e recuperação de password em staging e só então revogar as chaves históricas do Resend e do Convex. Depois, rotacionar o administrador real, executar a matriz E2E do staging e revisar/mesclar sequencialmente os PRs 1–4 antes do deploy controlado de produção.

AVISO: O proximo passo e criar/implementar a conclusao operacional do Gate 0 no Resend e Convex, validar SMTP e todos os logins no staging e preparar o merge sequencial dos PRs 1-4. Antes de iniciar, leia `PROJECT_MEMORY.md` para continuar exatamente de onde o projeto parou, entender o que ja foi feito e integrar a solucao com o sistema atual sem reler todo o repositorio.

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
