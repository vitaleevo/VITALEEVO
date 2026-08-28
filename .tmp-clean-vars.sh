#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
railway variable delete EMAIL_HOST_PASSWORD -e production -s web >/dev/null 2>&1
railway variable delete EMAIL_HOST -e production -s web >/dev/null 2>&1
railway variable delete EMAIL_USE_TLS -e production -s web >/dev/null 2>&1
railway variable delete EMAIL_PORT -e production -s web >/dev/null 2>&1
railway variable delete EMAIL_HOST_USER -e production -s web >/dev/null 2>&1
railway variable delete DEFAULT_FROM_EMAIL -e production -s web >/dev/null 2>&1
railway variable delete DJANGO_ENV -e production -s web >/dev/null 2>&1
railway variable delete RQ_ASYNC -e production -s web >/dev/null 2>&1
echo "variáveis Django antigas removidas de production/web"
