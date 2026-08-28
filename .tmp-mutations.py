#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
q = {"query": 'query { __type(name: "Mutation") { fields { name } } }'}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
mutations = [f["name"] for f in r.json()["data"]["__type"]["fields"]]
print("Mutations com service/config/build:", [m for m in mutations if any(k in m.lower() for k in ("service", "config", "build", "deploy"))])
