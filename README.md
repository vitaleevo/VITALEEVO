# VitalEvo

Plataforma institucional, loja e painel administrativo da VitalEvo. O frontend usa Next.js/React na Vercel e o backend usa Django/DRF no Railway, com PostgreSQL, Redis e tarefas RQ.

## Desenvolvimento local

1. Copie `.env.local.example` para `.env.local`.
2. Copie `backend/.env.example` para `backend/.env`.
3. Instale as dependências e inicie os dois serviços:

```bash
npm install
python -m venv .venv
.venv/bin/pip install -r backend/requirements.txt

# terminal 1 — frontend
npm run dev

# terminal 2 — backend
cd backend
../.venv/bin/python manage.py migrate
../.venv/bin/python manage.py runserver 8100
```

## Validação

```bash
npm run lint
npm run typecheck
npm run build:app

cd backend
../.venv/bin/python -m pip check
../.venv/bin/python manage.py check
../.venv/bin/python manage.py makemigrations --check --dry-run
../.venv/bin/python -m pytest
```

## Produção

- Frontend: `https://vitaleevo.ao` na Vercel.
- API: `https://api.vitaleevo.ao/api/v1` no Railway.
- Django Admin técnico: `https://api.vitaleevo.ao/admin/`.
- Painel administrativo da aplicação: `https://vitaleevo.ao/admin`.

O frontend de produção exige `NEXT_PUBLIC_API_URL=https://api.vitaleevo.ao` e `NEXT_PUBLIC_SITE_URL=https://vitaleevo.ao`. O backend exige as variáveis documentadas em `backend/.env.example`; em produção, SMTP, PostgreSQL, Redis e uma `SECRET_KEY` forte são obrigatórios.

O Convex pertence à arquitetura legada e não faz parte do fluxo atual de build ou deploy. Não execute `npx convex deploy` para publicar esta versão.

Antes de qualquer publicação, siga `PRODUCTION_CHECKLIST.md` e confirme o estado em `PROJECT_MEMORY.md`.
