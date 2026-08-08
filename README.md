# Beecargo Agent Plugin

Portable [Agent Plugins 1.0](https://agent-plugins.org) package: **Agent Skill** + **hosted MCP** for publishing durable share links.

- **MCP endpoint:** `https://mcp.beecargo.net/mcp` (full tools; OAuth **Connect with Beecargo**, or `bc_*` / Bearer)
- **Guest-only endpoint:** `https://mcp.beecargo.net/mcp/guest` (register / upload / checkout / search without account OAuth)
- **Docs:** [beecargo.net/docs/mcp/overview](https://beecargo.net/docs/mcp/overview)
- **Privacy:** [beecargo.net/docs/privacy](https://beecargo.net/docs/privacy)

## What it does

Connects compatible agent clients to Beecargo so agents can upload (or import from a public URL) and return `https://beecargo.net/d/{shortId}` without a dashboard login. See `skills/publish-share-link/SKILL.md` for the recommended tool sequence.

## Install

### Cursor (Marketplace or local)

Install from the [Cursor Marketplace](https://cursor.com/marketplace) when listed, or load this directory as a plugin. Cursor reads both [Agent Plugins](https://agent-plugins.org) (`plugin.json`, `mcp.json`, `skills/`) and `.cursor-plugin/plugin.json`.

Manual MCP-only config (no plugin folder):

```json
{
  "mcpServers": {
    "beecargo": {
      "url": "https://mcp.beecargo.net/mcp"
    }
  }
}
```

### Codex (Agent Plugin marketplace)

This repo is a Codex marketplace + plugin (`/.agents/plugins/marketplace.json` + `/.codex-plugin/plugin.json` + `/.mcp.json`).

```bash
# local (monorepo submodule) or public GitHub
codex plugin marketplace add /path/to/apps/agent-plugin
# or: codex plugin marketplace add Beecargo/agent-plugin

codex plugin add beecargo@beecargo
```

Complete **Connect with Beecargo** when Codex prompts OAuth (`policy.authentication: ON_INSTALL`).

MCP-only (no plugin skills):

```bash
codex mcp add beecargo --url https://mcp.beecargo.net/mcp
# if OAuth does not start automatically:
codex mcp login beecargo
```

### Agent Plugins 1.0 (ChatGPT / Copilot / VS Code / Kiro)

Use this folder as an Agent Plugin (root `plugin.json` + `mcp.json` + `skills/`). Clients that support Agent Plugins 1.0 discover components from fixed paths.

### OpenCode

No official marketplace yet. Install the hosted MCP and complete **Connect with Beecargo**:

```bash
opencode mcp add beecargo --url https://mcp.beecargo.net/mcp
opencode mcp auth beecargo
```

Then `opencode mcp list` should show Beecargo connected.

### Claude

Use **Custom connector** with URL `https://mcp.beecargo.net/mcp` today. Official [Connectors Directory](https://claude.com/docs/connectors/directory) listing requires a separate submission — see [PUBLISH.md](./PUBLISH.md).

## Quick start for agents

1. Connect MCP at `/mcp` (OAuth in the browser, or a `bc_*` key). Guest bootstrap: `/mcp/guest`.
2. `beecargo_register_agent` → bootstrap `bc_*` (**10GB** / **100rpm**; session adopts the key).
3. `beecargo_upload` with public HTTPS `url` (preferred), small `contentBase64`, or stdio `path`. Large/slow URLs: `background: true` then `beecargo_upload_status`.
4. Return `shareUrl` / `human_link` (`https://beecargo.net/d/{shortId}`), plus `sha256` and `agent_link` when present.
5. On quota limits: `beecargo_create_checkout` (default `plan=recommended`) and send the human the Stripe URL.

Local files outside MCP: `npx --yes github:Beecargo/cli upload <path> --json`.

## Package layout

| Path                              | Purpose                                      |
| --------------------------------- | -------------------------------------------- |
| `plugin.json`                     | Agent Plugins 1.0 manifest                   |
| `mcp.json`                        | Agent Plugins streamable-http MCP            |
| `.codex-plugin/plugin.json`       | Codex plugin manifest                        |
| `.mcp.json`                       | Codex bundled MCP (URL → hosted `/mcp`)      |
| `.agents/plugins/marketplace.json`| Codex marketplace catalog (`beecargo@beecargo`) |
| `plugins/beecargo` → `..`         | Codex plugin path (symlink to this repo root)|
| `.cursor-plugin/plugin.json`      | Cursor Marketplace manifest                  |
| `skills/publish-share-link/`      | Agent Skill (includes register → upload)     |

## Validate

From the monorepo root:

```bash
pnpm plugin:validate
```

## Monorepo note

This directory is the public submodule [`Beecargo/agent-plugin`](https://github.com/Beecargo/agent-plugin) at `apps/agent-plugin`. Marketplace submission uses this repo as-is — see [PUBLISH.md](./PUBLISH.md).

## License

MIT — see [LICENSE](./LICENSE).
