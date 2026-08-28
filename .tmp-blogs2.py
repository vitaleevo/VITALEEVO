#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# tipos de BuildLogsInput e BuildLogs
for tname in ("BuildLogsInput", "BuildLogsConnection", "BuildLogsEdge", "BuildLog", "Log"):
    q = {"query": f'query {{ __type(name: "{tname}") {{ kind fields {{ name }} inputFields {{ name }} }} }}'}
    r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
    t = r.json().get("data", {}).get("__type")
    if t:
        print(f"=== {tname} kind={t.get('kind')}")
        print("  fields:", [f["name"] for f in (t.get("fields") or [])])
        print("  inputs:", [f["name"] for f in (t.get("inputFields") or [])])
