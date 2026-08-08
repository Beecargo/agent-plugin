# Publishing checklist (Beecargo Agent Plugin)

Use this when you are ready to list the plugin publicly. **Nothing in this file triggers submission** — it is operator documentation only.

## Before any marketplace

- [ ] **Public GitHub repo:** [`Beecargo/agent-plugin`](https://github.com/Beecargo/agent-plugin) (submodule of the private monorepo).
- [ ] Confirm `repository` in [`plugin.json`](./plugin.json) and [`.cursor-plugin/plugin.json`](./.cursor-plugin/plugin.json) matches that URL.
- [ ] Run `pnpm plugin:validate` from the monorepo root.
- [ ] Confirm hosted MCP is healthy: `https://mcp.beecargo.net/health`
- [ ] Privacy policy URL live: `https://beecargo.net/docs/privacy`
- [ ] MCP user docs: `https://beecargo.net/docs/mcp/overview`

## Cursor Marketplace

1. Repo must be **public** on GitHub.
2. Plugin layout: this directory with valid `.cursor-plugin/plugin.json` + Agent Plugins files.
3. Submit: [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish)
4. Manual review by Cursor — allow lead time.
5. Optional community listing (no official review): [cursor.directory/plugins/new](https://cursor.directory/plugins/new)

**Template reference:** [cursor/plugin-template](https://github.com/cursor/plugin-template)

## Agent Plugins clients (Codex, ChatGPT, Copilot, VS Code, Kiro)

1. Ship this folder (or repo root) conforming to [Agent Plugins 1.0](https://agent-plugins.org/specification).
2. No separate OpenAI/GitHub/Microsoft submit URL in this checklist — distribution is per product (built-in plugin import, team marketplaces, etc.).
3. Keep `mcp.json` on **streamable-http** for hosted `https://mcp.beecargo.net/mcp`.

## Claude Connectors Directory

**Blocked until OAuth consent ships.** Today:

- `BEECARGO_MERCHANT_OAUTH_ENABLED=true` only publishes OAuth **metadata**; consent flow is not complete (see monorepo `apps/mcp` README).
- Directory expects secure OAuth, tool annotations, privacy policy, public docs, and **test credentials** for review.

When OAuth is live:

1. Read [submission guidelines](https://claude.com/docs/connectors/building/submission) and [review criteria](https://claude.com/docs/connectors/building/review-criteria).
2. Submit via [Claude.ai admin directory portal](https://claude.ai/admin-settings/directory/submissions/new) (Team/Enterprise org required).
3. Note: MCP Registry / `modelcontextprotocol/servers` does **not** auto-list in Claude — directory submit is separate.

## MCP Registry / community

- [MCP Registry](https://registry.modelcontextprotocol.io) — optional discovery; independent of Claude directory.
- cursor.directory — fast community visibility.

## Post-publish

- [ ] Add marketplace badge/links on `beecargo.net/docs/mcp/overview` only **after** approval (do not claim listings early).
- [ ] Monitor MCP rate limits and `beecargo_register_agent` abuse after increased traffic.
- [ ] Plan OAuth + Claude directory as a follow-up workstream.

## Out of scope for this package

- Changing MCP tools or Railway deploy
- Bundling stdio / `npx @beecargo/mcp` in the marketplace plugin (hosted HTTP only)
- Storing API keys or transport secrets in the repo
