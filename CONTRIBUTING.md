# Contributing to Universal Foundation CSS

Thank you for considering a contribution. UF-CSS is an independent open-source project. Contributions should improve reusability, correctness, accessibility or documentation without introducing product-specific branding.

## Before proposing a change
1. Search existing issues or open a focused design discussion.
2. Describe the **user need**, the proposed public API, and alternatives.
3. For grid and hierarchy additions, distinguish an established technique from a project-specific heuristic; cite primary references when practical.
4. Consider both web and native consumption, but do not force platform details into universal contracts.

## Development
- Use Node.js 22 or later.
- Install dependencies using `npm ci` from the committed lockfile; do not regenerate lockfiles unless the dependency change is reviewed.
- Run `npm run generate:tokens` after changing `tokens/source.tokens.json`. Never hand-edit generated adapters.
- Run `npm run check:tokens` to detect drift across framework outputs.
- Run `npm run check` after changing TypeScript.
- Run `npm test` for formula, registry and contract tests.
- Run `npm run verify:release` when public APIs, CLI, package files or exports change.\n- Browser and native compatibility changes require their corresponding CI workflow. Don't claim device or WCAG certification from compilation.
- Keep changes narrow; write or update tests and docs with new behavior.
- Do not add hardcoded organization branding or nonessential runtime dependencies.

## Distribution and breaking API changes

The `1.0.0` source is available for user testing but is not yet a published stable API; breaking changes still require changelog explanations and migration steps. Check that every new exported path is included in the npm tarball, that TypeScript declarations resolve, and that optional adapters do not impose a visual identity on existing products. Review the [versioning and release policy](docs/RELEASE.md).

Release publishing, version bumps, tags and merges are separate maintainer decisions. Opening or updating a PR does not authorize publication. The automated release workflow is manual-only and cannot substitute for the configured GitHub required-reviewer environment.

## Pull requests
Describe what changed, why, migration compatibility and any accessibility impacts. Keep PRs reviewable. Maintainers may request design discussions for breaking contracts. All contributions are made under Apache-2.0; contributors must have the rights to contribute their work.

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations and [SECURITY.md](SECURITY.md) for reporting vulnerabilities.
