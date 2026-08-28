#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Descobrir campos de Deployment
q = {"query": 'query { __type(name: "Deployment") { fields { name } } }'}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
fields = [f["name"] for f in r.json()["data"]["__type"]["fields"]]
print("Deployment fields:", fields)
