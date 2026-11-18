# Bolt App: `mask-secrets`

An offline, zero-network security utility for the [Bolt](https://sparcle.app/bolt/) desktop workspace. Redacts production API keys, Bearer tokens, and database passwords from copied cURL commands, logs, and config snippets before sharing with AI models or external tools.

---

## The Problem

We've all been there late at night: you're debugging a stubborn production issue with an LLM or an AI agent, you copy a cURL command or a stack trace from your terminal, and right as you hit Enter, you realize you just sent a live Stripe secret key, AWS token, or database password into a third-party cloud.

Bolt is built around local data governance and masking sensitive data before it reaches AI models. `mask-secrets` is a lightweight, zero-latency launcher transform designed to be your instant pre-flight check.

---

## What It Redacts

* **AI Provider Keys:** OpenAI (`sk-...`, `sk-proj-...`), Anthropic
* **Cloud & DevOps Credentials:** AWS Access Key IDs (`AKIA...`), GitHub Personal Access Tokens (`ghp_...`, `gho_...`)
* **Payment Rails:** Stripe Live Secret & Restricted Keys (`sk_live_...`, `rk_live_...`)
* **Auth Headers:** HTTP Authorization Bearer tokens (`Bearer <jwt/token>`)
* **Database Connection URLs:** PostgreSQL, MySQL, MongoDB, Redis (`postgres://user:password@host...`) with password redaction preserving host & port
* **Webhooks & Logs:** Slack incoming webhook URLs, config assignments (`password: "..."`)

---

## How It Works

`mask-secrets` is built strictly as a **Tier 2 Transform** (`runtime: transform`):
* **Zero Network Access:** Purely local regex pipeline using Bolt's linear allowlist parser.
* **Permissions Required:** `reads_launcher_input`, `copies_to_clipboard`.
* **Zero False Positives:** Hardened with strict word boundaries so normal developer code (e.g. `ask_question`, `task_queue`, `skyline_view`) is never mutated.

---

## Installation & Verification

### 1. Verification (Offline Check)
To verify the app structure and signing using the `bolt-apps` toolkit:

```bash
# Clone the bolt-apps toolkit
git clone https://github.com/SparcleHQ/bolt-apps.git
cd bolt-apps

# Run offline lint checks
node toolkit/bin/bolt-apps.mjs lint path/to/apps/mask-secrets

# Verify the signed package
node toolkit/bin/bolt-apps.mjs verify path/to/mask-secrets.boltpack
```

### 2. Installing in Bolt
1. Download `mask-secrets.boltpack`.
2. Drag and drop the `.boltpack` directly onto the Bolt launcher.
3. Review the declared permissions card (`reads_launcher_input`, `copies_to_clipboard`) and accept.

---

## Running the Stress Tests

A standalone test harness (`test_mask_brutal.js`) validates 12 brutal real-world edge cases (including URLs with passwords, multi-line logs, and false-positive checks):

```bash
node test_mask_brutal.js
```

---

## Author

Crafted by **Ganesh** ([@gana04982-ship-it](https://github.com/gana04982-ship-it)) for the Bolt community.
Licensed under MIT.
