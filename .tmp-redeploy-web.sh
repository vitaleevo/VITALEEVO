#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
echo "=== quem serve agora? ==="
curl -s https://api.vitaleevo.ao/api/v1/health 2>&1 | head -c 120
echo ""
echo "=== redeploy manual do web ==="
railway redeploy -e production -s web -y 2>&1 | grep -viE "warning|config as code|migrate|existing|newer|upgrade" | head -3
