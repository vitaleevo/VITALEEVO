#!/bin/bash
set -e
cd ~/vitaleevo
# Verifica se existe PR aberto da branch
EXISTS=$(gh pr view 5 --json state -q .state 2>/dev/null || echo "closed/None")
echo "PR 5 estado: $EXISTS"
