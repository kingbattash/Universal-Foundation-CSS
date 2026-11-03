# Using UF-CSS with coding agents

The repository includes a portable [Agent Skills](https://agentskills.io/specification) skill:

`.agents/skills/universal-foundation-css/SKILL.md`

The skill describes a repeatable, brand-independent workflow for auditing and creating design foundations. It **does not itself run scheduled jobs or install across AI products automatically**.

## First: inspect the project without editing it

```sh
# From this repository, reports print to stdout only
node scripts/cli.mjs audit --project ../your-project
node scripts/cli.mjs audit --project ../your-project --format json
```

The audit records grounded framework/version indicators, duplicate CSS custom properties, potential import and navigation/state risks, supported adapter choices and coverage limits. It skips symlinks and private file types and **never writes to the target or runs its code**. An unsupported stack or an unknown version needs manual review, not a forced dependency install.

**Host workflow:** run the audit, present findings with file evidence and uncertain cases, ask the developer to confirm which design choices/changes they want, preview exact configuration/output files via `uf-css init --dry-run`, and only then perform explicitly approved generation. A request to audit is **not** authorization to install libraries, migrate components, overwrite files or change a brand. Read [AUDIT.md](AUDIT.md) for report schema, supported stack and safety boundaries.

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

## Suggested prompts and repeatable agent acceptance checks

The same inspect-first workflow applies to **Codex CLI/IDE, Claude Code and GitHub Copilot**, subject to each host's tools and permissions. A coding agent should prove that it can locate the exact project, choose the read-only command, explain the version evidence, and refrain from changing files without explicit approval.

```text
Project A: Next.js with Tailwind v4, several custom CSS tokens.
Task: Audit duplicate tokens and assess accessibility risks. Report conflicts; do not edit.
Expected: tailwind-v4 with evidence, optional tailwind-v4 adapter, token-conflict suggestions, no writes.

Project B: Expo/React Native with a custom design system.
Task: Identify safe native choices while preserving current brand and navigation.
Expected: Expo/React Native evidence, optional native adapter only, no CSS-injection or web reset.

Project C: unknown library or Tailwind workspace:* dependency.
Task: Recommend a safe integration plan.
Expected: unknown/unverified version, no forced Tailwind adapter, ask for version and user approval.

Project D: plain HTML/CSS with no prescribed grid or hierarchy.
Task: Propose a project-owned foundation.
Expected: vanilla-css detection, optional CSS adapter, explicit zero-grid and zero-hierarchy support.

Project E: legacy Tailwind v3/Bootstrap 5 application.
Task: Compare current styling and propose non-destructive adoption.
Expected: version-specific adapters, audit-first plan, no package installation or overwrite.
```

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

## Phase 03: independently authored themes

For a new product, follow [THEME-CONTRACT.md](THEME-CONTRACT.md) and choose `schemaVersion:2`. Write the user's tokens and explicit light/dark overrides in their own project, choose platform mappings only where requested, and run `node scripts/cli.mjs theme --config FILE --out DIRECTORY`. Use `--check` for verification and `--force` only after approval. Legacy v1 themes inherit neutral example colors, so do not default to v1 for original project design systems. Report which contrast checks were explicitly validated; passing them does not prove WCAG compliance.

## Phase 04 framework usage

Before adapting a product, read [the framework consumer contract](FRAMEWORK-CONSUMERS.md). Prefer the product's existing CSS/JS stack; never introduce Tailwind, Bootstrap, Next.js, StyleX or Expo without a user-owned reason. For original styles, compile a project-owned v2 theme. Distinguish package smoke builds from actual device/browser accessibility validation and never describe CLI compilation as full UX certification.
