#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
headers = {"Authorization": "Bearer " + cfg["user"]["accessToken"], "Content-Type": "application/json"}
q = {"query": '''
query {
  buildLogs(deploymentId: "3758692b-8fc3-4792-bda5-e71c8ef42b07") {
    message severity timestamp
  }
}
'''}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
data = r.json()
if "errors" in data:
    print("ERRO:", json.dumps(data["errors"])[:400])
else:
    logs = data.get("data", {}).get("buildLogs", [])
    for n in logs[-30:]:
        print(f'[{n.get("severity")}] {str(n.get("message"))[:200]}')
