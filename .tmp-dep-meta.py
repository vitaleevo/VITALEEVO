#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Tenta ver deployment build logs via deployment.meta
q = {"query": '''
query {
  deployment(id: "5e0c81b8-3a01-4d3c-895d-c54fe3f3a5bf") {
    id status meta
  }
}
'''}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
print(json.dumps(r.json(), indent=1)[:1500])
