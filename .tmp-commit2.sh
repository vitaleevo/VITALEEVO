#!/bin/bash
set -e
cd ~/vitaleevo
rm -rf backend/app/__pycache__ backend/app/api/__pycache__ backend/app/api/routes/__pycache__ backend/app/core/__pycache__ backend/app/db/__pycache__ backend/app/models/__pycache__ backend/app/schemas/__pycache__ backend/tests/__pycache__ 2>/dev/null
git add -A .
git commit -m "chore: remover ficheiros Django do disco (backend FastAPI puro)" 2>&1 | tail -2
git push origin codex/cicd-railway-vercel 2>&1 | tail -1
