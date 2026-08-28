#!/usr/bin/env python3
import json, os, requests
cfg = json.load(open(os.path.expanduser("~/.railway/config.json")))
token = cfg["user"]["accessToken"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

mutation = '''
mutation ($input: ServiceInstanceUpdateInput!) {
  serviceInstanceUpdate(
    serviceId: "d48129f9-5690-4ca7-a94a-6b7a72f947dc"
    environmentId: "0a99530d-7e56-4b5a-a402-49975661e1ab"
    input: $input
  )
}
'''
payload = {
    "builder": "NIXPACKS",
    "rootDirectory": "/",
    "railwayConfigFile": "/railway.toml",
    "healthcheckPath": "/api/v1/health",
    "preDeployCommand": [],
    "buildCommand": None,
    "dockerfilePath": None,
    "startCommand": None,
}
r = requests.post("https://backboard.railway.com/graphql/v2", headers=headers,
                  json={"query": mutation, "variables": {"input": payload}})
print(r.status_code)
print(json.dumps(r.json(), indent=1)[:600])
