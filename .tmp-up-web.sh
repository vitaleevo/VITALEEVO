#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
railway deployment up -e production -s web -y 2>&1 | grep -viE "warning|config as code|migrate|existing|newer|upgrade" | head -6
echo ""
echo "=== watch ==="
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  sleep 30
  echo "--- poll $i $(date +%H:%M:%S) ---"
  railway deployment list -e production -s web 2>&1 | grep -vE "warning|Config|Newer|upgrade" | head -3
  ST=$(railway deployment list -e production -s web 2>&1 | grep -vE "warning|Config|Newer|upgrade" | sed -n '2p')
  echo "$ST" | grep -q SUCCESS && break
  echo "$ST" | grep -qi FAIL && break
done
