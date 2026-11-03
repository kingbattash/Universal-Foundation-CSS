# Phase 06 — semantic and hierarchy creation guide

**UF-CSS does not prescribe a hierarchy.** Its 20 reference entries are an expandable *working catalog*, not a scientific count of independent hierarchy laws. Five communication, five structural and three interactive entries describe broad concerns; seven visual-technique entries describe ways to express those concerns.

## What is actually implemented

| Feature | Status | Ownership |
| --- | --- | --- |
| 20 predefined hierarchy references | Annotated specification catalog, **all 20 covered** | Optional UF-CSS guidance |
| Priority logic, relationships, constraints, examples and anti-patterns | Typed specification for each entry | Optional guidance; users may ignore |
| Custom creator-defined hierarchy | Validated TS API, no mandatory references or palette | User project |
| Optional CSS strategies | Explicit CSS import, variable-driven hooks | User supplies actual font, color and spacing values |
| Document/navigation/state/accessibility semantic vocabulary | Optional term registry, creator-defined alternatives supported | User |
| Source/visual order comparison | Static audit from *caller-supplied orders*, **not browser test** | User supplies layout samples |
| Screenshot, keyboard and screen reader verification | Not implemented in this phase | Phase 09 |

## 20 specifications in four families

These entries should be read as **overlapping practical perspectives**:

- Communication: visual, typographic, content, semantic, information.
- Structural: layout, spatial, navigation, component, grouping.
- Visual techniques: size, weight, color, contrast, spacing, depth, motion.
- Interactive: interaction, state-feedback, responsive.

Use `getHierarchySpecification("typographic")` or `hierarchySpecifications` to read a particular item's `priorityRule`, `relationships`, `constraints`, `example`, `antiPattern`, `strategies` and `support`. The `support` field is `guidance` or `css-hook`; no category becomes a ready-made UI component merely by being listed.

A visual technique is not an independent semantic structure. Font size can express heading importance, for example, but the heading element and reading order must still convey actual meaning.

## Create your own, with no required template

```ts
import {
  createHierarchySystem, sortHierarchyLevels, defineSemanticRoles,
} from "@kingbattash/universal-foundation-css";

const system = createHierarchySystem({
  id: "team's-own-system",
  name: "Task-focused reporting",
  levels: [
    { id: "evidence", label: "Evidence", priority: 3, strategies: ["custom-monospace"] },
    { id: "decision", label: "Decision", priority: 1, semanticRole: "executive-action" },
    { id: "context", label: "Context", priority: 2 },
  ],
  relationships: [
    { from: "decision", to: "context", kind: "sequence", reason: "Explain decision before context" },
    { from: "context", to: "evidence", kind: "dependency", reason: "Evidence supports the context" },
  ],
});
const priorityOrder = sortHierarchyLevels(system); // decision, context, evidence
const semanticRoles = defineSemanticRoles(["executive-action", "context", "data-point"]);
```

Priority is a project-owned integer: **smaller numbers mean greater prominence** to this opt-in API; ties keep creator-authored order. This is *not* equivalent to screen-reader or focus order. `sequence` and `dependency` relationships are checked for cycles; grouping and emphasis relations may be bidirectional. References must exist and exact IDs must be unique. Style strategy names are unrestricted strings, not forced keys from UF-CSS's example strategy catalog. Inputs are validated and copied/frozen; unrelated project files are never modified.

A system with `levels: []` is valid. No developer must choose any of the built-in twenty names.

## Optional styling hooks for CSS, Tailwind, Bootstrap and other clients

To use just the optional Vanilla CSS hooks:

```css
@import "@kingbattash/universal-foundation-css/hierarchy.css";

/* These values belong to the consumer project, not UF-CSS. */
.page-title { --uf-h-size: clamp(1.8rem, 4vw, 3rem); --uf-h-weight: 700; }
.report-regions { --uf-h-column-min: 19rem; --uf-h-flow-gap: 1.25rem; }
```

```html
<h1 class="uf-h-level page-title">Example page heading</h1>
<div class="uf-h-flow report-regions">...</div>
```

| Hook | User-owned customization |
| --- | --- |
| `.uf-h-level` | `--uf-h-size`, `--uf-h-weight`, `--uf-h-line-height` |
| `.uf-h-emphasis` | `--uf-h-color`, `--uf-h-emphasis-weight` |
| `.uf-h-measure` | `--uf-h-reading-max` |
| `.uf-h-group` | `--uf-h-group-gap` |
| `.uf-h-flow` | `--uf-h-flow-gap`, `--uf-h-column-min` |
| `.uf-h-layer` | Stacking context only, not modal semantics/focus management |
| `.uf-h-state` | `--uf-h-state-border`, `--uf-h-state-padding` |
| `.uf-h-motion` | `--uf-h-motion-property`, `--uf-h-motion-duration`, `--uf-h-motion-easing`; reduced-motion disable |

Other strategies are meaningful semantics and do **not** have CSS hooks (e.g. native landmarks and DOM order). The opt-in CSS does not require Tailwind, React, Bootstrap or StyleX; apps may instead implement their own styles or map exactly these semantic choices into their preferred framework. Do not import these styles unless explicitly wanted, and do not change the creator's package or theme during automatic generation.

## Responsive source order: static validation, not browser certification

`auditReadingOrder({ nodes, viewports })` compares author-supplied DOM identifiers against corresponding expected visual orders, and reports missing, duplicate and unexpected nodes as **errors**. Divergence from DOM and focusable-source sequence is reported as **warnings**, because not all differences are necessarily inaccessible. This utility cannot inspect actual browser layout, focusability, ARIA or CSS reordering. Supply measured or otherwise manually verified visual order for credible audit results.

```ts
import { auditReadingOrder } from "@kingbattash/universal-foundation-css";
const issues = auditReadingOrder({
  nodes: [{ id: "heading" }, { id: "action", focusable: true }, { id: "detail" }],
  viewports: [
    { widthPx: 320, visualOrder: ["heading", "action", "detail"] },
    { widthPx: 1440, visualOrder: ["heading", "detail", "action"] },
  ],
});
// A 1440px visual/DOM divergence warning, not a WCAG pass/fail.
```

Two independent examples are in `examples/hierarchy/`: `product-summary.html` (sans-serif task-first content) and `article.html` (long-form editorial). Their DOM marker order is exercised against `layouts.json` at 320, 768 and 1440 CSS px. These fixture assertions **do not** establish rendered behavior at those sizes.

## Accessibility and design freedom

Hierarchy must support semantic HTML, clear instructions, readable contrast, keyboard access, visible focus, predictable interaction and meaning that survives color changes, device sizes and assistive technology. None of these requirements forces a typeface, fixed spacing increment, palette or geometric grid. A text-size formula can express a level but cannot prove comprehension. Complete browser screenshot, keyboard navigation, zoom/reflow and assistive-technology inspections belong to Phase 09.

See [PHILOSOPHY.md](PHILOSOPHY.md), [RESEARCH.md](RESEARCH.md), [GRIDS.md](GRIDS.md) and the full [implementation plan](IMPLEMENTATION_PLAN.md).
