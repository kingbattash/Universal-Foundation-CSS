# Universal Foundation CSS (UF-CSS)

**An open, framework-independent foundation for consistent interface design.**

UF-CSS is a design-knowledge and token project for people building websites, dashboards, applications, and design systems. It provides reusable foundations—formulas, semantic roles, hierarchy, grids, layout patterns, and component contracts—without forcing a brand, a UI kit, or a specific CSS framework.

> **Status: early development (0.x).** The foundational APIs and adapters are under development. This repository is open source, but a stable npm release has **not** been published. Review the roadmap and avoid treating experimental APIs as production-stable.

## Why this exists

A design system should help multiple teams and products apply the *same principles* without forcing them to have the *same visual identity*. Two platforms can share tokens, accessibility standards, component meanings and interaction contracts while adapting their layouts and components to the platform.

**UF-CSS is not** a clone of Tailwind, Bootstrap, or shadcn/ui. It does not impose a preselected visual theme, and it does not assert that any one grid or design law is universally optimal.

## Architecture

The foundation is organized around seven independent domains:

| Domain | Purpose |
| --- | --- |
| `foundation-formular/` | Mathematical scales, fluid sizing, composition ratios and documented UX heuristics |
| `semantic/` | Content, navigation, action, feedback and accessibility roles |
| `hierarchy/` | A practical taxonomy of visual, information, structural and interaction hierarchy |
| `tokens/` | Platform-neutral, typed design decisions and recommended baseline scales |
| `patterns/` | Reusable, framework-agnostic composition specifications |
| `components/` | Component behavior, state and accessibility contracts (no branded UI kit) |
| `grid/` | A registry of web, editorial, geometric and classical composition grids |

Platform adapters are distinct from the foundation. The initial CSS adapter is intentionally minimal; StyleX and React Native integrations belong to later milestones.

## Getting started

Development setup and example commands will be documented alongside the first TypeScript modules. For now, see [the architecture](docs/ARCHITECTURE.md), [the roadmap](docs/ROADMAP.md), and [the AI skill instructions](docs/AI-AGENTS.md) once the initial scaffold is merged.

**Use in another project:** choose a foundation version, select the grids and token roles appropriate to that project, implement its brand/theme separately, and validate its accessibility and behavior. UF-CSS never imports any product-specific brand.

## Principles

1. **Meaning before appearance.** Semantic structure, content priorities and tasks precede CSS.
2. **One source of truth.** Do not maintain competing web and mobile token values by hand.
3. **Choose a grid—don't inherit every grid.** Classical canons are optional composition guides, not universal CSS grid systems.
4. **Respect accessibility.** Contrast, focus, reduced motion, keyboard order and understandable feedback are required reviews.
5. **Independent of any brand.** No company colors, logos or product names in foundation APIs.
6. **Small, typed, auditable APIs.** Formulas document assumptions and reject invalid input.
7. **Portable workflows.** Published AI skill files aid coding agents but never authorize automatic unsafe changes.

## Open source

Licensed under the **Apache License, Version 2.0**. See [LICENSE](LICENSE). Contributions are welcome following [CONTRIBUTING.md](CONTRIBUTING.md); security reports should follow [SECURITY.md](SECURITY.md).

Copyright © 2026 contributors to Universal Foundation CSS.

## Project status

- [ ] Finalize the initial TypeScript contracts and grid catalog
- [ ] Implement and test the neutral CSS adapter
- [ ] Publish examples and visual specimens
- [ ] Validate the agent skill and cross-platform setup
- [ ] Tag the first pre-release version

**Maintainer:** [kingbattash](https://github.com/kingbattash). The public foundation is independent of AMGYNA and its products.
