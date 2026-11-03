# Phase 05 — Mathematical foundation and UX research

**Status:** Phase 05 reference guidance. These are tools for composing a creator-owned design system, **not a list of mandatory dimensions, grids or visual laws**. Units and measured limitations matter.

## Quantitative tools

| Function | Units / meaning | Constraint |
| --- | --- | --- |
| `modularScale(step, basePx, ratio)` | CSS px from a user-selected base and exponential ratio | ratio > 1; 4-decimal output |
| `spacingScale(steps, unitPx)` | CSS px values in authored order | steps >= 0; arbitrary creator-defined steps |
| `linearInterpolate(value, inputMin, inputMax, outputMin, outputMax, clamp)` | Generic numeric interpolation | finite values, strictly ascending input interval; reversed output valid |
| `fluidValueAt(viewportPx, minPx, maxPx, minViewportPx, maxViewportPx)` | Evaluated CSS px at viewport width | clamps outside viewport bounds |
| `fluidClamp(minPx, maxPx, minViewportPx, maxViewportPx)` | CSS `clamp()` text using `vw` | extrema in px; 5-decimal coefficient precision |
| `gridTrackLayout(containerPx, columns, gapPx, outerPaddingPx)` | CSS px track/gap dimensions | integer positive column count; no padding/gutter overflow |
| `gridSpanWidth(containerPx, columns, span, gapPx, outerPaddingPx)` | CSS px for a column span | span must be between 1 and columns |
| `goldenSplit(total)`, `goldenRectangle(longSidePx)` | Optional phi proportion | not a requirement for balanced composition |
| `fibonacci(index)`, `fibonacciRatio(index)` | Exact safe integers and ratio approximation | n <= 78 (safe integer bound) |
| `rootRectangleHeight(shortSidePx, root)` | Long side = short side × √root, CSS px | supported reference roots 2,3,4,5 |
| `ruleOfThirdsGuides(widthPx,heightPx)`, `goldenSectionGuides(...)` | Optional guide coordinates from top-left, CSS px | never apply positioning automatically |
| `relativeLuminance`, `contrastRatio`, `passesWcagAA` | WCAG 2.x opaque sRGB contrast | valid 6-digit hex only; not a full accessibility audit |

### Examples

```ts
import {
  modularScale, spacingScale, fluidClamp, fluidValueAt,
  fibonacciRatio, fittsDifficultyBits, fittsMovementTimeMs,
  gridTrackLayout, gridSpanWidth, ruleOfThirdsGuides,
} from "@kingbattash/universal-foundation-css";

// These parameters belong to the project, not UF-CSS.
const heading = modularScale(2, 18, 1.2);
const spaces = spacingScale([0, 1, 1.5, 3, 7], 6);
const fluidHeading = fluidClamp(20, 38, 360, 1440);
const atTablet = fluidValueAt(768, 20, 38, 360, 1440);
const tracks = gridTrackLayout(1200, 5, 16, 24);
const span = gridSpanWidth(1200, 5, 2, 16, 24);
const guide = ruleOfThirdsGuides(1200, 800);
const phiApprox = fibonacciRatio(15);
const bits = fittsDifficultyBits(300, 48);
// Only with calibration from relevant users/tasks/input devices:
const predictedMs = fittsMovementTimeMs(300, 48, {
  interceptMs: 120, slopeMsPerBit: 100,
});
```

Results are mathematical models. They do not mean a composition is beautiful, usable, or accessible. CSS `clamp` coefficients are rounded, so check rendered endpoints visually at the intended viewport widths. Geometric constructions do not account for content, localization, DOM reading order or touch input.

## Interaction laws: uses and limits

### Fitts's Law (quantitative with calibration)

Shannon formulation `ID = log2(1 + A/W)` returns difficulty in bits, where `A` and `W` are both CSS px if used for interface layout. `MT = a + b × ID` estimates time in milliseconds **only** when `a` (milliseconds) and `b` (milliseconds per bit) are empirically measured for the interaction, user population and pointing device. The geometric width is not automatically the experimentally determined *effective* width. Small targets or long reaches can be harder; no universal minimum button-size standard follows from Fitts's model.

Primary technical reference: I. Scott MacKenzie, [The Prediction of Pointing and Dragging Times in Graphical User Interfaces](https://www.yorku.ca/mack/IWC.html).

### Hick–Hyman (simplified, not a navigation score)

`log2(N + 1)` is a common simplified count-of-alternatives form in bits. A calibrated `a + b × log2(N+1)` can estimate reaction time in milliseconds. Familiarity, unequal choice likelihoods, scanning, context and expertise change observed behavior. Reducing the number of choices does not necessarily improve a product; hiding necessary controls can make it worse.

### Jakob's Law and Gestalt principles (qualitative)

Prior experience with other products shapes expectations, but conventions depend on context. Proximity and similarity are visual organization cues, not substitutes for HTML semantics, labels, grouping in the accessibility tree or user testing. A designer can invent a new system while retaining discoverability and predictable controls.

### Progressive disclosure and serial-position effects (qualitative)

Revealing advanced options contextually may reduce initial complexity. Do not hide important consent, costs or safety information. People may recall early/late items differently in some situations, but placing an action first or last is not a guaranteed conversion strategy. No numerical formula for these principles is exposed by UF-CSS.

Practical background: [NN/g on Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) and [Laws of UX on Jakob's Law](https://lawsofux.com/jakobs-law/).

## Accessibility is independent of aesthetics

The optional mathematical tools **never** certify WCAG conformance. For example, WCAG 2.2 SC 2.5.8 calls for pointer targets of at least **24×24 CSS px**, with several explicit exceptions (including spacing); SC 2.5.5 enhanced is stricter. Neither result is interchangeable with a Fitts's-law prediction. Test keyboard order, focus visibility, text resize, responsive reflow, labels and assistive technology as part of Phase 09.

Normative explanation: [W3C — Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).

## Phase 05 verification and scope

The tests cover source compatibility, nonnegative/finite inputs, safe-integer Fibonacci bounds, interpolation endpoints and monotonicity, arbitrary grid counts, padding/gutter overflow, exact span reconciliation and calibrated timing. The built-in 20 hierarchy references and 37 grids remain **optional catalogs**, not imposed implementations.

**Deferred:** actual user-study calibration, browser geometry screenshots, assistive technology/device validation and full historical grid construction guides. Those belong to subsequent phases.
