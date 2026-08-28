#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Procurar queries de log
q = {"query": 'query { __type(name: "Query") { fields { name } } }'}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
qs = [f["name"] for f in r.json()["data"]["__type"]["fields"]]
print("Log-related:", [x for x in qs if "og" in x.lower()])
