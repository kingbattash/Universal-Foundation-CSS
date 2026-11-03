# Contributing to Universal Foundation CSS

Thank you for considering a contribution. UF-CSS is an independent open-source project. Contributions should improve reusability, correctness, accessibility or documentation without introducing product-specific branding.

## Before proposing a change
1. Search existing issues or open a focused design discussion.
2. Describe the **user need**, the proposed public API, and alternatives.
3. For grid and hierarchy additions, distinguish an established technique from a project-specific heuristic; cite primary references when practical.
4. Consider both web and native consumption, but do not force platform details into universal contracts.

## Development
- Use Node.js 22 or later.
- Install dependencies using `npm install` during early bootstrap; a locked, reproducible installation will be introduced before release.
- Run `npm run check` after changing TypeScript.
- Run `npm test` for formula and registry tests.
- Keep changes narrow; write or update tests and docs with new behavior.
- Do not add hardcoded organization branding or nonessential runtime dependencies.

## Pull requests
Describe what changed, why, migration compatibility and any accessibility impacts. Keep PRs reviewable. Maintainers may request design discussions for breaking contracts. All contributions are made under Apache-2.0; contributors must have the rights to contribute their work.

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations and [SECURITY.md](SECURITY.md) for reporting vulnerabilities.
