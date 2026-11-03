# Phase 10 — Inspect-only project audit

UF-CSS is a **construction toolkit**, not a prescribed design system. The audit is a non-mutating first step for evaluating an existing project. It does **not** install dependencies, generate a design theme, run the project's build or scripts, write an output file, propose an automatic migration, or enforce preferred visual values.

## Run the audit

From a cloned UF-CSS repository (or an explicitly installed local package):

```sh
node scripts/cli.mjs audit --project ../your-app
node scripts/cli.mjs audit --project ../your-app --format json
# Also works from an installed package binary:
uf-css audit --project ../your-app --format text
```

`--project` is required. The target must be an existing directory, not a symbolic link. The CLI prints its findings to **stdout only**. `--format` accepts `text` (default) or `json`; unsupported flags fail. An AI agent may redirect stdout to a report **only with the user's approval** of the destination. The CLI never silently writes the report into a project.

## Inspected areas

| Area | Evidence-based behavior | Caution |
| --- | --- | --- |
| Framework detection | Package dependencies and conservative source signals for Tailwind v3/v4, Bootstrap 5, StyleX, Expo, React Native, Next.js and ordinary CSS/HTML | Version strings such as `workspace:*` or future unsupported majors are not assumed compatible |
| Tokens | CSS custom properties and cross-file duplicates/conflicts, potential token or design system paths | Different mode overrides may legitimately use different values |
| CSS import order | Detect possible imports following CSS declarations | CSS/Sass processors have different rules; verify before changing |
| Navigation and interaction | Inventory of nav markup and possible clickable `div`/`span` patterns | Static heuristics do not prove an accessibility failure |
| Component states | Signals for loading/error state handling; component directory locations | Absence of a string does not prove a state is missing |
| Compatibility | Optional adapter candidates grounded in detected source/version | No adapter is selected, installed, or applied without approval |
| Safety and coverage | Number of candidate files, read files, bytes, truncated flag, skipped symlink count | An incomplete scan cannot be represented as exhaustive |

Suggested adapters are explicit **optional** choices: `vanilla-css → ./css`, `tailwind-v3 → ./tailwind-v3`, `tailwind-v4 → ./tailwind-v4`, `bootstrap@5 → ./bootstrap`, `@stylexjs/stylex → ./stylex`, and `react-native → ./react-native`. Next.js and Expo are platforms rather than a reason to force any visual styling library. If version signals conflict or are unknown, manually review the existing stack; do not install a supposedly compatible adapter based on a guess.

Example JSON envelope:

```json
{
  "schemaVersion": 1,
  "kind": "uf-css-inspect-only-audit",
  "project": "your-app",
  "readonly": true,
  "coverage": {
    "candidateFiles": 13,
    "readFiles": 12,
    "bytesRead": 8500,
    "truncated": false,
    "skippedSymlinks": 0,
    "maxDepth": 7,
    "maxReadFiles": 450,
    "maxTotalBytes": 4000000
  },
  "frameworks": [],
  "adapterChoices": [],
  "design": {
    "tokenNames": [],
    "duplicates": [],
    "possibleTokenFiles": [],
    "componentDirectories": []
  },
  "review": {"navigation":[],"interaction":[],"states":[],"imports":[]},
  "findings": [],
  "nextSteps": [],
  "limitations": []
}
```

Counts and names above are *illustrative*, not taken from any inspected private project. Each actual finding has an ID, severity, an explanation, file/line evidence where possible, and a suggested **human review**. Severity labels are `warning` or `info`; do not treat this static analysis as a security scan or a WCAG test.

## Safe-by-default implementation

The auditor uses only Node filesystem read operations on a caller-selected project. It refuses a symlink root, skips symlink entries, does not follow linked child folders, ignores `.env*`, credential and private-key-like files, lockfiles, build outputs, native generated directories and dependency folders, and limits traversal depth and file sizes. Coverage includes truncation status when limits are reached. No file contents are executed, and there are no outbound requests.

**Static inspection is intentionally incomplete.** It can miss custom syntax, workspace dependencies, third-party component libraries, dynamic imports, CSS-in-JS themes and runtime issues. Generated files and deeply nested/large files are not processed. An unrecognized stack is an indication to adapt conservatively, **not** a justification for migration.

## Audit → decide → preview → approve → apply

1. Inspect the exact project: `uf-css audit --project PATH --format json`.
2. Review framework versions, canonical token owners, visual hierarchy and intended behavior. Confirm which findings are intentional. Do not guess the user's brand, grid, font, or preferred UI kit.
3. If the user wants a new design foundation, author **their own** configuration using [WIZARD.md](WIZARD.md), [CUSTOM_SYSTEMS.md](CUSTOM_SYSTEMS.md) or [THEMES.md](THEMES.md), preserving existing choices.
4. Preview changes without writes: `uf-css init --config FILE --out DIRECTORY --dry-run`. Review the exact paths and files.
5. Only after explicit approval, run `uf-css init --config FILE --out DIRECTORY --yes`. The builder refuses existing files without `--force`. Package installation, framework conversion, refactoring and destructive writes each require separate authorization.

An agent must never turn `audit` into an implicit `init --yes`. The user may select **no framework adapter, no visual hierarchy, and no grid**.

## Verification and host support

`tests/audit-project.test.mjs` exercises unsupported-version handling, multi-package framework evidence, source-level findings, no-write behavior, malformed manifests, symlink skipping, bounded coverage and CLI errors. The packed-package check runs the **installed** `uf-css audit` on a temporary test project. CI runs these tests as part of `npm run verify`.

Portable skill files are available for **Codex, Claude Code and GitHub Copilot**, but host execution still depends on each agent's permissions and supported integration. A repository skill is **not automatically installed in ChatGPT**. Check [AI-AGENTS.md](AI-AGENTS.md) for installation and example prompts.

This tool is a review assistant, not a substitute for real browser/device interaction, accessibility auditing, or security analysis.
