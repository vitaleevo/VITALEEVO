#!/bin/bash
set -e
cd ~/vitaleevo
git add -A .
git commit -m "chore: remover clone vitafarmacia do repo" 2>&1 | tail -1
git push origin codex/cicd-railway-vercel 2>&1 | tail -1
echo "=== branch main diff ==="
git log --oneline origin/main..codex/cicd-railway-vercel 2>/dev/null | head -5 || git log --oneline main..codex/cicd-railway-vercel 2>/dev/null | head -5
