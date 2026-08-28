#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
for svc in api worker analytics-cleanup Elasticsearch Kibana; do
  echo "--- apagando $svc (produção) ---"
  railway service delete -s "$svc" -e production -y 2>&1 | grep -viE "warning|config as code|migrate|existing files|newer|upgrade" | head -2
done
echo "=== serviços restantes em produção ==="
railway service list -e production 2>&1 | grep -vE "warning|Config as Code|migrate|existing files|Newer|upgrade" | head -25
