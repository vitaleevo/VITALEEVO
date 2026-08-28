#!/bin/bash
cd ~/vitaleevo
for i in 1 2 3 4 5 6 7 8; do
  sleep 30
  echo "--- poll $i $(date +%H:%M) ---"
  gh pr checks 6 2>&1 | head -8
  STATE=$(gh pr view 6 --json state,mergeStateStatus -q '.state + "/" + .mergeStateStatus' 2>&1)
  echo "estado: $STATE"
  FAILS=$(gh pr checks 6 2>&1 | grep -c fail || true)
  if [ "$FAILS" = "0" ] && echo "$STATE" | grep -qE "OPEN/(CLEAN|UNSTABLE)"; then
    echo "A USAR COM CUIDADO . Todos ok"
    break
  fi
done
