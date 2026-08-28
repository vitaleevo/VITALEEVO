#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Campos de Service relacionados com build
q = {"query": 'query { __type(name: "Service") { fields { name } } }'}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
fields = [f["name"] for f in r.json()["data"]["__type"]["fields"]]
build_fields = [f for f in fields if any(k in f.lower() for k in ("build", "source", "config", "root", "repo", "service"))]
print("Service build-related:", build_fields)
