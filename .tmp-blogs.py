#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# assinatura de buildLogs
q = {"query": 'query { __type(name: "Query") { fields { name args { name } } } }'}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
for f in r.json()["data"]["__type"]["fields"]:
    if f["name"] == "buildLogs":
        print("buildLogs args:", [a["name"] for a in f["args"]])

q2 = {"query": 'query { buildLogs(input: {}) { isCompleted } }'}
r2 = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q2)
print(r2.text[:400])
