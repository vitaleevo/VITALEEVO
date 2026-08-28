#!/bin/bash
set -e
cd ~/vitaleevo
rm -f backend/test.db backend/vitaleevo.db 2>/dev/null
git add -A backend/
git add railway.toml requirements.txt .github/workflows/ci.yml
git status --short | grep -cE "^D " || true
git commit -m "feat: backend FastAPI substituindo Django (padrao vitafarmacia)

- Remove o backend Django completo (apps/config/manage.py/Dockerfile/migracoes)
- Novo FastAPI + SQLAlchemy async + JWT access/refresh + seed idempotente
- Rotas: auth (login/register/refresh/me/password), catalog (products/categories/brands),
  cms (site_config/contacts/newsletter), content (blog/portfolio),
  quotes (public + manage), commerce (cart/wishlist/orders/addresses/notifications),
  dashboard/analytics/media/audit/users admin
- railway.toml NIXPACKS uvicorn (padrao vitafarmacia) + healthcheck adaptado
- CI: pytest da API nova (15 testes verdes)"
