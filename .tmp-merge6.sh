#!/bin/bash
cd ~/vitaleevo
gh pr merge 6 --admin --merge --subject "feat: backend FastAPI (padrao vitafarmacia) - remove Django (#6)" 2>&1 | head -5
echo "---"
gh pr view 6 --json state,mergedAt -q '.state + " merged at " + .mergedAt' 2>&1
