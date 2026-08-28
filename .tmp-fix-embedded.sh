#!/bin/bash
set -e
cd ~/vitaleevo
echo "=== o que é vitafarmacia/ ==="
ls -la vitafarmacia/ 2>/dev/null | head -5
git rm -r --cached vitafarmacia 2>&1 | tail -1
rm -rf vitafarmacia 2>/dev/null
echo "=== estado ==="
git status --short | grep -vE "public|\.tmp" | head -10
