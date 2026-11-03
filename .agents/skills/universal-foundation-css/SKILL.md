---
name: universal-foundation-css
description: Use when planning, creating, auditing or migrating a design system, CSS foundations, design tokens, visual hierarchy, typography scales, responsive grids, or web/mobile UI consistency. Apply UF-CSS principles without imposing any company's branding or replacing the project's existing UI without permission.
license: Apache-2.0
compatibility: Works as an instruction-only skill with coding agents. Node.js 20+ is needed only for repository scripts. No external accounts or automatic installation required.
---

# Universal Foundation CSS — AI Agent Skill

UF-CSS is a **toolkit for constructing a user's own design system**. It is **not** a mandatory visual style, fixed hierarchy, grid standard, component kit or brand. Never impose UF-CSS starter tokens or predefined catalogs unless the user has selected them. Follow these steps for a new or existing project.

## Workflow

1. **Audit before editing.** From a checked-out or explicitly installed UF-CSS, run `uf-css audit --project PATH --format json` on the exact user-authorized project, or `node scripts/cli.mjs audit --project PATH` from this checkout. This is inspect-only: no code or config changes, installs, network or project scripts. Identify current web/native platforms, package manager, existing tokens, fonts, grid rules, styling libraries, navigation and user tasks. Read any project-specific instructions. Report scan limits and evidence rather than assuming complete coverage.
2. **Clarify the design problem.** Is this a new system, inconsistent web/mobile implementation, migration, hierarchy audit, accessibility issue or new page? Name the user task and current constraints. Do not assume that identical layouts are necessary across platforms.
3. **Choose a project identity independently.** Preserve existing product brand, fonts and colors unless the user explicitly requests a change. Avoid importing unrelated product branding from other repositories. When the user requests a new project theme, consult `docs/THEMES.md` and `docs/THEME-CONTRACT.md`. Prefer **independent v2** for new products; do not inherit the legacy neutral starter unless the user explicitly chooses it. Keep all product values in the consuming project.
4. **Help the user define their own design decisions.** For fully original token sets, use `scripts/generate-custom-system.mjs` and the `docs/CUSTOM_SYSTEMS.md` guide. Do not use the neutral starter or `generate-project-theme.mjs` when the user wants a system entirely their own. Offer—but never force—semantic roles, core ratios, spacing, typography, hierarchy, grid rules, interaction states and component contracts. A blank/custom choice is valid. Separate the project's canonical values from web (CSS/StyleX) and native adapters.
5. **Choose or design hierarchy and grids.** Read `src/hierarchy/hierarchy.ts` and `src/grid/registry.ts` only as **optional reference catalogs**. Use `docs/GRIDS.md` and `createGridSystem` for fully creator-defined weighted grids, custom breakpoint models or no grid at all. Only import the optional `./grid.css` adapter when the user chooses to. The baseline grid helpers and classical canons are references, not aesthetic laws; actual masonry is not claimed supported. Preserve source order and do not apply a default grid without creator approval.
6. **Specify behavior, not just visual tokens.** Read `docs/COMPONENTS.md` and `docs/PATTERNS.md` for optional, framework-neutral reference contracts. You may use `defineComponentContract` and `definePattern` for an entirely original task and reading order. Define accessible labels, appropriate rest/busy/error/empty/disabled states and the actual confirmation condition for success; do not assume a TypeScript contract renders a working component. Use `./patterns.css` only if the consumer explicitly wants the layout hooks. Test real web/native behavior separately.
7. **Review detected framework versions, including unsupported ones.** Use audit evidence and `docs/FRAMEWORK-CONSUMERS.md`. Check Vanilla CSS, Tailwind v3/v4, Bootstrap 5, StyleX, Expo/React Native and Next.js; a workspace/unknown major needs confirmation before recommending an adapter. Keep the existing stack and product identity. Do not add Tailwind, Bootstrap, StyleX, Expo or any framework merely because an adapter exists.
8. **Separate audit, preview and approved creation.** Read `docs/AUDIT.md` and `docs/WIZARD.md`. An audit request never authorizes mutation. If the creator requests a new system, ask for their choices, allow empty options, prepare a user-owned config, preview via `uf-css init --config FILE --out DIR --dry-run`, and show exact destination files. Use `--yes` only after explicit approval; `--force`, installs, framework migrations, deletion and overwrite require separate authorization. No preset grid, hierarchy, palette, font, output path or component design may be invented.
9. **Select the right adapter, then implement incrementally.** Detect Vanilla CSS, Tailwind v3/v4, Bootstrap 5.3, StyleX, React Native/Expo or other CSS frameworks. Read `docs/ADAPTERS.md`; use the generated adapter rather than converting the app to a different styling library. Do not copy `*.generated.*` files into an independent hand-maintained token system. If the project uses another stack, adapt the canonical tokens explicitly.
10. **Validate.** For UF-CSS work run `npm run verify` and applicable framework builds, and run the separate Playwright + axe browser checks documented in `docs/TESTING.md` when Chromium tests apply. For a consumer project, use its own tooling. Inspect UI at narrow/wide widths, keyboard interactions, visible focus, contrast, root text scaling, reduced motion and long localized text. Browser snapshots are evidence, **not** approved pixel baselines; axe cannot certify WCAG conformance. If screen readers, browser zoom or Android/iOS runtime were not exercised, report those as pending rather than asserting success.
11. **Summarize with evidence.** Name changed files, framework/brand decisions, grids chosen, verification results, and outstanding work. Do not claim a visual redesign is production-ready without visual QA.

## Decisions to record

- Product identity and target audience
- Canonical token location and web/native adapter boundaries
- Main user tasks and information reading order
- Selected grids, why, and fallback
- Component behavior and accessibility contracts
- Validation evidence and known exceptions

Portable host support: Codex, Claude Code and GitHub Copilot skill folders may be installed explicitly via `scripts/install-skill.mjs`. A repo skill file is **not automatically installed in ChatGPT**, and each host still enforces its own permissions. Example host prompts, safety gates and unknown-stack cases are in `docs/AI-AGENTS.md`.

Read [design freedom philosophy](../../../docs/PHILOSOPHY.md) and [implementation guidance](references/IMPLEMENTATION.md) for new projects and [audit checklist](references/AUDIT-CHECKLIST.md) for inconsistent products.

## Safety and scope

- Never push, merge, publish packages, change licensing, overwrite design files or install dependencies without proper authorization.
- Never infer proprietary source material or copy a third-party brand without permission.
- Do not trust generated UI screenshots as proof of functional or accessible behavior.
- Treat formulas such as the golden ratio and UX heuristics as options to evaluate, **not** universal requirements.
