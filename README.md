# Beecargo Agent Plugin

Portable [Agent Plugins 1.0](https://agent-plugins.org) package: **Agent Skill** + **hosted MCP** for publishing durable share links.

- **MCP endpoint:** `https://mcp.beecargo.net/mcp`
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

### Codex / ChatGPT / GitHub Copilot / VS Code / Kiro

Use this folder as an Agent Plugin (root `plugin.json` + `mcp.json` + `skills/`). Clients that support Agent Plugins 1.0 discover components from fixed paths.

### Claude

Use **Custom connector** with URL `https://mcp.beecargo.net/mcp` today. Official [Connectors Directory](https://claude.com/docs/connectors/directory) listing requires OAuth and a separate submission — see [PUBLISH.md](./PUBLISH.md).

## Quick start for agents

1. Connect MCP (no headers by default).
2. `beecargo_register_agent` → `beecargo_upload` with `url` (public HTTPS), `contentBase64` (small), or stdio `path` for local files.
3. Return `shareUrl`, `sha256`, and `agent_link` from the tool response.

## Package layout

| Path                         | Purpose                       |
| ---------------------------- | ----------------------------- |
| `plugin.json`                | Agent Plugins manifest        |
| `mcp.json`                   | Streamable HTTP MCP server    |
| `.cursor-plugin/plugin.json` | Cursor Marketplace manifest   |
| `skills/publish-share-link/` | Agent Skill for handoff flows |

## Validate

From the monorepo root:

```bash
pnpm plugin:validate
```

## Monorepo note

This directory is maintained inside the Beecargo monorepo at `apps/agent-plugin`. For marketplace submission, copy or publish it as a standalone public repository and update `repository` URLs in the manifests — see [PUBLISH.md](./PUBLISH.md).

## License

MIT — see [LICENSE](./LICENSE).
