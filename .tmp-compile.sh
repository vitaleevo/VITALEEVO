#!/bin/bash
cd ~/vitaleevo/backend
/tmp/venv-fastapi/bin/python -m compileall -q app/ 2>&1 | head -20
echo "exit: $?"
echo "=== quotes.py valida ==="
head -20 app/api/routes/quotes.py
