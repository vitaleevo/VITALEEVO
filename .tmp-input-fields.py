#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
for tname in ("ServiceInstanceUpdateInput", "ServiceUpdateInput"):
    q = {"query": f'query {{ __type(name: "{tname}") {{ inputFields {{ name type {{ kind name ofType {{ kind name }} }} }} }} }}'}
    r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
    data = r.json().get("data", {}).get("__type")
    if data:
        print(f"=== {tname} ===")
        for fld in data["inputFields"]:
            t = fld["type"]
            kind = t.get("kind")
            inner = (t.get("ofType") or {}).get("name") or (t.get("name"))
            print(f'  {fld["name"]}: {kind}({inner})')
