#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
q = {"query": 'query { __type(name: "Mutation") { fields { name args { name type { kind ofType { name } } } } } }'}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
for f in r.json()["data"]["__type"]["fields"]:
    if f["name"] in ("serviceInstanceUpdate", "serviceUpdate", "serviceInstanceDeployV2"):
        args = []
        for a in f["args"]:
            t = a.get("type") or {}
            kind = t.get("kind")
            inner = (t.get("ofType") or {}).get("name")
            args.append(f'{a["name"]}:{kind}({inner})')
        print(f["name"], "->", args)
