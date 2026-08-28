#!/bin/bash
set -e
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
K=$(cat /mnt/c/Users/alexa/AppData/Local/Temp/opencode/key-production-2.txt)
printf '%s' "$K" | railway variable set EMAIL_HOST_PASSWORD --stdin -e production -s web >/dev/null
echo "producao/web: EMAIL_HOST_PASSWORD rotacionada (redeploy automatico)"
for i in 1 2 3 4 5; do
  sleep 25
  ST=$(railway deployment list -e production -s web 2>&1 | grep -vE "warning|Config|Newer|upgrade" | sed -n '2p')
  echo "poll $i: $ST"
  echo "$ST" | grep -q SUCCESS && break
done
