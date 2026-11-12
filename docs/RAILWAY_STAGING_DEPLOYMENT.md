# Railway — homologação isolada da API VITALEEVO

## Situação em 12/11/2026

**BLOQUEADO PELA CONTA RAILWAY.** Ao solicitar a criação do projecto
privado "vitaleevo-staging", a API devolveu: "Your trial has expired.
Please select a plan to continue using Railway."

Nenhum projecto, ambiente, domínio, serviço ou base de dados de produção
foi alterado. Este documento acompanha a branch de release
"deploy/staging-backend-20261112", criada a partir de "main". As alterações
locais não publicadas na branch "codex/convex-parity-20261112" não fazem parte
desta release: precisam de revisão e testes separados.

## Arquitectura prevista após a activação do plano

- Projecto Railway **privado e independente**: "vitaleevo-staging".
- Nome do ambiente principal: **staging**, nunca "production".
- Postgres próprio, criado pelo template PostgreSQL (credenciais geradas
  pela Railway), **sem clonar ou conectar a base de produção**.
- Redis próprio, pelo template Redis; não usar Redis nem filas de produção.
- Um serviço "web" a partir de "vitaleevo/VITALEEVO", branch
  "deploy/staging-backend-20261112".
- Um serviço "worker" da mesma revisão Git, comando de arranque
  "python manage.py rqworker default", partilhando apenas os serviços
  Postgres/Redis de staging.
- Bucket S3 exclusivo de staging se for necessário validar upload/media;
  nunca apontar para o bucket da produção. Sem bucket, o armazenamento
  local de staging é efémero e não serve para testes de persistência.
- Dominio Railway gerado, diferente de api.vitaleevo.ao. Não ligar
  dominio de produção nem qualquer checkout real do site à staging.

## Configuração do web

Reproduzir as configurações de BUILD/DEPLOY do projecto existente, mas
apenas no novo projecto isolado:
- Fonte GitHub: vitaleevo/VITALEEVO.
- Branch: deploy/staging-backend-20261112.
- Root directory: /backend; Dockerfile path: backend/Dockerfile.
- Pre-deploy: python manage.py migrate --noinput.
- Healthcheck: /api/v1/health/ready/, timeout 120 segundos.
- Arranque: Dockerfile Gunicorn, porta 8080.

Configurar **nomes de variáveis** no ambiente de staging (não guardar
valores secretos em GitHub, ChatGPT, logs ou documentos):

| Variável | Fonte em staging |
| --- | --- |
| DJANGO_SETTINGS_MODULE | config.settings.staging |
| DATABASE_URL | Referência Railway para Postgres.DATABASE_URL do novo projecto |
| REDIS_URL | Referência Railway para Redis.REDIS_URL do novo projecto |
| SECRET_KEY | Segredo aleatório novo e exclusivo de staging |
| SITE_URL | HTTPS do domínio exclusivo de staging |
| ALLOWED_HOSTS | Host de staging; domínios Railway adicionados automaticamente |
| CSRF_TRUSTED_ORIGINS | Só HTTPS de staging |
| CORS_ALLOWED_ORIGINS | Apenas frontend de preview explicitamente autorizado |
| DEBUG | False |
| RQ_ASYNC | True |

RAILWAY_ENVIRONMENT_NAME é injectado pelo Railway e deve ser "staging".
O perfil config.settings.staging recusa arrancar em qualquer ambiente
com outro nome, recusa SQLite, exige PostgreSQL/Redis e SITE_URL
HTTPS diferente dos endereços de produção.

**Não definir:** SMTP de produção, credenciais ProxyPay, bases de dados
de produção, chaves S3 de produção, FIRST_ADMIN_* de produção ou URLs de
webhooks de produção. O perfil de staging desactiva explicitamente o
envio real de e-mails e as credenciais ProxyPay, mesmo que alguém
as introduza por engano. Usar apenas dados sintéticos no ambiente novo.

## Critérios de homologação (gates)

1. O plano Railway permite criar o projecto; confirmar que
   "vitaleevo-backend" (production) permanece intacto.
2. Postgres/Redis da staging online, independentes e sem registos reais.
3. python manage.py check --deploy --settings=config.settings.staging
   e python manage.py migrate --noinput sem erros.
4. GET /api/v1/health/live/ HTTP 200;
   GET /api/v1/health/ready/ HTTP 200 com db/redis true.
5. Worker RQ com heartbeat; GET /api/v1/health/worker/ HTTP 200.
6. Autenticação de utilizadores **sintéticos**, autorização por capacidade,
   criação e gestão de cotações e encomendas de teste.
7. Tentativa de iniciar pagamento deve falhar de forma segura por falta
   de configuração ProxyPay; nenhuma referência real deve ser criada.
8. Upload de media somente para bucket próprio (se provisionado).
9. Executar testes Django/Playwright; examinar erros HTTP 5xx e logs.
10. Nunca fazer promoção/cutover de staging para produção automaticamente.

## Recuperação

A staging está num projecto separado; uma falha não modifica a produção.
O rollback de testes consiste em reverter o deploy da staging ou eliminar
os serviços de testes, após assegurar que não há dados importantes.
O deploy de produção nunca deve ser reiniciado para recuperar a staging.
