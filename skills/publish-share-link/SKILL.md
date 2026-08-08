---
name: publish-share-link
description: Publish a file to Beecargo and return a durable share link (https://beecargo.net/d/{shortId}). Use when the user wants a URL to download or hand off an artifact, send a file out of a sandbox, or share generated output without pasting large base64 in chat.
compatibility: Requires Beecargo MCP (hosted https://mcp.beecargo.net/mcp or equivalent). Network access to Beecargo API and a public HTTPS URL for remote import.
---

# Publish a Beecargo share link

Beecargo is for **publish + link**, not cloud drive sync. Prefer this skill when the deliverable is a URL humans or other tools can open.

## Prerequisites

1. Beecargo MCP is connected (this plugin's `mcp.json` points at `https://mcp.beecargo.net/mcp` with no headers — full tool set; session adopts a key after register).
2. If tools are missing, call `beecargo_search_tools` with keywords like `upload`, `share`, `checkout`.
3. Do **not** call retired tools (`beecargo_remote_upload`, `beecargo_upload_file`, or multipart MCP helpers). Use **`beecargo_upload`** only.

## Happy path (recommended)

1. **`beecargo_register_agent`** — mints a session `bc_*` key (bootstrap: **10GB** concurrent storage / **100** rpm). The HTTP session adopts the key automatically for later `beecargo_list_files` / `beecargo_claim_file` / `beecargo_update_share_settings`. Response includes `verified: { tier, basis }`; full ladder at `GET /agent/capabilities` → `trust_ladder`.
2. **Upload** — single tool **`beecargo_upload`**:
   - **Public HTTPS source:** `url` (preferred for agents).
   - **Small payload (<4MB on hosted MCP):** `contentBase64` (+ `fileName`).
   - **Local path (stdio MCP only):** `path` (auto multipart for large files).
   - Large/slow URLs: `background: true`, then **`beecargo_upload_status`** with `jobId` / `jobSecret`.
   - Optional: `ttl`, `grace`, `maxDownloads` / `once`, `protect`, `handoffMessage`, `runId` / `step` / `intent`, `visibility`, `direct`.
3. **Return** `shareUrl` / `human_link` (`https://beecargo.net/d/{shortId}`) plus `sha256` and `agent_link` when present. Humans can also enter `{shortId}` at `https://beecargo.net/get`.
4. **Optional handoff:** `protect: true` on upload (or `beecargo_update_share_settings`) → save `unlockCode` and `handoffUrl` (`/h/…`) privately.

## Fields to save from responses

| Field                       | When                                           |
| --------------------------- | ---------------------------------------------- |
| `shareUrl` / `human_link`   | Always                                         |
| `agent_link` / `agentLink`  | Machine download URL when returned             |
| `sha256`                    | Integrity + idempotent retries                 |
| `fileId`                    | Follow-up API/MCP calls (not the storage UUID) |
| `claimToken`                | Anonymous upload; claim into an account later  |
| `deletionToken`             | Anonymous upload; delete without an API key    |
| `unlockCode` / `handoffUrl` | Protected shares                               |
| `runId`                     | Pipeline manifests (`beecargo_run_artifacts`)  |

## When another tool needs bytes

Call `beecargo_get_download_url` for a signed GET. For protected files, pass `unlockCode`, `unlockToken`, or `handoffToken` as required.

## Anonymous (no register)

`beecargo_upload` works without `beecargo_register_agent` under stricter limits (1GB/file). Always save `deletionToken` if the user may want to remove the file later.

## Premium / existing keys

If the user already has `bc_*` from the dashboard, configure the MCP client with `x-beecargo-api-key` or `Authorization: Bearer bc_*` instead of registering. Do not commit keys into the plugin repo. Pro agent keys: 500GB included concurrent storage / 1000rpm.

## When limits hit (Premium conversion)

1. Tell the human anonymous/free limits were reached and Premium unlocks higher quotas.
2. Call **`beecargo_create_checkout`** (default `plan=recommended`) and send them the Stripe URL.
   - Signed-in human still eligible for intro → **trial**
   - Otherwise (including agent/guest sessions) → **weekly**
3. Human completes pay + claim in the browser (`/checkout/complete`), then mints a Pro `bc_*` in the dashboard (`POST /api-keys/agent`).
4. Reconnect MCP with that Pro key for the rest of the session.

Do not send humans to `/pricing` for this flow. monthly/annual only if they explicitly ask.

## Failure modes (escalate to human)

- **Private or auth-gated source URL** — `url` on `beecargo_upload` only accepts public HTTPS URLs (SSRF-safe). Use stdio `path`, REST multipart, or CLI `npx @beecargo/cli upload`.
- **>4MB via base64 in MCP** — use `url`, stdio `path`, or CLI.
- **Anonymous/free quota exceeded** — follow **When limits hit** above (`beecargo_create_checkout`).
- **Anonymous file >1GB** — needs Free or Premium; offer Premium via the conversion steps.
- **Agent never called MCP** — user must pull from sandbox manually; remind them to publish before the session ends.

## Reference

- MCP overview: https://beecargo.net/docs/mcp/overview
- Agent corpus: https://beecargo.net/llms.txt
- CLI: `npx @beecargo/cli upload <path> --json` / `remote <url> --json`
