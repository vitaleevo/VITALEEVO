#!/bin/bash
curl -s -X POST https://api.vitaleevo.ao/api/v1/auth/password-reset/ \
  -H "Content-Type: application/json" \
  -H "Origin: https://vitaleevo.ao" \
  -d '{"email":"admin@vitaleevo.ao"}' 2>&1 | head -c 150
