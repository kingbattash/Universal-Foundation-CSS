# Phase 08 — Accessible component contracts (framework-neutral)

UF-CSS defines **what an interaction must accomplish**, not how a product must look. Its contracts are TypeScript guidance, not ready-made rendered React, React Native, Bootstrap or Web Components. All project brands, colors, sizes, icons, layout, typography, animation and naming belong to the consumer. No component is required.

## Ten optional component contracts

| Contract | User task | Web native starting point | React Native starting point |
| --- | --- | --- | --- |
| Button | Trigger action | `<button>` | `Pressable`/`Button` with role and label |
| Text field | Enter text | `<label>` + `<input>` | `TextInput`, visible label, accessible errors |
| Select | Pick a value | `<select>` before complex custom combobox | Picker or accessible selection sheet |
| Feedback | Report progress/results | `role=status` or `role=alert` when appropriate | Visible message + native accessibility announcement |
| Tabs | Switch local panels | `tablist`, `tab`, `tabpanel` with associations | Accessible tabs or segmented selection |
| Dialog | Modal decision | Native `<dialog>.showModal()` | Accessible `Modal`/navigation modal |
| Navigation | Wayfinding | `<nav>` and links | Native navigation with selected route semantics |
| List | Read collection | `<ul>`/`<ol>` | `FlatList` or appropriate semantic list |
| Table | Compare records | Native `<table>` with scope/caption | Accessible records list with column context |
| Card | Group content | Semantic article/section/div as appropriate | Semantic content group, separate actionable children |

The existing `componentContracts` API (including `button`, `textField`, `tabs`, `dialog`, and `card`) remains intact. Each of the ten now has a `componentSpecifications` entry with `task`, `web`, `native`, `keyboard`, `screenReader`, `stateReview`, `constraints` and `support`. `getComponentSpecification("tabs")` reads one.

### Actual behavior that matters

**Button.** Preserve accessible name and keyboard operation. Prevent duplicate submissions when busy. A disabled control may need a visible explanation. Only report success after the operation resolves.

**Input and select.** A placeholder is not a persistent label; expose required/invalid state and associated text. Prefer platform native controls over rewriting complete combobox behavior.

**Tabs.** For *manual activation*, Left/Right arrows move focus via roving tab index, while Enter/Space activates the focused panel. The selected tab has `aria-selected=true`; each tab has `aria-controls` and each panel `aria-labelledby`. Automatic activation is a separate valid mode for lightweight panels, but must not be silently mixed with manual mode. See [WAI-ARIA APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

**Dialog.** A modal should be named, distinguishable from inert background, keyboard accessible, and return focus to an appropriate trigger or following task. On web, native `showModal()` manages much of the focus behavior; custom overlays need explicit focus traps, inertness and escape behavior. See [WAI-ARIA APG Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

**Navigation.** Use links for destinations, buttons for actions; name repeated nav landmarks and expose current route beyond color.

**Table and list.** Use tabular semantics for relational rows/columns, accessible header associations, and a usable scroll region for narrow viewports. Sorting should expose state and not unexpectedly lose focus. Lists require stable item identity and meaningful sequence.

**Feedback.** Use readable error/progress/success text and an appropriate live-region strategy when relevant. A spinner or colored badge alone is insufficient, and success must follow confirmed completion.

### A minimal framework-independent operation model

```ts
import {transitionOperation} from "@kingbattash/universal-foundation-css";

const running = transitionOperation("idle","start");
// running.next === "loading"; render the busy state.
// Only the actual operation's successful completion should trigger:
const confirmed = transitionOperation(running.next,"resolve");
// confirmed.next === "success"

// Rejection: transitionOperation("loading","reject") -> error
// No matches: transitionOperation("loading","no-results") -> empty
// Invalid: transitionOperation("idle","resolve") throws RangeError
```

This API validates state transitions, **not** promises, network requests, form submission, React state or authorization. Callers decide when completion is confirmed. The supported states are `idle`, `loading`, `success`, `error`, `empty`, `disabled`. Their applicability varies by control; a card is not required to have every state. `transitionOperation` is pure and never calls external APIs.

For a completely original component contract:

```ts
import {defineComponentContract} from "@kingbattash/universal-foundation-css";

const custom = defineComponentContract({
  id:"custom-workflow",
  task:"Let a researcher select a comparison method",
  requiredStates:["idle","loading","error","disabled"],
  webBehavior:"A labelled fieldset and confirmation button",
  nativeBehavior:"Accessible radio selection and a named action",
  checks:["Selected method is announced","Errors retain the user's choice"],
});
```

Custom contracts do not inherit a built-in appearance, font, color or grid, and may have an empty state/check list.

## Web demonstration

- `examples/components/workflow.html`: manual-activation tabs, a native modal dialog, native labels/inputs/select and local validation. **No real submission occurs.** The form's completion message explicitly says the operation was local.
- `examples/components/records.html`: labelled filters, clearing filters, sortable table with `aria-sort`, scrollable table region, list semantics, accessible empty state and live feedback.
- `examples/components/native-mapping.md`: equivalent tasks on web versus native/Expo; **not an executable native renderer**.

These are small reference interactions only, not a fixed UI kit or recommended brand styling. Inline CSS in each HTML specimen is exclusively its own example identity, not library defaults.

## Quality gates and limits

The Phase 08 tests verify the contract inventory, state-machine edges, custom-contract validation, basic markup semantics, script syntax and optional CSS isolation. They **do not** exercise a real browser's focus order, screen reader, modal focus restoration, device keyboard or semantic tree. Actual Playwright/keyboard, reflow/zoom, assistive-technology and native-device checks belong to **Phase 09**. Do not treat a passing TypeScript test as WCAG conformance.

Normative background: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/).
