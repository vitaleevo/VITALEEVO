#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
railway redeploy -e production -s web -y 2>&1 | head -20
echo "EXIT: $?"
sleep 20
railway deployment list -e production -s web 2>&1 | grep -vE "warning|Config|Newer|upgrade" | head -4
