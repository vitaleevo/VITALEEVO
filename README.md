# VitalEvo

Plataforma institucional, loja e painel administrativo da VitalEvo, construída com Next.js, React e Convex.

## Desenvolvimento

1. Copie .env.local.example para .env.local e preencha as variáveis da aplicação.
2. Configure o ambiente de desenvolvimento do Convex.
3. Execute:

    npm install
    npx convex dev
    npm run dev

## Validação

    npm run typecheck
    npm run lint
    npm run build:app

O comando npm run build também executa npx convex deploy. Use-o somente quando a implantação do Convex tiver sido deliberadamente autorizada.

## Configuração de produção

As variáveis usadas pelo Next.js ficam no provedor da aplicação. As variáveis usadas pelas actions do Convex devem ser configuradas no ambiente do Convex:

- RESEND_API_KEY
- EMAIL_FROM
- SITE_URL
- VITALEEVO_API_KEYS_ENCRYPTION_KEY

Gere a chave de cifragem uma única vez e guarde-a num cofre de segredos:

    openssl rand -hex 32

Depois de configurar VITALEEVO_API_KEYS_ENCRYPTION_KEY, aceda ao painel /admin/ai e execute a migração das chaves antigas. Não rode essa migração antes de configurar a variável, pois as chaves não poderão ser usadas sem ela.

Consulte PRODUCTION_CHECKLIST.md antes de publicar.
