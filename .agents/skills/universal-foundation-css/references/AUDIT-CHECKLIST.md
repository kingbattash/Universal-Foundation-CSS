# Audit checklist: web / mobile / project consistency

Compare **meaning and behavior**, not pixel-identical screens.

## Before reviewing any designs
- Run `uf-css audit --project PATH --format json` from the approved project scope.
- Verify framework versions, project root, ignored paths and `coverage.truncated`. An unknown stack stays unmodified until reviewed.
- Record token conflicts and intentional light/dark overrides separately; never bulk-replace values based on heuristics.
- No code edits, installs or output writes follow automatically from an audit.

## Foundation
- Are font-role names and semantic colors consistent? Actual font families may vary intentionally by platform.
- Are spacing scale, radii, density and motion centralized? Are exceptions documented?
- Are token values duplicated in CSS, TS and native code without generation?

## Hierarchy and layout
- Is the primary task obvious before and after responsive collapse?
- Does the DOM/accessibility order match the intended information hierarchy?
- Are breakpoints, containers, reading measure and selected grids justified?
- Are classical canons and composition guides optional, not forced?

## Interaction
- Are web/mobile buttons labeled the same way for equivalent actions?
- Do disabled, loading, error, success, empty and offline states behave consistently?
- Do search, filtering, pagination and navigation follow one feature contract?
- Can the primary workflow be completed with keyboard, touch and assistive technology?

## Evidence
- Contrast 4.5:1 normal text, 3:1 large text unless exceptions apply.
- Test keyboard focus, reduced motion, long text, localization and zoom.
- Compare screenshots at a few representative widths/devices; do not claim equivalence without tests.

## Report format
| Area | Web | Mobile | Shared decision | Intentional difference? | Severity | Proposed fix |
| --- | --- | --- | --- | --- | --- | --- |

Prioritize user-task failures and duplicated sources of truth before surface styling.
