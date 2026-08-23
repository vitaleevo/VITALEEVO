# Checklist de Produção

## Gate 0 — contenção e credenciais

- Confirmar backup PostgreSQL restaurável e respetivo checksum fora do repositório.
- Revogar as chaves históricas do Resend e do Convex depois de instalar as substitutas necessárias.
- Rotacionar a password do administrador real e invalidar todos os refresh tokens anteriores.
- Confirmar que nenhuma credencial real existe no código, histórico ativo, logs ou ficheiros de exemplo.
- Manter produção bloqueada enquanto qualquer item acima estiver pendente.

## Railway — backend Django

- `DJANGO_SETTINGS_MODULE=config.settings.production`.
- `DATABASE_URL` e `REDIS_URL` referenciam os serviços privados corretos.
- `ALLOWED_HOSTS=api.vitaleevo.ao` (os domínios Railway são adicionados pela aplicação).
- `CORS_ALLOWED_ORIGINS=https://vitaleevo.ao,https://www.vitaleevo.ao`.
- `CSRF_TRUSTED_ORIGINS=https://api.vitaleevo.ao,https://vitaleevo.ao,https://www.vitaleevo.ao`.
- `SITE_URL=https://vitaleevo.ao`.
- SMTP Resend configurado com `smtp.resend.com:587`, utilizador `resend`, API key selada e remetente verificado.
- Bucket privado configurado com `AWS_STORAGE_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_ENDPOINT_URL` e `AWS_S3_REGION_NAME`.
- Domínio `api.vitaleevo.ao` verificado, certificado emitido e apontado ao serviço web.
- `/api/v1/health/live/` responde 200; `/api/v1/health/ready/` confirma PostgreSQL e Redis; `/api/v1/health/worker/` confirma heartbeat RQ.
- Migrações são executadas uma vez no processo de release; API e worker usam serviços separados.
- Root Directory dos serviços é `/backend`; API, worker e cron usam respetivamente `/railway.json`, `/railway.worker.json` e `/railway.cron.json` (as cópias em `/backend` suportam serviços cujo source root seja o próprio backend).

## Vercel — frontend Next.js

- `NEXT_PUBLIC_API_URL=https://api.vitaleevo.ao`.
- `NEXT_PUBLIC_SITE_URL=https://vitaleevo.ao` e `SITE_URL=https://vitaleevo.ao`.
- Produção não contém variáveis internas de PostgreSQL, Redis, Railway, Elasticsearch ou Convex.
- `RESEND_API_KEY` e todas as variáveis SMTP ficam fora da Vercel; o envio está centralizado no Django.
- Preview da branch `staging` usa `NEXT_PUBLIC_API_URL` do Railway staging, nunca a API de produção.
- Fazer redeploy controlado depois de alterar variáveis e somente após os gates aplicáveis.
- Confirmar `vitaleevo.ao` como domínio principal e redirecionamento de `www`.

## GitHub e publicação

1. Trabalhar em branch `codex/*`; não corrigir diretamente em `main`.
2. Executar lint, typecheck, build, checks Django, migrações e testes.
3. Exigir PR e checks verdes antes do merge.
4. Publicar primeiro em staging/preview integrado e executar a matriz de autenticação.
5. Fazer merge/deploy de produção somente com decisão explícita GO.

## Verificação pós-deploy

- Home, catálogo e páginas públicas carregam sem erros de console.
- Cadastro, login, refresh, logout, alteração e recuperação de password funcionam.
- Cliente não acede a rotas administrativas.
- Perfis de staff recebem apenas as capabilities autorizadas.
- Super admin abre o painel da aplicação e o Django Admin.
- Formulários de contacto, newsletter, cotações e e-mails usam dados de teste controlados.
- Logs não expõem tokens, passwords, chaves ou dados pessoais desnecessários.
- Monitorização cobre frontend, liveness/readiness, erros 5xx, fila RQ e falhas de e-mail.
