#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
echo "=== health com slash ==="
curl -s https://api.vitaleevo.ao/api/v1/health/ 2>&1 | head -c 150
echo ""
echo "=== v1 sem slash /api/v1 ==="
curl -s -o /dev/null -w "%{http_code}" https://api.vitaleevo.ao/api/v1
echo ""
echo "=== redeploy ==="
railway redeploy -e production -s web -y 2>&1 | grep -viE "warning|config as code|migrate|existing|newer|upgrade" | head -5
