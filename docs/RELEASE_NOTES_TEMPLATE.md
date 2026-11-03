# UF-CSS <approved-version>

**Source commit:** `<verified-main-sha>`  
**Publication status:** DRAFT — not yet published  
**Review date:** `<date>`

## Changes
- Describe the optional capabilities included in this exact candidate.

## Compatibility
- Name Node, browser, Tailwind, Bootstrap, StyleX and Expo consumer boundaries where applicable.
- State that the package is a construction toolkit, not a mandatory UI design system.

## Breaking changes
- State “None” or list every changed export, token schema, CSS hook, framework mapping and migration.

## Verification
- Record all six GitHub checks on the exact main commit SHA, the tarball file count, checksums and independent packed install evidence.

## Remaining limitations
- Explicitly record any pending real-device, screen-reader and native browser zoom tests, and that this is not WCAG certification.

---

Only after a maintainer approves a version, save an edited, placeholder-free copy as `docs/releases/<approved-version>.md`, and create a dated `## [<approved-version>] - YYYY-MM-DD` entry in `CHANGELOG.md`. The manual prerelease workflow refuses to publish without matching, substantive release notes. Never mark a version as published until npm registry verification confirms it.
