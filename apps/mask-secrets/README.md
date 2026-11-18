# mask-secrets (Bolt App)

> **Why I built this:** We've all been there late at night—you're debugging a tricky production bug with Claude, ChatGPT, or an AI agent, you copy a `curl` command or stack trace from your terminal, and right as you hit Enter, you realize you just pasted a live Stripe key, database password, or Bearer token into a cloud model.
>
> `mask-secrets` is a zero-latency, local-only safety net that runs directly inside the Bolt launcher. Before sharing context with an external model, run it through `=mask-secrets` to sanitize sensitive credentials on your device.

---

## What It Redacts

* **AI Provider Keys:** OpenAI (`sk-...`, `sk-proj-...`), Anthropic
* **Cloud & DevOps Credentials:** AWS Access Key IDs (`AKIA...`), GitHub Personal Access Tokens (`ghp_...`)
* **Payment Rails:** Stripe Live Secret & Restricted Keys (`sk_live_...`, `rk_live_...`)
* **Auth Headers:** HTTP Authorization Bearer tokens (`Bearer <jwt/token>`)
* **Database Strings:** PostgreSQL, MySQL, MongoDB, Redis connection URLs (`postgres://user:password@host...`)
* **Webhooks & Logs:** Slack incoming webhook URLs, config assignments (`password: "..."`)

---

## How to Use in Bolt

1. Open the Bolt launcher and type `=mask-secrets`.
2. Paste your curl command, `.env` snippet, or terminal output.
3. Bolt instantly returns the redacted, sanitized text.
4. Press Enter to copy to your clipboard.

---

## Technical Details

* **Safety Tier:** Tier 2 (`runtime: transform`)
* **Permissions Required:** `reads_launcher_input`, `copies_to_clipboard`
* **Network Access:** **None** (Pure local regex evaluation)
* **Author:** Ganesh ([@gana04982-ship-it](https://github.com/gana04982-ship-it))
