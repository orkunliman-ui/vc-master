---
name: security

description: >
  Full-stack security auditor for web applications. Use this skill whenever
  the user wants to analyze, audit, harden, or scan their website or web app
  for vulnerabilities. Triggers include: "check my site for vulnerabilities",
  "security audit", "find security issues", "harden my app", "scan for XSS /
  SQL injection / CSRF", "check my headers", "pentest my site", "is my site
  secure", "check my dependencies for CVEs", or any mention of OWASP,
  security misconfigurations, exposed secrets, or authentication weaknesses.
  Always use this skill when security is the primary concern — even if the
  user only asks a single security question, consult this skill first.
---

# 🔐 Security Audit Skill

A comprehensive, multi-layered security analysis skill for web applications.
Claude will act as a senior penetration tester and security engineer, running
structured checks across every attack surface: network, HTTP, code, deps,
auth, infrastructure, and more.

---

## 🧭 How to Use This Skill

1. **Gather context** — ask the user for their stack, URL (if live), and codebase access
2. **Run the audit pipeline** — execute each phase in order (or in parallel where possible)
3. **Score and prioritize findings** — use CVSS-style severity (Critical / High / Medium / Low / Info)
4. **Deliver the report** — structured markdown with remediation steps per finding
5. **Offer a remediation pass** — optionally fix issues directly in the code

---

## 🔍 Phase 1 — Reconnaissance & Asset Mapping

Before testing, map the full attack surface.

### Tools to use
```bash
# DNS enumeration
dig +short <domain> ANY
nslookup -type=ANY <domain>
host -a <domain>

# Subdomain discovery
subfinder -d <domain> -silent
amass enum -passive -d <domain>
# Fallback: check crt.sh for certificate transparency logs
curl -s "https://crt.sh/?q=%25.<domain>&output=json" | jq '.[].name_value' | sort -u

# Port scanning
nmap -sV -sC -p- --min-rate 5000 <ip_or_domain>
nmap -sU -top-ports 200 <ip_or_domain>  # UDP scan

# Technology fingerprinting
whatweb <url>
curl -sI <url>  # grab raw headers
```

### What to look for
- Exposed subdomains (admin., api., staging., dev., test., beta.)
- Open ports beyond 80/443 (databases, Redis, Elasticsearch exposed publicly)
- Server version disclosure in headers (Apache/2.4.1, PHP/7.2.x)
- Technology stack fingerprint → map known CVEs per version
- DNS misconfigurations (dangling CNAME, zone transfer enabled)

---

## 🌐 Phase 2 — HTTP Security Headers Audit

Missing or misconfigured headers are a top source of vulnerabilities.

### Run the check
```bash
curl -sI https://<domain> | grep -Ei \
  "strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy|cross-origin|cache-control"
```

### Headers checklist

| Header | Required Value | Risk if missing |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | SSL stripping, MitM |
| `Content-Security-Policy` | Restrictive policy | XSS, data injection |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Data leakage |
| `Permissions-Policy` | Restrict camera/mic/geo | Feature abuse |
| `Cross-Origin-Opener-Policy` | `same-origin` | XS-Leaks |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Spectre attacks |
| `Cache-Control` | `no-store` on sensitive pages | Credential caching |

### Flag
- Missing CSP → **High**
- Missing HSTS → **High**
- Missing X-Frame-Options → **Medium**
- Server version in headers → **Medium**
- `X-Powered-By` header exposed → **Low**

---

## 🔒 Phase 3 — TLS / SSL Configuration

```bash
# Full TLS scan
testssl.sh --full <domain>

# Quick check with nmap
nmap --script ssl-enum-ciphers -p 443 <domain>

# Certificate check
openssl s_client -connect <domain>:443 -showcerts </dev/null 2>/dev/null | \
  openssl x509 -noout -dates -subject -issuer
```

### What to flag
- TLS 1.0 or 1.1 enabled → **High** (POODLE, BEAST)
- SSLv3 enabled → **Critical**
- Weak ciphers (RC4, 3DES, NULL, EXPORT) → **High**
- Certificate expired or self-signed in production → **Critical**
- Certificate not covering all subdomains → **Medium**

---

## 💉 Phase 4 — Injection Vulnerabilities

### SQL Injection
```bash
# Automated scan with sqlmap
sqlmap -u "https://<domain>/page?id=1" --batch --level=3 --risk=2 \
  --dbs --random-agent

# With POST data
sqlmap -u "https://<domain>/login" --data="user=admin&pass=test" \
  --batch --level=3
```

**Manual payloads to test in every input field:**
```
'
''
' OR '1'='1
' OR '1'='1'--
' OR 1=1--
1' ORDER BY 1--
1' UNION SELECT null--
```

### XSS (Cross-Site Scripting)
```bash
# Automated
dalfox url "https://<domain>/search?q=test" --silence
```

**Manual payloads:**
```html
<script>alert(1)</script>
<img src=x onerror=alert(1)>
"><script>alert(document.cookie)</script>
javascript:alert(1)
<svg onload=alert(1)>
{{7*7}}        <!-- template injection probe -->
```

---

## 🔐 Phase 5 — Authentication & Session Security

### Checklist
- **No rate limiting on login** → brute-force possible → **High**
- **Username enumeration** via different error messages → **Medium**
- **Weak session tokens** (short, sequential, guessable) → **High**
- **Session not invalidated on logout** → **High**
- **JWT with `alg: none`** → **Critical**
- **No MFA on admin accounts** → **High**

### CSRF Check
```bash
# Look for CSRF token in forms
curl -s <url> | grep -i "csrf\|_token\|authenticity_token"
```

---

## 📦 Phase 6 — Dependency & CVE Scanning

### JavaScript / Node.js
```bash
npm audit --json | jq '.vulnerabilities'
npx snyk test
```

### Python
```bash
pip-audit --json
safety check --full-report
bandit -r . -f json -o bandit-report.json
```

### Docker images
```bash
trivy image <image_name>
grype <image_name>
```

**Flag all Critical and High CVEs immediately.**

---

## 🗂️ Phase 7 — Source Code Static Analysis (SAST)

```bash
# Universal — Semgrep (best multi-language SAST)
semgrep --config=auto .
semgrep --config "p/owasp-top-ten" .
semgrep --config "p/secrets" .
```

### Patterns to look for manually
```bash
# Hardcoded secrets
grep -rn "password\s*=\s*['\"]" . --include="*.js" --include="*.py"
grep -rn "api_key\s*=\s*['\"]" .
grep -rn "AWS_SECRET\|PRIVATE_KEY\|BEGIN RSA" .

# Dangerous functions
grep -rn "eval(" .
grep -rn "exec(" .
grep -rn "dangerouslySetInnerHTML" .  # React XSS
```

---

## 🔑 Phase 8 — Secrets & Credentials Scanning

```bash
# Trufflehog — best for git history
trufflehog git file://. --json

# Gitleaks
gitleaks detect --source . --verbose

# Check exposed files
for f in .env .env.local .env.production config.php wp-config.php \
          database.yml secrets.yml id_rsa .htpasswd; do
  curl -so /dev/null -w "%{http_code} $f\n" https://<domain>/$f
done
```

### .git Exposure Check
```bash
curl -s https://<domain>/.git/HEAD
# If returns "ref: refs/heads/main" → CRITICAL
```

---

## 📊 Severity Scoring

| Severity | CVSS | Action |
|---|---|---|
| 🔴 **Critical** | 9.0–10.0 | Fix immediately, notify stakeholders |
| 🟠 **High** | 7.0–8.9 | Fix within 24–48h |
| 🟡 **Medium** | 4.0–6.9 | Fix within 1 sprint |
| 🔵 **Low** | 1.0–3.9 | Fix in next release |
| ⚪ **Info** | 0.0 | Best practice improvement |

---

## 📝 Output Report Format

For every finding, output a block like this:
```
### [SEVERITY] Finding Title
**Category**: OWASP A0X / CWE-XXX
**Affected**: URL, file, or component
**CVSS Score**: X.X
**Description**: What the vulnerability is and why it's dangerous.
**Evidence**: Request/response proof or curl command
**Impact**: What an attacker could do if exploited.
**Remediation**:
  1. Step-by-step fix
  2. Code example if applicable
**References**: CVE/CWE/OWASP links
```

---

## 📚 Reference Tools Summary

| Tool | Purpose | Install |
|---|---|---|
| `sqlmap` | SQL injection | `pip install sqlmap` |
| `testssl.sh` | TLS/SSL audit | `brew install testssl` |
| `semgrep` | SAST | `pip install semgrep` |
| `trufflehog` | Secret scanning | `brew install trufflehog` |
| `gitleaks` | Git secret scan | `brew install gitleaks` |
| `trivy` | Container CVE scan | `brew install trivy` |
| `nmap` | Port/service scan | `brew install nmap` |
| `nuclei` | Vuln templates | `go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest` |

---

*Always get written authorization before testing any system you do not own.*

---

## 🤖 Phase 9 — Analyse avancée avec LLM (inspiré de Raptor)

> Source: [gadievron/raptor](https://github.com/gadievron/raptor)

### Scan statique augmenté
```bash
# Semgrep avec règles OWASP + secrets
semgrep --config=auto --config "p/owasp-top-ten" --config "p/secrets" .

# CodeQL (si disponible) — analyse dataflow
codeql database create codeql-db --language=javascript
codeql database analyze codeql-db --format=sarif-latest --output=results.sarif
```

### Pensée adversariale

Lors de chaque audit, adopter la posture d'un attaquant :
1. **Identifier les trust boundaries** — où les données passent d'un contexte non-fiable à fiable
2. **Tracer le dataflow** — suivre chaque entrée utilisateur de la source au sink
3. **Chercher les cas limites** — race conditions, TOCTOU, integer overflow, encoding bypass
4. **Valider les hypothèses** — chaque "ça ne peut pas arriver" est un vecteur d'attaque potentiel

### Fuzzing de binaires (si applicable)
```bash
# AFL++ pour du fuzzing automatisé
afl-fuzz -i input_corpus/ -o findings/ -- ./target_binary @@
```

### Forensics GitHub
```bash
# Chercher des secrets dans l'historique git
git log --all --oneline --diff-filter=D -- "*.env" "*.key" "*.pem"
git log --all -p -S "password" --since="6 months ago"

# Vérifier les branches orphelines
git branch -a | grep -v HEAD
```

### Budget et limites
- Fixer un coût max par scan pour éviter les dérapages
- Prioriser : d'abord les vulns critiques/hautes, puis le reste
- Documenter chaque trouvaille avec preuve reproductible
