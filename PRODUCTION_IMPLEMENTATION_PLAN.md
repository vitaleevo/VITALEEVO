# Plano de Correção, Integração e Publicação — VitalEvo

Data do plano: 2026-08-22
Estado: aprovado para iniciar implementação; produção ainda bloqueada
Objetivo: corrigir os bloqueadores técnicos, publicar o código no GitHub e operar o frontend Next.js na Vercel integrado ao backend Django no Railway, com site público, painel administrativo e todos os fluxos de autenticação funcionais.

## Estado de execução — 2026-08-23

- Gate 0 de código: concluído (credenciais fixas e exemplos sensíveis removidos; bootstrap e seed endurecidos).
- Gate 0 operacional: pendente (backup/restauração, revogação dos segredos históricos, rotação do admin real e configuração SMTP).
- PR 1: implementado e validado localmente na branch `codex/production-hardening`.
- PRs 2–4, staging e produção: pendentes.
- Decisão de release: **NO-GO** até todos os gates aplicáveis passarem.

## Resultado final esperado

```text
GitHub (main protegida)
   ├── Vercel: Next.js — https://vitaleevo.ao
   └── Railway
       ├── API Django/Gunicorn — https://api.vitaleevo.ao
       ├── Worker Django RQ
       ├── PostgreSQL
       ├── Redis
       └── Railway Storage Bucket (media persistente)
```

O browser consumirá `https://api.vitaleevo.ao/api/v1`. O backend aceitará apenas os domínios oficiais e previews autorizados. O Django Admin ficará disponível em `https://api.vitaleevo.ao/admin/`; o painel administrativo da aplicação continuará em `https://vitaleevo.ao/admin`.

## Princípios da execução

- Não fazer correções diretamente em `main`.
- Criar a branch `codex/production-hardening` e entregar alterações em PRs pequenos e verificáveis.
- Nunca copiar dados ou segredos de produção para ambientes de preview.
- Não executar migração destrutiva junto com uma alteração de aplicação incompatível.
- Fazer backup e ensaio de restauração antes de alterar dados de produção.
- A Vercel e o Railway só publicam produção depois de todos os gates desta página passarem.
- Preservar os ficheiros locais não versionados do utilizador; revisar antes de qualquer `git add`.

## Gate 0 — Contenção, inventário e backup

Objetivo: eliminar riscos imediatos antes de desenvolver.

1. Pausar temporariamente o auto-deploy de produção ou garantir que apenas `main` publica.
2. Fazer snapshot/export do PostgreSQL atual e verificar que o ficheiro pode ser restaurado.
3. Inventariar, apenas pelos nomes, as variáveis existentes na Vercel e no Railway.
4. Remover a credencial fixa do comando `ensure_admin` e assumir que ela foi comprometida.
5. Rotacionar a password desse administrador diretamente no Railway; encerrar sessões e refresh tokens existentes.
6. Substituir bootstrap de admin por comando manual que exige `ADMIN_BOOTSTRAP_EMAIL` e `ADMIN_BOOTSTRAP_PASSWORD`, sem valores padrão e sem redefinir passwords a cada deploy.
7. Retirar passwords padrão do comando `seed`; seeds de produção devem ser explícitos e idempotentes.
8. Verificar se existem outros segredos no histórico Git e, se necessário, revogar primeiro e limpar o histórico numa operação separada e coordenada.

Critério de saída:

- Nenhuma credencial real está no código ou em logs.
- Admin de produção possui password nova e tokens anteriores foram invalidados.
- Backup restaurável identificado e registado.

## PR 1 — Segurança, autenticação e contratos públicos

### Cotações

- Separar o serializer público do serializer administrativo.
- A consulta pública deve devolver somente estado, referência segura e informações estritamente necessárias.
- Substituir o identificador curto por token de acesso criptograficamente forte, com pelo menos 128 bits.
- Guardar apenas hash do token quando viável e criar mecanismo de rotação/revogação.
- Aplicar throttling e testes negativos para enumeração, BOLA e exposição de dados pessoais.
- Definir migração compatível para as cotações existentes.

### Sessão e login

- Instalar `rest_framework_simplejwt.token_blacklist` e executar as respetivas migrações.
- Reduzir a duração do access token e manter refresh token rotativo.
- No frontend, guardar o refresh retornado pela rotação e repetir a requisição com o novo access token.
- Atualizar o estado do `AuthProvider` quando o token for renovado.
- Criar endpoint de logout/revogação e garantir limpeza local da sessão.
- Evitar múltiplos refreshes simultâneos com uma única promise/fila de renovação.
- Uniformizar respostas 401/403 e redirecionamento para `/login`.

### Recuperação de password

- Configurar `PASSWORD_RESET_TIMEOUT=900`.
- Não incluir o e-mail em query string; usar identificador codificado e token assinado.
- Registar falhas de envio sem revelar se a conta existe.
- Tornar SMTP obrigatório em produção.

### Uploads e proxy

- Bloquear SVG e tipos ativos até existir sanitização comprovada.
- Validar assinatura real, extensão, tamanho e conteúdo do ficheiro.
- Limitar headers, timeout e tamanho no proxy da API ou remover o proxy se o frontend passar a comunicar diretamente com `api.vitaleevo.ao`.
- Não devolver mensagens internas de exceção ao cliente.

Testes obrigatórios:

- Login válido e inválido.
- Conta inativa.
- Access token expirado com refresh válido.
- Refresh rotacionado e refresh antigo rejeitado.
- Logout seguido de tentativa de reutilização do refresh.
- Cliente comum impedido de aceder às rotas de staff.
- Enumeração de cotação rejeitada.
- Upload disfarçado e SVG rejeitados.

## PR 2 — Integridade de dados, CMS e analytics

### Banco de dados

- Tornar ajustes de stock atómicos com `F()` ou `select_for_update()`.
- Criar unicidade de SKU após relatório e limpeza de duplicados.
- Validar que subcategoria pertence à categoria e impedir ciclos de categorias.
- Corrigir o delta registado no histórico de stock.
- Enfileirar notificações somente em `transaction.on_commit()`.
- Rever índices de consultas administrativas e analytics.

### CMS e newsletter

- Fazer upsert de páginas através de serializers validados e transações.
- Assinar links de cancelamento da newsletter.
- Enviar broadcast em jobs RQ, com contagem real de sucesso/falha e retentativas limitadas.
- Restringir configurações públicas a uma allowlist explícita.
- Centralizar contacto e envio de e-mails no Django; remover o segundo fluxo de e-mail da Vercel.

### Analytics e privacidade

- Adicionar consentimento antes de iniciar tracking não essencial.
- Limitar tamanho de payload, quantidade de cliques por lote e frequência por IP/sessão.
- Validar números e rejeitar dados inválidos com 400, não 500.
- Criar política de retenção/agregação e job periódico de limpeza.
- Eliminar N+1 e processamento ilimitado em memória.

Gate de migração:

- `makemigrations --check` limpo.
- Migrações testadas numa cópia de staging.
- Plano de forward recovery documentado para cada migração não reversível.

## PR 3 — Frontend, painel administrativo e todos os logins

### Fluxos que devem funcionar

| Perfil | Entrada | Destino | Permissões esperadas |
|---|---|---|---|
| Cliente | `/login` | `/conta` | Apenas os próprios dados e pedidos |
| Comercial | `/login` | `/admin` | Cotações/contactos conforme capabilities |
| Conteúdo | `/login` | `/admin` | CMS, blog, portfólio e media autorizada |
| Operações | `/login` | `/admin` | Catálogo, stock e encomendas autorizadas |
| Super admin | `/login` | `/admin` | Todos os módulos |
| Django superuser | `/admin/` no domínio da API | Django Admin | Administração técnica completa |

Implementação:

- Criar uma única camada tipada de autenticação e API; remover aliases legados do Convex gradualmente.
- Proteger o layout administrativo por autenticação e capability, não apenas por visibilidade do menu.
- Criar estado claro para sessão expirada, indisponibilidade da API e acesso proibido.
- Confirmar cadastro, login, logout, renovação, alteração e recuperação de password.
- Confirmar que utilizador autenticado mantém a sessão após navegação e perde a sessão após revogação.
- Corrigir labels, nomes acessíveis, foco visível e alvos tácteis.
- Subir o formulário de contacto e CTA principal em mobile.
- Otimizar as imagens mais pesadas com `next/image` e formatos modernos.
- Dividir os maiores ficheiros administrativos por domínio/componente sem mudar contratos.

Automação:

- Adicionar testes unitários com Vitest/Testing Library para autenticação e utilitários.
- Adicionar Playwright para os percursos cliente, staff e super admin.
- Usar contas de teste exclusivas de staging; nunca incluir passwords no repositório.

Critério de saída:

- Toda a matriz de login passa em desktop e mobile.
- Um perfil não consegue abrir ou chamar módulos para os quais não possui capability.
- Não existem erros de console nos fluxos críticos.

## PR 4 — CI/CD, Railway, Vercel e observabilidade

### GitHub Actions

Separar os jobs para obter falhas claras:

1. Frontend: `npm ci`, audit de produção, lint apenas sobre o código do projeto, typecheck, testes e build.
2. Backend: instalar requirements, `pip check`, `manage.py check`, migrações, pytest e geração/validação OpenAPI.
3. Segurança: pesquisa de segredos, dependências vulneráveis e análise estática.
4. E2E de staging após deploy bem-sucedido.

Proteger `main` com PR obrigatório, checks obrigatórios, branch atualizada e bloqueio de push direto. A integração Git da Vercel e do Railway fará os deployments; tokens de deploy não precisam ficar no repositório.

### Railway

Usar o repositório GitHub com Root Directory `/backend` e manter uma única configuração Railway. Estrutura:

- `vitaleevo-api`: Gunicorn apenas.
- `vitaleevo-worker`: `python manage.py rqworker default`.
- PostgreSQL.
- Redis.
- Railway Storage Bucket S3-compatible para media.

Mudanças operacionais:

- Docker multi-stage, dependências fixadas, utilizador não-root e tratamento correto de SIGTERM.
- Retirar migrations, `collectstatic` e worker do start do serviço web.
- Executar `python manage.py migrate --noinput` como Pre-Deploy Command.
- Executar `collectstatic` durante build/release conforme o artefacto final.
- Separar `/health/live` de `/health/ready`; readiness verifica PostgreSQL e Redis.
- Configurar domínio `api.vitaleevo.ao` e certificado TLS.
- Utilizar bucket privado para uploads, com URLs assinadas ou proxy controlado e cache.

Variáveis mínimas da API/worker, configuradas no Railway e nunca commitadas:

```text
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=<segredo aleatório e selado>
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
ALLOWED_HOSTS=api.vitaleevo.ao,<dominio-railway>,healthcheck.railway.app
CORS_ALLOWED_ORIGINS=https://vitaleevo.ao,https://www.vitaleevo.ao
CSRF_TRUSTED_ORIGINS=https://api.vitaleevo.ao
SITE_URL=https://vitaleevo.ao
RQ_ASYNC=True
EMAIL_HOST=<smtp>
EMAIL_PORT=587
EMAIL_HOST_USER=<segredo>
EMAIL_HOST_PASSWORD=<segredo selado>
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=no-reply@vitaleevo.ao
AWS_ENDPOINT_URL=${{MediaBucket.ENDPOINT}}
AWS_ACCESS_KEY_ID=${{MediaBucket.ACCESS_KEY_ID}}
AWS_SECRET_ACCESS_KEY=${{MediaBucket.SECRET_ACCESS_KEY}}
AWS_STORAGE_BUCKET_NAME=${{MediaBucket.BUCKET}}
AWS_S3_REGION_NAME=${{MediaBucket.REGION}}
```

As variáveis exatas do bucket devem seguir os nomes implementados no storage Django e as referências oferecidas pelo Railway.

### Vercel

Variáveis de Production:

```text
NEXT_PUBLIC_API_URL=https://api.vitaleevo.ao
NEXT_PUBLIC_SITE_URL=https://vitaleevo.ao
SITE_URL=https://vitaleevo.ao
```

- Remover `NEXT_PUBLIC_CONVEX_URL` e segredos de e-mail que deixarem de ser usados.
- Configurar Preview com a URL do backend de staging, nunca com produção.
- Redeploy é obrigatório após alteração de variáveis.
- Confirmar domínio principal e redirecionamento de `www`.

### Observabilidade

- Logs JSON com request ID/correlation ID, utilizador, rota, status e latência, sem tokens ou dados pessoais desnecessários.
- Error tracking para frontend, API e worker.
- Monitorização externa contínua da home, readiness e percurso de login; o healthcheck Railway atua apenas durante deploy.
- Alertas para 5xx, falha de jobs, indisponibilidade de DB/Redis, fila acumulada e falhas de e-mail.

## Gate 5 — Staging e homologação integrada

Sequência:

1. Criar ambiente `staging` isolado no Railway, com Postgres, Redis e bucket próprios.
2. Publicar a branch em Vercel Preview apontando para o backend de staging.
3. Aplicar migrações e criar contas de teste por comando seguro.
4. Executar testes de API, E2E e smoke tests manuais.
5. Testar envio e recebimento real de e-mail.
6. Testar upload, persistência após novo deploy e acesso a media.
7. Testar worker desligado/ligado e retentativa de jobs.
8. Testar CORS, headers de segurança e ausência de segredos nos bundles/logs.
9. Restaurar uma cópia do backup em staging e validar autenticação/dados.

Homologação mínima:

- Home, catálogo, blog, portfólio, contacto e cotação.
- Cadastro, login, logout, refresh, recuperação e alteração de password.
- Conta cliente e isolamento entre utilizadores.
- Todos os perfis da matriz administrativa.
- CRUD de produtos, categorias, marcas, CMS, blog, portfólio, contactos, cotações e utilizadores.
- Django Admin com CSS/estáticos e CSRF funcionais.
- E-mail e jobs RQ comprovados.

## Gate 6 — GitHub e produção

1. Garantir CI verde no último commit da branch.
2. Revisar `git diff`, migrações, dependências, variáveis documentadas e ausência de segredos.
3. Abrir PR para `main` com checklist e plano de rollback.
4. Aprovar e fazer merge; acompanhar primeiro Railway e depois Vercel.
5. Confirmar que a readiness do Railway está verde e que as migrações terminaram.
6. Confirmar `https://api.vitaleevo.ao/api/v1/health/` e Django Admin.
7. Confirmar que o novo deployment Vercel usa `https://api.vitaleevo.ao`.
8. Executar a matriz de smoke tests de produção sem alterar dados reais desnecessariamente.
9. Monitorizar logs, erros, filas e latência por pelo menos 30–60 minutos.
10. Só então declarar o release concluído.

## Rollback

- Vercel: promover/reverter para o deployment anterior.
- Railway: reativar o deployment anterior se a migração for compatível.
- Banco: preferir migrações expand/contract; nunca depender de downgrade destrutivo imediato.
- Manter backup pré-release e procedimento de forward recovery.
- Se autenticação falhar, bloquear novas escritas, restaurar a versão anterior e preservar logs para diagnóstico.

## Critérios finais de aprovação

- Zero vulnerabilidades críticas conhecidas nas dependências de produção.
- Nenhum segredo no código, histórico ativo, bundle ou logs.
- Testes backend, frontend, integração e E2E verdes no GitHub.
- Cotações públicas sem exposição de PII.
- Login e autorização aprovados para cliente, quatro perfis de staff e super admin.
- Django Admin e painel Next.js funcionais em produção.
- PostgreSQL, Redis, worker, e-mail e storage comprovados.
- Backups, restauração, rollback, logs e alertas documentados.
- API e frontend ligados apenas pelos domínios e variáveis oficiais.

## Estimativa de execução

Para uma execução sequencial por um engenheiro/agente, sem bloqueios de credenciais ou fornecedores: **8 a 12 dias úteis**.

- Gate 0 e PR 1: 2–3 dias.
- PR 2: 2 dias.
- PR 3: 2–3 dias.
- PR 4: 1–2 dias.
- Staging, correções finais e produção: 1–2 dias.

A estimativa não inclui espera por DNS, acesso às contas, aprovação de custos, configuração do SMTP ou revisão humana do PR.

## Referências operacionais oficiais

- Railway Django: https://docs.railway.com/guides/django
- Railway Pre-Deploy Commands: https://docs.railway.com/deployments/pre-deploy-command
- Railway Healthchecks: https://docs.railway.com/deployments/healthchecks
- Railway Variables: https://docs.railway.com/variables
- Railway Storage Buckets: https://docs.railway.com/storage-buckets
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Vercel Environments: https://vercel.com/docs/deployments/environments
- GitHub deployment environments: https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
