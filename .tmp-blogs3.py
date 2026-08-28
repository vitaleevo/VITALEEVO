#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
headers = {"Authorization": "Bearer " + cfg["user"]["accessToken"], "Content-Type": "application/json"}
q = {"query": 'query { __type(name: "Query") { fields { name args { name type { kind name } } } } }'}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
for f in r.json()["data"]["__type"]["fields"]:
    if f["name"] == "buildLogs":
        print(json.dumps(f["args"], indent=1))
