#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
echo "=== apagando serviços staging legados ==="
for svc in api worker analytics-cleanup; do
  echo "--- $svc ---"
  railway service delete -s "$svc" -e staging -y 2>&1 | grep -viE "warning|config as code|migrate|existing|newer|upgrade" | head -2
done
echo "=== staging restante ==="
railway service list -e staging 2>&1 | grep -vE "warning|Config as Code|migrate|existing|Newer|upgrade" | head -12
