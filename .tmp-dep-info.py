#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
q = {"query": '''
query {
  deployment(id: "6317996f-a566-47e6-85fe-0fbc7d428a67") {
    id status
    buildLogs
    failureReason
  }
}
'''}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
print(r.status_code)
print(json.dumps(r.json(), indent=1)[:3000])
