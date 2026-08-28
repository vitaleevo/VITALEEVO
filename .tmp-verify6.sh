#!/bin/bash
export PATH="$HOME/.railway/bin:$PATH"
cd ~/vitaleevo
railway service list -e staging 2>&1 | grep -vE "warning|Config as Code|migrate|existing|Newer|upgrade" | grep -E "^[A-Za-z]|^[a-z]" | head -10
echo "=== PR 6 checks ==="
sleep 30
gh pr checks 6 2>&1 | grep -cE "\bfail\b" || echo "0 failures"
gh pr checks 6 2>&1 | grep -E "Backend — |Frontend — " | head -6
