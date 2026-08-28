#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
railway logs 6317996f-a566-47e6-85fe-0fbc7d428a67 -e production -s web 2>&1 | grep -vE "warning|Config as Code|migrate|existing|Newer|upgrade" | tail -40
