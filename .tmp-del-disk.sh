#!/bin/bash
cd ~/vitaleevo
echo "=== antes ==="
ls backend/
echo "=== apagar ficheiros Django remanescentes do disco ==="
rm -rf backend/apps backend/config backend/manage.py backend/pytest.ini backend/Dockerfile backend/railway.json backend/railway.cron.json backend/railway.worker.json backend/db.sqlite3 backend/scripts backend/staticfiles backend/media backend/*.db backend/models 2>/dev/null
find backend -name "*.db" -delete 2>/dev/null
echo "=== depois ==="
ls -R backend/ | head -30
