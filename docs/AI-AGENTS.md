# Using UF-CSS with coding agents

The repository includes a portable [Agent Skills](https://agentskills.io/specification) skill:

`.agents/skills/universal-foundation-css/SKILL.md`

The skill describes a repeatable, brand-independent workflow for auditing and creating design foundations. It **does not itself run scheduled jobs or install across AI products automatically**.

## Install into another project

From your UF-CSS clone:

```bash
node scripts/install-skill.mjs --target codex --project ../another-project
node scripts/install-skill.mjs --target claude --project ../another-project
node scripts/install-skill.mjs --target copilot --project ../another-project
# Or copy to all three supported paths:
node scripts/install-skill.mjs --target all --project ../another-project
```

The installer is intentionally conservative: it **skips existing skill folders** rather than overwriting customizations, requires explicit `--project`, and makes no network calls.

- **Codex CLI / IDE**: reads repository skills from `.agents/skills/`.
- **Claude Code**: looks for project skills at `.claude/skills/`.
- **VS Code / GitHub Copilot**: supported project skill directory is `.github/skills/`.
- **ChatGPT**: a repository file is not automatically installed as a ChatGPT skill. Use supported ChatGPT skill or plugin installation workflows when available; publishing a compatible plugin is a separate project milestone.

The repository's `AGENTS.md` and `.github/copilot-instructions.md` provide smaller always-on guidance in compatible tools. See the skill's `references/` for detail.

## Suggested prompts

- "Use the universal-foundation-css skill to audit the web and Expo versions of this product; show mismatched token values and component behavior before changing any code."
- "Using UF-CSS, design an unbranded token architecture, select an appropriate grid and produce a migration plan for my existing styles."
- "Use the UF-CSS hierarchy registry to improve the reading order of this article page without changing its brand."

The agent's access remains subject to its host permissions. The skill should not invent tests, perform unapproved migrations or make unsupported claims.

## Create an entirely user-owned design system

For a project that does not want UF-CSS defaults, agents should use the [custom system guide](CUSTOM_SYSTEMS.md). First inspect the project, then write **project-owned** token JSON and explicit adapter mappings, and only then run `scripts/generate-custom-system.mjs` with an approved output directory. Do not force default colors, typography, spacing or grid choices.

## Use the interactive builder safely

An agent can translate user-specified design decisions into `design-system.config.json` following [the builder guide](WIZARD.md). Run `node scripts/cli.mjs init --config FILE --out DIR --dry-run` first, show the planned outputs, and request approval. Only after approval should the agent run `--yes`. Do not invent an obligatory brand palette, grid, hierarchy, type scale, framework or output path. No background installation is performed.

## Token consistency checks

Use [the shared token contract](TOKEN-CONTRACT.md) before writing new token types. A creator can use an entirely original token file without required scales or brand roles. Run `npm run check:tokens` for UF-CSS neutral source changes and `node scripts/cli.mjs generate ... --check` for custom-system output drift, then report the actual test results. Do not claim full DTCG conformance or apply an optional neutral theme without the user's request.
