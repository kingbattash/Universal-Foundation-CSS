# Phase 08 — Task patterns and optional composition recipes

A pattern describes a user task and **meaningful reading order**. It is not an unchangeable page template, component library, design system, forced grid or trademarked visual language.

## Ten reference patterns

The original five IDs (`hero`, `article`, `dashboard`, `form`, `collection`) remain available. Phase 08 adds `section`, `editorial-split`, `filters`, `table`, and `auth`.

| Pattern | Primary task | Behavior to preserve |
| --- | --- | --- |
| Hero | Explain the product/page promise | Meaningful heading, evidence, relevant action |
| Article | Support sustained reading | Native headings, sources, captions and usable measure |
| Dashboard | Support decisions | Exceptions and actions are accessible before noncritical metrics |
| Form | Complete a task | Labels, validation, submission and accurate feedback |
| Collection | Browse comparable items | Reachable filters, stable items, empty/loading states |
| Section | Group a coherent topic | Named heading and logical reading sequence |
| Editorial split | Pair narrative and evidence | Content order survives reflow and zoom |
| Filters | Refine results | Labels, applied summary, clear/reset action |
| Table | Inspect relational records | Headers, sort state, table keyboard scrolling where needed |
| Authentication | Secure sign-in/recovery | Password-manager support, clear errors and real completion confirmation |

Each `patternSpecifications[id]` provides `webSemantics`, `nativeEquivalent`, `reviewStates`, `responsiveRule`, and `caution`. The `suggestedGrids` in `patterns` are **optional references only**; none is ever applied automatically.

```ts
import {getPatternSpecification,definePattern}
  from "@kingbattash/universal-foundation-css";

const advice = getPatternSpecification("table");
const original = definePattern({
  id:"research-outline",
  purpose:"Prioritize scholarly decisions and evidence",
  readingOrder:["question","evidence","limits","conclusion"],
  reviewStates:["loading","error","empty"],
});
```

`definePattern` validates printable names, duplicate reading-order IDs and states; it never imposes a grid, hierarchy category, CSS class, color, font or interaction technique.

## Optional CSS helpers

```css
@import "@kingbattash/universal-foundation-css/patterns.css";

/* All the following values are your own, not UF-CSS requirements. */
.workspace { --uf-p-gap: 1.25rem; --uf-p-dashboard-min: 20rem; }
.editorial { --uf-p-split-min: 23rem; }
.credentials { --uf-p-auth-max: 30rem; --uf-p-field-gap: .8rem; }
```

- `.uf-p-section`: minimal containment only.
- `.uf-p-split`: responsive split that keeps DOM order intact.
- `.uf-p-toolbar`: flexible, wrapping toolbar without aesthetic requirements.
- `.uf-p-dashboard`: content-driven grid for independent regions.
- `.uf-p-table-scroll`: keyboard-reachable horizontal scroll *when its element is given appropriate `tabindex`, label and context*.
- `.uf-p-auth`: optional maximum inline size for a sign-in area.
- `.uf-p-fields`: basic stacked form fields.
- `.uf-p-feedback`: wrap long feedback text.

No global HTML reset, fonts, brand tokens, button backgrounds or shared design aesthetics are introduced. `./patterns.css` must be imported explicitly; it is not injected into `./css`, `./grid.css` or native apps. The semantic contract can instead be implemented with Tailwind, Bootstrap, StyleX, Vanilla CSS, or a product's own components.

These classes provide **layout only**, never tab interactions, dialog focus management, form validation or network behavior.

## Responsive semantics and future verification

Keep DOM/source order meaningful even when layout changes at tablet or desktop sizes. Avoid CSS visual reordering that contradicts keyboard focus. Allow long translated strings and 200%/400% zoom, and confirm that the virtual keyboard does not cover credentials on native.

Phase 08's examples and tests prove only *source structure and compilation*. Real rendered behavior, keyboard checks, assistive technology, RTL and native devices are the scope of Phase 09. See [COMPONENTS.md](COMPONENTS.md), [HIERARCHY.md](HIERARCHY.md), [GRIDS.md](GRIDS.md), and [PHILOSOPHY.md](PHILOSOPHY.md).
