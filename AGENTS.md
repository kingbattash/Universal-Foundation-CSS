# Repository agent instructions

This is **Universal Foundation CSS**, a toolkit for creating **independent design systems**. It is not AMGYNA, not a particular visual style, and not a design system that users are required to follow. Read `docs/PHILOSOPHY.md`.

- Treat `src/` as a framework-independent design foundation. Do not add corporate logos, names, fixed product colors or brand-specific layouts to its public API.
- Preserve the repository's seven conceptual domains: foundation-formular, semantic, hierarchy, tokens, patterns, components, grid. **Do not require consuming projects to reproduce these folders or any predefined design decisions.**
- Distinguish semantic decision contracts from platform renderers. `src/css/foundation.css` is an **opt-in neutral adapter**, not a universal reset.
- All predefined fonts, spacing scales, grids, hierarchy categories, component contracts and neutral themes are optional starter choices. **Accept custom consumer-defined tokens, hierarchy, grids, patterns and components.** The 20 hierarchy categories are not a universal scientific taxonomy and classical canons are optional composition references.
- Follow `docs/IMPLEMENTATION_PLAN.md` for phase order and module ownership; do not mark a phase complete from folder creation alone.
- For all token generators, use the shared validator/formatter modules in `scripts/lib/tokens/`. Read `docs/TOKEN-CONTRACT.md` and `docs/TOKEN-INVENTORY.md`; never introduce a second parser or silently hardcode another project’s design values.
- Keep public APIs small and typed. Validate formulas and reject impossible inputs.
- Before editing, inspect relevant files and existing tests. Prefer a small PR with reproducible tests.
- The `uf-css init` wizard is opt-in: show all proposed files and obtain explicit creator confirmation before generating anything. See `docs/WIZARD.md`. Do not force example colors, grids or hierarchy choices.
- Generated project themes belong outside the universal core. Prefer independent `schemaVersion:2` themes and document opt-in contrast checks and platform mappings. The legacy v1 neutral theme is compatibility-only. Use `scripts/generate-project-theme.mjs` only on user-approved project configuration and output paths. Do not overwrite existing themes without `--force` and authorization.
- Run `npm run verify` and report what actually ran. Avoid claiming browser/device QA if it was not done.
- For workflows around auditing or creating design systems, use `.agents/skills/universal-foundation-css/SKILL.md`.
- Do not push to protected branches, publish packages or overwrite product design decisions without authorization.
