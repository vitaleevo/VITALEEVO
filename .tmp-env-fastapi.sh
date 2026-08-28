#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
echo "=== Definindo variáveis FastAPI em production/web ==="
railway variable set CORS_ORIGINS="https://vitaleevo.ao,https://www.vitaleevo.ao,https://vitaleevo-git-staging-vitaleevos-projects.vercel.app" -e production -s web 2>&1 | grep -viE "warning|config as code|migrate|existing|newer|upgrade" | head -1
railway variable set FIRST_ADMIN_EMAIL="admin@vitaleevo.ao" -e production -s web 2>&1 | grep -viE "warning|config as code|migrate|existing|newer|upgrade" | head -1
# Password selada: gerar, definir via stdin, guardar no GitHub secret
ADMIN_PW="Ve3A!$(openssl rand -hex 8)"
printf '%s' "$ADMIN_PW" | railway variable set FIRST_ADMIN_PASSWORD --stdin -e production -s web 2>&1 | grep -viE "warning|config as code|migrate|existing|newer|upgrade" | head -1
printf '%s' "$ADMIN_PW" | gh secret set ADMIN_FIRST_PASSWORD --env production --body - 2>&1 | head -1
echo "ADMIN_FIRST_PASSWORD selada no GitHub (production). Não exibida."
