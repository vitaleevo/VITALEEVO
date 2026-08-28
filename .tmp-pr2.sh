#!/bin/bash
set -e
cd ~/vitaleevo
cat > /tmp/pr2-body.md <<'EOF'
## Resumo

Substitui o backend Django por um **FastAPI** simples e rápido (padrão vitafarmacia):

- `backend/app/main.py` — FastAPI + lifespan (create_all + seed idempotente)
- `app/core` — config pydantic-settings + JWT access/refresh (pyjwt) + bcrypt
- `app/db` — SQLAlchemy 2.0 async (Postgres e SQLite) + seed de catálogo
- `app/api/routes` — auth, catalog (products/categories/brands), cms (site_config/contacts/newsletter), content (blog/portfolio), quotes, commerce (cart/wishlist/orders/addresses/notifications), misc (dashboard/analytics/media/audit/users)
- `railway.toml` — Nixpacks + uvicorn (2 workers), healthcheck `/api/v1/health`
- `tests/test_flow.py` — 15 testes (login, trailing slash, catálogo, cotações, analytics, contactos)
- CI atualizado: pytest da API nova

## Break

- Backend Django removido (apps/config/manage.py/Dockerfile/migrações)
- Produção: serviço web redeploya como Nixpacks+uvicorn; variáveis `FIRST_ADMIN_EMAIL/PASSWORD`, `CORS_ORIGINS` seladas no Railway
- Base de dados: schema novo criado por create_all + seed (tabelas antigas Django ficam inertes)
- `EMAIL_HOST_*`, `AWS_*`, `RQ_ASYNC` antigos removidos da produção

## Notas

- E-mails reais (Resend) por implementar; password-reset devolve mensagem genérica em dev
- Upload em `/media` local (S3 por adicionar)
- Frontend: contrato `/api/v1/*` mantido (trailing slash normalizado por middleware)
EOF

gh pr create --base main --head codex/cicd-railway-vercel \
  --title "feat: backend FastAPI (padrao vitafarmacia) - remove Django" \
  --body-file /tmp/pr2-body.md 2>&1
