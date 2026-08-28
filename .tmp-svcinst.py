#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Raiz do serviço: ver a configuração do ServiceInstance (build/rootDir) no ambiente production
q = {"query": '''
query {
  environment(id: "0a99530d-7e56-4b5a-a402-49975661e1ab") {
    serviceInstances { edges { node { id serviceId } } }
  }
}
'''}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers, json=q)
print(json.dumps(r.json(), indent=1)[:600])
