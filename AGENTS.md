# Repository agent instructions

This is **Universal Foundation CSS**, not AMGYNA or any consuming product.

- Treat `src/` as a framework-independent design foundation. Do not add corporate logos, names, fixed product colors or brand-specific layouts to its public API.
- Preserve the seven domains: foundation-formular, semantic, hierarchy, tokens, patterns, components, grid.
- Distinguish semantic decision contracts from platform renderers. `src/css/foundation.css` is an **opt-in neutral adapter**, not a universal reset.
- Design hierarchy is a useful classification, not an exhaustive scientific taxonomy. Classical canons are optional composition references.
- Follow `docs/IMPLEMENTATION_PLAN.md` for phase order and module ownership; do not mark a phase complete from folder creation alone.
- Keep public APIs small and typed. Validate formulas and reject impossible inputs.
- Before editing, inspect relevant files and existing tests. Prefer a small PR with reproducible tests.
- Generated project themes belong outside the universal core. Use `scripts/generate-project-theme.mjs` only on user-approved project configuration and output paths. Do not overwrite existing themes without `--force` and authorization.
- Run `npm run verify` and report what actually ran. Avoid claiming browser/device QA if it was not done.
- For workflows around auditing or creating design systems, use `.agents/skills/universal-foundation-css/SKILL.md`.
- Do not push to protected branches, publish packages or overwrite product design decisions without authorization.
