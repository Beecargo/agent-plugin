#!/usr/bin/env node
/**
 * Validates apps/agent-plugin manifests and skill layout (no network).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";

const PLUGIN_NAME_PATTERN = /^(?!.*(?:--|\\.\\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

const SKILL_NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const errors = [];

const readJson = (rel) => {
  const path = join(root, rel);
  if (!existsSync(path)) {
    errors.push(`Missing file: ${rel}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    errors.push(`${rel}: invalid JSON — ${e.message}`);
    return null;
  }
};

const plugin = readJson("plugin.json");
if (plugin) {
  if (plugin.$schema !== PLUGIN_SCHEMA) {
    errors.push(`plugin.json: $schema must be ${PLUGIN_SCHEMA}`);
  }
  if (!plugin.name || typeof plugin.name !== "string") {
    errors.push("plugin.json: name is required");
  } else if (plugin.name.length > 64 || !PLUGIN_NAME_PATTERN.test(plugin.name)) {
    errors.push(`plugin.json: invalid name "${plugin.name}"`);
  }
}

const mcp = readJson("mcp.json");
if (mcp) {
  if (mcp.$schema !== MCP_SCHEMA) {
    errors.push(`mcp.json: $schema must be ${MCP_SCHEMA}`);
  }
  const servers = mcp.mcpServers;
  if (!servers || typeof servers !== "object") {
    errors.push("mcp.json: mcpServers object is required");
  } else {
    const beecargo = servers.beecargo;
    if (!beecargo) {
      errors.push("mcp.json: mcpServers.beecargo is required");
    } else {
      if (beecargo.type !== "streamable-http") {
        errors.push("mcp.json: beecargo.type must be streamable-http");
      }
      if (beecargo.url !== "https://mcp.beecargo.net/mcp") {
        errors.push("mcp.json: beecargo.url must be https://mcp.beecargo.net/mcp");
      }
    }
  }
}

const cursorManifest = readJson(".cursor-plugin/plugin.json");
if (cursorManifest) {
  if (!cursorManifest.name) {
    errors.push(".cursor-plugin/plugin.json: name is required");
  }
  if (plugin && cursorManifest.name !== plugin.name) {
    errors.push(".cursor-plugin/plugin.json: name must match plugin.json");
  }
  const logoPath = join(root, cursorManifest.logo ?? "");
  if (!cursorManifest.logo || !existsSync(logoPath)) {
    errors.push(".cursor-plugin/plugin.json: logo file missing or not set");
  }
}

const codexManifest = readJson(".codex-plugin/plugin.json");
if (codexManifest) {
  if (!codexManifest.name) {
    errors.push(".codex-plugin/plugin.json: name is required");
  }
  if (plugin && codexManifest.name !== plugin.name) {
    errors.push(".codex-plugin/plugin.json: name must match plugin.json");
  }
  if (codexManifest.mcpServers !== "./.mcp.json") {
    errors.push('.codex-plugin/plugin.json: mcpServers must be "./.mcp.json"');
  }
  if (codexManifest.skills !== "./skills/") {
    errors.push('.codex-plugin/plugin.json: skills must be "./skills/"');
  }
} else {
  errors.push("Missing file: .codex-plugin/plugin.json");
}

const codexMcp = readJson(".mcp.json");
if (codexMcp) {
  const servers = codexMcp.mcpServers ?? codexMcp.mcp_servers ?? codexMcp;
  const beecargo = servers?.beecargo;
  if (!beecargo?.url) {
    errors.push(".mcp.json: beecargo.url is required");
  } else if (beecargo.url !== "https://mcp.beecargo.net/mcp") {
    errors.push(".mcp.json: beecargo.url must be https://mcp.beecargo.net/mcp");
  }
} else {
  errors.push("Missing file: .mcp.json");
}

const marketplace = readJson(".agents/plugins/marketplace.json");
if (marketplace) {
  if (marketplace.name !== "beecargo") {
    errors.push('.agents/plugins/marketplace.json: name must be "beecargo"');
  }
  const entry = marketplace.plugins?.find((p) => p.name === "beecargo");
  if (!entry) {
    errors.push(".agents/plugins/marketplace.json: plugins[] must include beecargo");
  } else if (entry.source?.path !== "./plugins/beecargo") {
    errors.push(
      '.agents/plugins/marketplace.json: beecargo source.path must be "./plugins/beecargo"',
    );
  }
  const pluginRoot = join(root, "plugins/beecargo");
  if (!existsSync(pluginRoot)) {
    errors.push("plugins/beecargo is missing (directory or symlink to plugin root)");
  } else if (!existsSync(join(pluginRoot, ".codex-plugin/plugin.json"))) {
    errors.push("plugins/beecargo/.codex-plugin/plugin.json is missing");
  }
} else {
  errors.push("Missing file: .agents/plugins/marketplace.json");
}

const skillDir = "skills/publish-share-link";
const skillPath = join(root, skillDir, "SKILL.md");
if (!existsSync(skillPath)) {
  errors.push(`${skillDir}/SKILL.md is missing`);
} else {
  const body = readFileSync(skillPath, "utf8");
  const match = body.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    errors.push("SKILL.md: missing YAML frontmatter");
  } else {
    const nameLine = match[1].match(/^name:\s*(.+)$/m);
    const descLine = match[1].match(/^description:\s*(.+)$/m);
    const skillName = nameLine?.[1]?.trim();
    if (!skillName) {
      errors.push("SKILL.md: frontmatter name is required");
    } else if (
      skillName !== "publish-share-link" ||
      !SKILL_NAME_PATTERN.test(skillName)
    ) {
      errors.push(`SKILL.md: invalid name "${skillName}"`);
    }
    if (!descLine?.[1]?.trim()) {
      errors.push("SKILL.md: frontmatter description is required");
    }
    if (skillName && skillName !== "publish-share-link") {
      errors.push("SKILL.md: name must match directory publish-share-link");
    }
    if (!body.includes("beecargo_upload")) {
      errors.push("SKILL.md: must document beecargo_upload");
    }
    if (
      !/\bretired\b/i.test(body) &&
      /beecargo_remote_upload|beecargo_upload_file/.test(body)
    ) {
      errors.push(
        "SKILL.md: must not recommend retired split upload tools without marking them retired",
      );
    }
  }
}

if (errors.length > 0) {
  console.error("agent-plugin validation failed:\n");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("agent-plugin: OK");
