---
name: universal-foundation-css
description: Use when planning, creating, auditing or migrating a design system, CSS foundations, design tokens, visual hierarchy, typography scales, responsive grids, or web/mobile UI consistency. Apply UF-CSS principles without imposing any company's branding or replacing the project's existing UI without permission.
license: Apache-2.0
compatibility: Works as an instruction-only skill with coding agents. Node.js 20+ is needed only for repository scripts. No external accounts or automatic installation required.
---

# Universal Foundation CSS — AI Agent Skill

UF-CSS is a **toolkit for constructing a user's own design system**. It is **not** a mandatory visual style, fixed hierarchy, grid standard, component kit or brand. Never impose UF-CSS starter tokens or predefined catalogs unless the user has selected them. Follow these steps for a new or existing project.

## Workflow

1. **Inspect before editing.** Identify web/native platforms, package manager, existing design tokens, fonts, grid rules, styling libraries, design system locations, UI components and existing navigation. Read project-specific instructions.
2. **Clarify the design problem.** Is this a new system, inconsistent web/mobile implementation, migration, hierarchy audit, accessibility issue or new page? Name the user task and current constraints. Do not assume that identical layouts are necessary across platforms.
3. **Choose a project identity independently.** Preserve existing product brand, fonts and colors unless the user explicitly requests a change. Avoid importing unrelated product branding from other repositories. When the user specifically requests a new color theme, consult `docs/THEMES.md` and use the conservative project-theme generator instead of modifying universal default tokens.
4. **Help the user define their own design decisions.** Offer—but never force—semantic roles, core ratios, spacing, typography, hierarchy, grid rules, interaction states and component contracts. A blank/custom choice is valid. Separate the project's canonical values from web (CSS/StyleX) and native adapters.
5. **Choose or design hierarchy and grids.** Read `src/hierarchy/hierarchy.ts` and `src/grid/registry.ts` only as **optional reference catalogs**. Support the user's own taxonomy, custom grid construction, or no predefined grid. Distinguish CSS recipes, mathematical helpers and scholarly references. Do not invent or claim universal design laws.
6. **Specify behavior, not just visual tokens.** For each component include rest, focus-visible, disabled, loading, selected and error states **as applicable**, keyboard interaction, accessible name and meaningful feedback.
7. **Select the right adapter, then implement incrementally.** Detect Vanilla CSS, Tailwind v3/v4, Bootstrap 5.3, StyleX, React Native/Expo or other CSS frameworks. Read `docs/ADAPTERS.md`; use the generated adapter rather than converting the app to a different styling library. Do not copy `*.generated.*` files into an independent hand-maintained token system. If the project uses another stack, adapt the canonical tokens explicitly.
8. **Validate.** Run `npm run check:tokens` for UF-CSS work where available and the project-theme generator's `--check` when applicable, then applicable repository commands; test mobile and desktop, keyboard navigation, contrast, 200% zoom, reduced-motion and long/localized text when possible. If tools are missing, report that rather than claiming a pass.
9. **Summarize with evidence.** Name changed files, framework/brand decisions, grids chosen, verification results, and outstanding work. Do not claim a visual redesign is production-ready without visual QA.

## Decisions to record

- Product identity and target audience
- Canonical token location and web/native adapter boundaries
- Main user tasks and information reading order
- Selected grids, why, and fallback
- Component behavior and accessibility contracts
- Validation evidence and known exceptions

Read [design freedom philosophy](../../../docs/PHILOSOPHY.md) and [implementation guidance](references/IMPLEMENTATION.md) for new projects and [audit checklist](references/AUDIT-CHECKLIST.md) for inconsistent products.

## Safety and scope

- Never push, merge, publish packages, change licensing, overwrite design files or install dependencies without proper authorization.
- Never infer proprietary source material or copy a third-party brand without permission.
- Do not trust generated UI screenshots as proof of functional or accessible behavior.
- Treat formulas such as the golden ratio and UX heuristics as options to evaluate, **not** universal requirements.
