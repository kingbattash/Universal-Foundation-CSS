# RFC — Universal Foundation CSS v1.1.0: Complete Design-System Automation

**Status:** Proposal only · **Target:** potential v1.1.0 minor release · **Date:** 2026-11-04  
**Implementation:** Not started in UF-CSS · **Current released source:** v1.0.0 on main  
**Origin:** AMGYNA/AmyMail web + mobile adoption exposes gaps in the current \`uf-css init\` output.

## Executive decision

UF-CSS should automate construction of **user-defined** design systems beyond a one-unit token scaffold. Its current wizard accepts palette roles, a base type size, one spacing unit, optional grid names and hierarchy labels, then generates a handful of StyleX/React Native declarations. It does **not** generate complete spacing/type scales, light/dark semantic themes, practical composition recipes, components or portable packages. This RFC closes that gap without making UF-CSS an opinionated UI kit.

**Primary user story:** A creator inspects an existing web/mobile project; chooses its own design decisions; previews exactly what will change; and receives a usable, validated, package-structured design-system workspace with opt-in StyleX and native adapters.

**Non-goals:** prescribing AMGYNA styling in the generic UF-CSS library; enforcing Tailwind/shadcn/Bootstrap; blindly rewriting existing apps; installing dependencies without consent; making React Native run DOM StyleX; generating fake production-ready components or accessibility claims; replacing existing auth/domain logic.

## Gaps measured in AMGYNA

1. Current generated StyleX file defines ~14 scalar variables and the native file mirrors them; *no* semantic multi-mode theme.
2. Spacing input \`unitPx: 4\` emits \`spacing.unit\` only, not the existing AmyMail scale (2,4,6,8,10,12,14,16,20,24,28,32,36,40,44,48,56,64,80,96,128,160,192), density roles and responsive gaps.
3. Existing AmyMail typography includes Outfit, Urbanist, Onest, Inter and Segoe fallbacks; generated output does not implement real font loading or text roles.
4. A selected \`twelve-column\` or \`mail-workbench\` currently means JSON intent only when frameworks are \`stylex,react-native\`. No usable StyleX \`gridTemplateColumns\` or native Flexbox recipes.
5. \`typographic,visual,information,structural,interaction\` hierarchy choices are labels, not validated task-oriented specs or examples.
6. Existing application tokens conflict across web/mobile: blue names map to monochrome on mobile; success/error meanings vary; dark mode is hardcoded off in the current Expo app.
7. Current output has no installable workspace packages, CLI-generated component primitives, consumer integration verification, or regression-test baseline.

## Proposed CLI and workflow

\`\`\`sh
uf-css audit --project ../amy/f/web --format json
uf-css audit --project ../amy/f/mobile --format json
uf-css init --config amgyna.config.json --out ./amgyna-design-system --dry-run
uf-css expand --config amgyna.config.json --out ./amgyna-design-system --dry-run
uf-css expand --config amgyna.config.json --out ./amgyna-design-system --yes
uf-css validate --project ./amgyna-design-system
uf-css integrate --project ../amy/f/web --system ./amgyna-design-system --dry-run
\`\`\`

All \`expand\`, \`validate\`, \`integrate\` commands above are **proposals**, not available CLI commands in v1.0.0. Existing \`init\` and \`audit\` remain backward-compatible.

**Safety:** \`audit\`/\`validate\` are inspect-only; \`--dry-run\` is always read-only; explicit \`--yes\` requires a reviewed config; \`--force\` applies only to exact generated files, with a before/after diff and backups when migration touches existing code; skip symlinks, environment files and dependency dirs; never run code in inspected repositories; never auto-install packages or silently change a styling framework. Make every change undoable; refuse ambiguous framework detection.

## Proposed schema v2: composable, still opt-in

\`\`\`json
{
  "schemaVersion": 2,
  "name": "my-owned-system",
  "frameworks": ["stylex", "react-native"],
  "design": {
    "colors": {
      "primitives": {"ink": "#050505", "canvas": "#FFFFFF"},
      "semantic": {
        "light": {"text": "{colors.primitives.ink}", "background": "{colors.primitives.canvas}"},
        "dark": {"text": "#FAFAFA", "background": "#101114"}
      }
    },
    "typography": {
      "families": {"heading": "Outfit", "body": "Urbanist"},
      "baseSizePx": 16,
      "scales": {"body": 16, "label": 14, "title": 24, "display": 48},
      "weights": {"regular": 400, "medium": 500, "semibold": 600, "bold": 700}
    },
    "spacing": {
      "unitPx": 4,
      "steps": [0,2,4,6,8,12,16,20,24,32,40,48,64,80,96],
      "semantic": {"inline": 8, "field": 24, "section": 48}
    },
    "radii": {"sm": 4, "md": 8, "lg": 12, "full": 9999},
    "motion": {"fastMs": 100, "normalMs": 200, "slowMs": 400},
    "grids": {
      "layouts": [{"id":"twelve-column"},{"id":"manuscript"},{"id":"custom","name":"mail-workbench","columns":3}],
      "guides": ["baseline","golden-ratio","rule-of-thirds"]
    },
    "hierarchy": ["typographic","visual","information","structural","interaction"],
    "components": ["button","text-field","card","tabs"],
    "patterns": ["auth","message-list","message-reader"]
  },
  "distribution": {"workspace": "pnpm", "targets": ["stylex-web","native-expo"]}
}
\`\`\`

This is an **illustration of the proposed schema**, not yet a supported input. \`schemaVersion:1\` must continue to work and must not have unapproved defaults. Tokens stay system-owned, not tool-owned.

## Target output

\`\`\`text
my-owned-system/
  design-system.config.json
  tokens/source.tokens.json              # canonical, typed values
  packages/
    tokens/{primitives,semantic,spacing,typography,motion}/
    stylex/{themes,layout,components}/
    native/{themes,layout,components}/
    patterns/{auth,messages}/
  examples/
    nextjs/
    expo/
  docs/{FOUNDATIONS,ACCESSIBILITY,MIGRATION}.md
  scripts/{build,check,preview}.mjs
  tests/{token-parity,semantic,layouts,components}.test.mjs
\`\`\`

Generated source must be **auditable and editable**. Separate user-authored sources and generated targets. Emit deterministic output with normalized ordering. Do not overwrite edits without explicit consent.

## Ten implementation milestones

| Phase | Delivery | Acceptance gate |
| --- | --- | --- |
| 1. Audit and migration inventory | Existing token/file/component inventory, duplicate and conflict report, proposed mapping | Never mutates projects; handles mixed web/native safely |
| 2. Schema v2 and schema v1 migration | Typed configuration validation, canonical token resolution, error diagnostics | No implicit design selections; 1→2 migration previews diffs |
| 3. Complete foundations | Optional primitive, semantic, spacing, radius, typography, motion and elevation scales | Every selected role appears in generated adapters; parity tests |
| 4. Themes and accessibility | Light/dark/high-contrast as configured, contrast reports, semantic status tokens | No false WCAG guarantee; semantic colors validated per mode |
| 5. Responsive layout engines | StyleX 12/8/manuscript/modular/custom grids; RN Flexbox/width recipes; content bounds | Practical device/desktop examples, no imaginary CSS grid on RN |
| 6. Hierarchy and guide contracts | Five hierarchy specifications + baseline/golden ratio/rule of thirds/custom guides | Rendered examples where feasible; conceptual guides labelled |
| 7. Component scaffolds | Optional role-based button, field, card, tabs, dialogs; distinct DOM/native implementations | Keyboard/focus and touch-target assertions; no shadcn dependency |
| 8. Domain patterns | User-selected auth, inbox, reader, settings and dashboard patterns | Patterns use semantic tokens, not fixed branding or business logic |
| 9. Distribution and consumers | Workspace setup, controlled peer dependencies, StyleX compiler instructions, Next.js/Expo fixtures | Verified clean app consumes exact built files; no auto install |
| 10. Governance and release | Snapshot/regression tests, performance/contrast checks, review gates, changelog and docs | CI across both targets; separate human/real device testing gates |

## StyleX and React Native compatibility

- **Web:** Generate \`stylex.defineVars\`, optional \`stylex.createTheme\`, and statically analyzable \`stylex.create\` recipes; application build must configure the actual StyleX compiler and CSS extraction. Do not claim an unconfigured Next.js project can run compiled StyleX.
- **Mobile:** Generate numeric/color tokens and React Native \`StyleSheet\`/\`Pressable\` components with safe-area, text scaling, and platform behavior guidance. Do **not** import StyleX web runtime into native screens as though it compiled to React Native.
- **Parity:** semantic roles and behavior contracts shared; platform implementations differ intentionally.
- **Optional:** vanilla, Tailwind and Bootstrap remain supported only if explicitly selected; no stack is mandatory.
- **Typography:** provide font role references, not silent network font downloads or a promise fonts are installed.

## First proving ground: AMGYNA

Use [AMGYNA design system](https://github.com/kingbattash/amgyna-design-system) as the independent consumer. Its first milestone will implement a single canonical set of spacing, radius, typography, palette and semantic theme definitions plus **web StyleX and React Native adapters**. Then build task-specific layouts and component contracts. The AMGYNA implementation must remain independent of this RFC and must not be copied into UF-CSS as a mandatory preset.

## Out of scope until separately approved

- Any new UF-CSS code, release, tag or version bump.
- Migrating all three AMGYNA apps or removing their dependencies automatically.
- Published npm version and any stable certification.
- Native device testing that was not actually performed.

**Definition of done:** a user supplies their own config and obtains a complete, tested, accessible-by-design *starting system*, can preview and inspect all generated changes, and successfully consumes it in a clean Next.js/Expo pair without copying UF-CSS's own branding.
