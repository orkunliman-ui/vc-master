---
name: n8n

description: >
  Expert n8n automation engineer and integration architect. Use this skill for
  ANY n8n-related task: building workflows via REST API, creating custom nodes,
  designing automation pipelines, connecting Claude Code to n8n, debugging
  executions, managing credentials, webhooks, and AI agent workflows.
  Triggers include: "create a workflow", "build an automation", "n8n node",
  "connect to n8n", "trigger a workflow", "webhook n8n", "custom node",
  "n8n API", "automate this", "build a pipeline", "n8n credential".
---

# ⚡ n8n Skill — Automation Engineering from Claude Code

You are a **senior n8n automation architect**. You build production-grade
workflows via the REST API, craft custom nodes in TypeScript, and design
multi-service pipelines.

Official docs: https://docs.n8n.io
API reference: https://docs.n8n.io/api/api-reference/

---

## ⚙️ Phase 0 — Connection Setup

### Environment Configuration
```bash
export N8N_BASE_URL=http://localhost:5678
export N8N_API_KEY=your_api_key_here
export N8N_WEBHOOK_BASE=http://localhost:5678
```

### Get your API key
1. Open n8n UI
2. Settings > n8n API > Create key
3. Copy immediately — won't be shown again

### Test connection
```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_BASE_URL/api/v1/workflows?limit=5" | jq '.data[].name'
```

### Python client
```python
import os, requests

class N8NClient:
    def __init__(self):
        self.base = os.environ["N8N_BASE_URL"].rstrip("/") + "/api/v1"
        self.headers = {
            "X-N8N-API-KEY": os.environ["N8N_API_KEY"],
            "Content-Type": "application/json",
        }

    def get(self, path, params={}):
        r = requests.get(f"{self.base}{path}", headers=self.headers, params=params)
        r.raise_for_status()
        return r.json()

    def post(self, path, body={}):
        r = requests.post(f"{self.base}{path}", headers=self.headers, json=body)
        r.raise_for_status()
        return r.json()

n8n = N8NClient()
```

---

## 📋 Phase 1 — REST API Reference

Base: `{N8N_BASE_URL}/api/v1`
Auth: `X-N8N-API-KEY: {key}`

### Workflows
```python
# List
GET /workflows?limit=50&active=True

# Get single
GET /workflows/{id}

# Create
POST /workflows
body: { name, nodes[], connections{}, settings{} }

# Activate/Deactivate
POST /workflows/{id}/activate
POST /workflows/{id}/deactivate

# Delete
DELETE /workflows/{id}
```

### Executions
```python
# List
GET /executions?workflowId={id}&status=error&limit=20

# Get with data
GET /executions/{id}?includeData=true

# Retry failed
POST /executions/{id}/retry
body: { loadWorkflow: true }
```

### Credentials
```python
# Create
POST /credentials
body: {
    "name": "My Slack",
    "type": "slackApi",
    "data": { "accessToken": "xoxb-..." }
}

# Common types:
# slackApi, githubApi, notionApi, openAiApi
# httpHeaderAuth, httpBearerAuth
```

---

## 🧩 Phase 2 — Core Node Reference

### Manual Trigger
```json
{
  "type": "n8n-nodes-base.manualTrigger",
  "typeVersion": 1,
  "parameters": {}
}
```

### Schedule Trigger
```json
{
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "parameters": {
    "rule": {
      "interval": [
        { "field": "cronExpression", "expression": "0 9 * * 1-5" }
      ]
    }
  }
}
```

### Webhook Trigger
```json
{
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "parameters": {
    "httpMethod": "POST",
    "path": "my-webhook",
    "responseMode": "lastNode"
  }
}
```

### HTTP Request
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "parameters": {
    "method": "POST",
    "url": "https://api.example.com/endpoint",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "Authorization", "value": "Bearer {{ $vars.API_KEY }}" }
      ]
    },
    "sendBody": true,
    "bodyContentType": "json",
    "bodyParameters": {
      "parameters": [
        { "name": "data", "value": "={{ $json.field }}" }
      ]
    }
  }
}
```

### Set / Edit Fields
```json
{
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "parameters": {
    "mode": "manual",
    "assignments": {
      "assignments": [
        { "id": "uuid", "name": "outputField", "type": "string",
          "value": "={{ $json.inputField }}" }
      ]
    }
  }
}
```

### IF / Conditional
```json
{
  "type": "n8n-nodes-base.if",
  "typeVersion": 2.2,
  "parameters": {
    "conditions": {
      "conditions": [
        {
          "leftValue": "={{ $json.status }}",
          "rightValue": "active",
          "operator": { "type": "string", "operation": "equals" }
        }
      ],
      "combinator": "and"
    }
  }
}
```

### Code Node
```json
{
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "parameters": {
    "mode": "runOnceForAllItems",
    "jsCode": "const items = $input.all();\nreturn items.map(item => ({ json: { ...item.json, processed: true } }));"
  }
}
```

---

## 🐍 Phase 3 — Workflow Builder

```python
import uuid

def node_id(): return str(uuid.uuid4())

class WorkflowBuilder:
    def __init__(self, name):
        self.name = name
        self.nodes = []
        self.connections = {}
        self._last = None

    def add_node(self, node, connect_from="auto"):
        self.nodes.append(node)
        src = connect_from if connect_from != "auto" else self._last
        if src and connect_from != None:
            self.connect(src, node["name"])
        self._last = node["name"]
        return self

    def connect(self, from_node, to_node, branch=0):
        if from_node not in self.connections:
            self.connections[from_node] = {"main": []}
        while len(self.connections[from_node]["main"]) <= branch:
            self.connections[from_node]["main"].append([])
        self.connections[from_node]["main"][branch].append(
            {"node": to_node, "type": "main", "index": 0}
        )
        return self

    def build(self):
        return {
            "name": self.name,
            "nodes": self.nodes,
            "connections": self.connections,
            "settings": {"executionOrder": "v1"}
        }

    def deploy(self, activate=False):
        wf = n8n.post("/workflows", self.build())
        if activate:
            n8n.post(f"/workflows/{wf['id']}/activate")
        print(f"✅ Deployed: {wf['name']} (id={wf['id']})")
        return wf
```

---

## 🤖 Phase 4 — Claude + n8n Patterns

### Claude triggers n8n webhook
```python
import requests

def trigger_n8n(webhook_path, payload):
    url = f"{os.environ['N8N_WEBHOOK_BASE']}/webhook/{webhook_path}"
    return requests.post(url, json=payload, timeout=30).json()

# Usage
result = trigger_n8n("process-new-user", {"userId": "123", "email": "test@example.com"})
```

### n8n calls Claude API
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.anthropic.com/v1/messages",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "x-api-key", "value": "={{ $vars.ANTHROPIC_API_KEY }}" },
        { "name": "anthropic-version", "value": "2023-06-01" }
      ]
    },
    "sendBody": true,
    "bodyContentType": "json",
    "bodyParameters": {
      "parameters": [
        { "name": "model", "value": "claude-haiku-4-5-20251001" },
        { "name": "max_tokens", "value": "1024" },
        { "name": "messages", "value": "={{ [{\"role\": \"user\", \"content\": $json.userMessage}] }}" }
      ]
    }
  }
}
```

---

## 🐛 Phase 5 — Debugging

### Common errors

```
"Webhook path already exists"
→ Change path or deactivate conflicting workflow

"Credentials not found"
→ Create credential first via POST /credentials

Connection not working
→ Connection keys must be node "name", not ID
→ "main" array index = output branch (0=true, 1=false for IF)

Expression returning undefined
→ Use $json.body.field for webhook payloads
```

### Debug script
```python
def debug_workflow(workflow_id, last_n=5):
    execs = n8n.get("/executions", {
        "workflowId": workflow_id,
        "limit": last_n
    })
    for e in execs["data"]:
        icon = {"success": "✅", "error": "❌"}.get(e["status"], "❓")
        print(f"{icon} {e['id']} | {e['status']} | {e['startedAt']}")
```

---

## 📚 Built-in Expressions

```javascript
$json.fieldName          // current item field
$input.first().json      // first item from previous node
$input.all()             // all items
$workflow.id             // workflow ID
$execution.id            // execution ID
$now                     // current DateTime
$if(condition, val1, val2)
```

---

*Always test in staging before production. Use /deactivate to pause workflows.*
