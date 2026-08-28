#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
railway logs -d -e production -s web 2>&1 | grep -vE "warning|Config as Code|migrate|existing|Newer|upgrade" | tail -50
