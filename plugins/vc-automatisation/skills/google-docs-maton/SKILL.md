---
name: google-docs-maton

description: >
  Call the Google Docs REST API through Maton's managed OAuth gateway.
  Use this skill when you need to create, read, or edit Google Docs
  programmatically. Triggers include: "create a Google Doc", "edit Google Doc",
  "read from Google Docs", "Google Docs API", "Maton gateway", "batch update
  Google Doc", "insert text in doc", "replace text in doc".
---

# 📄 Google Docs (Maton Gateway)

Call the Google Docs REST API through Maton's managed OAuth gateway.
You send HTTPS requests to `https://gateway.maton.ai/google-docs/...`;
Maton injects the Google token and forwards to docs.googleapis.com.

---

## ⚙️ Prerequisites

### 1. Maton API key
```bash
export MATON_API_KEY="YOUR_KEY_FROM_maton.ai/settings"
```

All requests include `Authorization: Bearer $MATON_API_KEY`.

### 2. Google OAuth connection

Manage at https://ctrl.maton.ai

**List connections:**
```bash
curl -H "Authorization: Bearer $MATON_API_KEY" \
  "https://ctrl.maton.ai/connections?app=google-docs&status=ACTIVE"
```

**Create connection:**
```bash
curl -X POST -H "Authorization: Bearer $MATON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"app": "google-docs"}' \
  "https://ctrl.maton.ai/connections"
# Returns URL — open in browser to finish OAuth
```

---

## 🌐 Base URL & Routing

```
https://gateway.maton.ai/google-docs/{native-google-docs-path}
```

Examples:
- `GET /google-docs/v1/documents/{documentId}`
- `POST /google-docs/v1/documents/{documentId}:batchUpdate`

Always include:
```
Authorization: Bearer $MATON_API_KEY
Content-Type: application/json  # for POST
Maton-Connection: <id>          # optional if multiple connections
```

---

## 📋 Common Operations

### Get document
```bash
curl -H "Authorization: Bearer $MATON_API_KEY" \
  "https://gateway.maton.ai/google-docs/v1/documents/$DOC_ID"
```

### Create document
```bash
curl -X POST -H "Authorization: Bearer $MATON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Document"}' \
  "https://gateway.maton.ai/google-docs/v1/documents"
```

### Batch update (insert text)
```bash
curl -X POST -H "Authorization: Bearer $MATON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [{
      "insertText": {
        "location": {"index": 1},
        "text": "Hello!"
      }
    }]
  }' \
  "https://gateway.maton.ai/google-docs/v1/documents/$DOC_ID:batchUpdate"
```

---

## 📝 Batch Request Payloads

| Action | JSON snippet |
|--------|--------------|
| Delete range | `{"deleteContentRange": {"range": {"startIndex": 1, "endIndex": 10}}}` |
| Replace all text | `{"replaceAllText": {"containsText": {"text": "{{placeholder}}", "matchCase": true}, "replaceText": "actual"}}` |
| Insert table | `{"insertTable": {"location": {"index": 1}, "rows": 3, "columns": 3}}` |
| Update text style | `{"updateTextStyle": {"range": {"startIndex": 1, "endIndex": 10}, "textStyle": {"bold": true}, "fields": "bold"}}` |
| Insert page break | `{"insertPageBreak": {"location": {"index": 1}}}` |

---

## 🐍 Python SDK

```python
import os, requests

def create_doc(title):
    return requests.post(
        'https://gateway.maton.ai/google-docs/v1/documents',
        headers={'Authorization': f'Bearer {os.environ["MATON_API_KEY"]}'},
        json={'title': title}
    ).json()

def insert_text(doc_id, text, index=1):
    return requests.post(
        f'https://gateway.maton.ai/google-docs/v1/documents/{doc_id}:batchUpdate',
        headers={'Authorization': f'Bearer {os.environ["MATON_API_KEY"]}'},
        json={
            'requests': [{
                'insertText': {
                    'location': {'index': index},
                    'text': text
                }
            }]
        }
    ).json()

def get_doc(doc_id):
    return requests.get(
        f'https://gateway.maton.ai/google-docs/v1/documents/{doc_id}',
        headers={'Authorization': f'Bearer {os.environ["MATON_API_KEY"]}'}
    ).json()
```

---

## 🐛 Error Handling

| HTTP | Meaning |
|------|---------|
| 400 | No Google Docs connection linked |
| 401 | Invalid/missing MATON_API_KEY |
| 429 | Rate limit (10 req/sec/account) |
| 4xx/5xx | Pass-through from Google Docs API |

**Troubleshooting:**
- Verify key: `curl https://ctrl.maton.ai/connections`
- Docs indices are 1-based
- Fetch document first to inspect content ranges
- Batch requests are atomic (all succeed or none)

---

## ⚠️ Notes

- All traffic goes through gateway.maton.ai — review their privacy policy
- Use `endOfSegmentLocation` to append to end
- Field masks use comma-separated syntax: `"fields": "bold,fontSize"`
- Rotate API key if leaked; revoke unused Google connections

---

*Maton is a third-party proxy. Document contents transit their servers.*
