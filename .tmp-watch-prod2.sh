#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
echo "=== deploy production/web (FastAPI) ==="
for i in 1 2 3 4 5 6 7 8 9 10; do
  sleep 30
  echo "--- poll $i $(date +%H:%M:%S) ---"
  railway deployment list -e production -s web 2>&1 | grep -vE "warning|Config as Code|migrate|existing|Newer|upgrade" | head -3
  ST=$(railway deployment list -e production -s web 2>&1 | grep -vE "warning|Config|Newer|upgrade" | sed -n '2p')
  echo "$ST" | grep -q SUCCESS && break
  echo "$ST" | grep -qi FAIL && break
done
