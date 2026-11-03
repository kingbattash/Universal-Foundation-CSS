# Phase 11 — UF-CSS prerelease preparation and controlled distribution

**Status:** UF-CSS source and root lockfile are now versioned `1.0.0` for the user's requested testing and merge. **No npm publication or Git tag has been performed.** The existing `release.yml` workflow is prerelease-only and explicitly rejects a stable-form `1.0.0`; any public stable release needs separate approval and appropriately reviewed release automation.

UF-CSS is a design-system *construction toolkit*. Publishing must not introduce a mandatory grid, brand identity, component appearance, typography or styling framework.

## Readiness and release checklist

| Requirement | Status before maintainer review | Evidence |
| --- | --- | --- |
| All 12 public export subpaths and typed entry points present | Automated | `tests/package-exports.test.ts`, `scripts/verify-release-artifact.mjs` |
| No compiled tests, secrets or private artifacts in the tarball | Automated | Exact `npm pack --dry-run --json` file-list verification |
| Main export, packaged CLI and adapters work outside checkout | Automated | `scripts/verify-packed-package.mjs`, `integration/web/verify-packed.mjs` |
| Six CI checks passed against release commit | Enforced for manual release preflight | `scripts/check-release-ci.mjs` |
| npm tarball is versioned, verified as prerelease and SHA-256 identified | Enforced in release workflow preflight | `.github/workflows/release.yml` |
| Versioned notes and breaking-change migration instructions | **Maintainer review required** | `CHANGELOG.md`, [notes template](RELEASE_NOTES_TEMPLATE.md) |
| npm owner/scope control and Trusted Publisher configured | **Not configured by this implementation** | npm package Settings → Trusted publishing |
| GitHub `npm-prerelease` environment with required reviewers | **Not configured by this implementation** | Repository Settings → Environments |
| Repository variable `UF_CSS_RELEASE_ENABLED=true` | **Not set by this implementation** | Settings → Secrets and variables → Actions |
| Real device and human screen-reader review | **Still pending from Phase 09** | [TESTING.md](TESTING.md) |
| External user feedback and independent real registry install | **Pending actual prerelease** | GitHub issues and Phase 12 consumption |

**A successful tarball install is not the same thing as a published registry package.** No external prerelease installation can be claimed until a version actually exists on npm.

## Dry-run verification today

At the feature-branch checkout, using Node.js 22+:

```sh
npm ci --no-audit --no-fund
npm run verify
npm run verify:release
node scripts/verify-packed-package.mjs
```

`npm run verify:release` builds the library, checks its package metadata, runs `npm pack --dry-run --json --ignore-scripts`, checks every advertised exported JS/CSS/TypeScript path, validates CLI runtime modules, and rejects unwanted compiled tests. It does **not** create a tag, change a version, authenticate to npm or publish.

The independent packed-framework, Next.js and Expo workflows and the Playwright/axe quality workflow provide separate integration evidence. See [COMPATIBILITY.md](COMPATIBILITY.md) for what each test genuinely proves.

## Version and migration policy

The release-publishing process is still experimental. The source is versioned `1.0.0` for testing; future registry releases must follow [SemVer 2.0.0](https://semver.org/):

- **Patch** (`0.2.1`): compatible correction where no public behavior contract changes.
- **Minor** (`0.3.0`): new functionality or deliberate compatibility-breaking experimental changes. Record every breaking change and migration approach in the changelog; no implied stability before 1.0.
- **Prerelease** (`0.2.0-beta.1` then `0.2.0-beta.2`): successive reviewed candidates, each with immutable version and specific changes; use npm `beta` dist-tag, never automatically change the registry `latest` tag.
- **Source `1.0.0` for testing** is not proof of stable runtime compatibility, accessibility conformance, or a published npm release. Formal registry release is a separate decision after testing.

A TypeScript export change, removal or rename of a CSS class/custom property, change to token schema, CLI flag semantics, or adapter behavior **can be breaking**. Document compatibility and any migration for independent projects first. Pin exact prerelease versions in experiments rather than using unconstrained caret ranges.

## Maintainer-only publication procedure (not executed)

1. Review draft PR #1, API surface and distribution contents; approve a specific candidate version and complete release notes. Save `docs/releases/<version>.md` with the exact version and substantive changes, compatibility, breaking changes, verification and limitations sections, and create a dated `## [<version>] - YYYY-MM-DD` entry in `CHANGELOG.md`; the release workflow refuses missing notes. Update `package.json` **and** `package-lock.json` consistently on a reviewed branch, then merge only by explicit maintainer decision. No tag or registry action happens through the current feature-branch commits.
2. Require all six CI workflows to pass at the resulting **main-branch commit SHA**. Protect the main branch according to repository policy. Ensure the `npm-prerelease` GitHub environment exists and has required reviewers; consider preventing self-review.
3. Create `UF_CSS_RELEASE_ENABLED` as a repository Actions variable with value `true` **only when explicitly authorized to publish**. Without it the publish job is skipped.
4. Configure an npm **Trusted Publisher** for user `kingbattash`, repo `Universal-Foundation-CSS`, workflow file `release.yml`, environment `npm-prerelease`, and the direct publish permission. OIDC requires a supported npm CLI (11.5.1+); the workflow uses Node.js 24. The repository `package.json` must match the source repository. No long-lived `NPM_TOKEN` is configured. Trusted Publisher setup can be time-limited; perform setup near the authorized release. **If this npm package does not yet exist, verify the current npm account bootstrap rules manually**; do not assume a new package already has configured Trusted Publisher settings.
5. From GitHub Actions select **Manually prepare or publish npm prerelease** on **main**, enter the exact existing prerelease version from `package.json`. For a nonpublishing check, leave `confirm_publish=false`. Review the generated tarball and checksum artifact.
6. To authorize publishing, explicitly set `confirm_publish=true`, enter `PUBLISH UF-CSS PRERELEASE`, and obtain the GitHub environment approval. The workflow checks six green CI check runs, verifies package files and version equality, then publishes the approved tarball with `--tag beta --access public` via npm OIDC. It intentionally **does not create a Git tag, GitHub release, bump a version, or merge code**. Those require separate maintainer decisions.
7. After successful publication, install the exact public version into a clean independent project; verify advertised entry points and compare behavior with the tarball tests. Record npm package/version, source SHA, artifact checksum, provenance link if available, CI run, and any external issues. Only then prepare a versioned GitHub release or tag through separate approval.

**Fail-closed boundaries:** `workflow_dispatch` only, official repository only, `refs/heads/main` only, exact declared prerelease version, all six passing checks on SHA, repository opt-in variable, explicit phrase and checkbox, and `npm-prerelease` environment. Environment required-reviewer protection must actually be configured in GitHub: merely naming an environment in YAML **does not create a human approval requirement**. Official [npm trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/) and [GitHub environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments) provide setup details.

## Source and provenance cautions

OIDC trusted publishing can supply automatic npm provenance for public repositories and public packages, but **provenance is not a security audit**. Trusted publishing may require an initial package bootstrap or account-owner work outside this repository; no credentials are collected here. Never put an npm token in GitHub Actions just to bypass a failed trusted-publisher configuration.

See [SECURITY.md](../SECURITY.md), [CONTRIBUTING.md](../CONTRIBUTING.md), [RELEASE_NOTES_TEMPLATE.md](RELEASE_NOTES_TEMPLATE.md) and [COMPATIBILITY.md](COMPATIBILITY.md).
