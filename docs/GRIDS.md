# Grid systems — independent choices, tested recipes and historical references

UF-CSS is a **grid-creation toolkit**, not a mandatory 12-column system. Consumers may choose zero, one, or several grids—or create a totally new weighted, responsive or compositional system. None of the foundation's example font, color, spacing, grid, or hierarchy choices are required.

## The 37-entry reference catalog

| Family | Count | Main topics |
| --- | ---: | --- |
| Web | 8 | 12-column, responsive, fluid, fixed, adaptive, subgrid, Bento, masonry |
| Editorial | 9 | Manuscript, columns, modular, baseline, hierarchical, asymmetric, nested, axial and radial |
| Geometric | 12 | Thirds, phi, diagonals, root rectangles and other optional constructions |
| Classical | 6 | Golden Canon, Van de Graaf, Rosarivo, Villard, golden section and root rectangles |
| Spacing | 2 | Optional 4/8-point rhythms |

Every registered grid has an explicit `support`, `use`, `caution` and `referenceNote`. Only entries marked `css-recipe` have a `cssSelector`. This distinction prevents a historical reference being misrepresented as a production-ready CSS system.

- **CSS recipes:** twelve-column, responsive-grid, fluid-grid, fixed-grid, adaptive-grid, subgrid, bento-grid, manuscript, column, modular, baseline, nested.
- **Mathematical or geometric references:** rule-of-thirds, phi, golden-triangle (only simple line segments), diagonal-method (only diagonal segments), root-2/3/4/5, golden-section, root-rectangle, four-point and eight-point.
- **Reference only:** masonry-grid (actual masonry), golden-spiral, Fibonacci *placement*, dynamic-symmetry, harmonic-armature, hierarchical, asymmetric, axial, radial, golden-canon, van-de-graaf, rosarivo, villard.

## Import only the CSS recipes you choose

```css
@import "@kingbattash/universal-foundation-css/grid.css";
/* User-owned sizing, never mandatory library values. */
.dashboard { --uf-g-gap: 1rem; --uf-g-min-track: 18rem; }
.article { --uf-g-reading-max: 68ch; --uf-g-page-padding: 2rem; }
```

```html
<section class="uf-g-auto dashboard">...</section>
<article class="uf-g-manuscript article">...</article>
```

| CSS class | Recipe |
| --- | --- |
| `.uf-g-grid`, `.uf-g-12`, `.uf-g-8` | Optional reference column layouts, single-column fallback below 48rem |
| `.uf-g-auto` | Auto-fit content-driven columns using `--uf-g-min-track` |
| `.uf-g-fluid` | Creator-selected equal-width count via `--uf-g-count` |
| `.uf-g-fixed` | Centered maximum inline size via `--uf-g-max` and `--uf-g-padding` |
| `.uf-g-adaptive` | Example narrow/wide grid counts (creator may replace breakpoint) |
| `.uf-g-nested` | Independent nested track system |
| `.uf-g-subgrid` | Real `subgrid` where supported; independent track fallback |
| `.uf-g-bento` | Row-major grid with optional wider spans; no dense auto-reordering |
| `.uf-g-manuscript` | Optional constrained text area |
| `.uf-g-column` | Multi-column editorial flow (review reading and tab order) |
| `.uf-g-modular` | User-defined columns and minimum row height |
| `.uf-g-baseline` | User-chosen line height only, not fully automated baseline alignment |
| `.uf-g-masonry-fallback` | **Regular CSS Grid**, not actual masonry/grid-lanes |

The fixed 48rem breakpoint occurs only inside opt-in reference recipes; custom CSS and the typed API allow original breakpoint choices. Recipes impose no brand palette, typography or global reset. The main foundation.css does **not** automatically import grid.css.

CSS subgrid is broadly available, but a subgrid child must span parent tracks. We use `@supports (grid-template-columns: subgrid)` for a guarded enhancement and independent grid fallback. See [MDN subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid).

**Masonry:** Native grid-lanes remains experimental and is not available in every major browser. UF-CSS intentionally provides a normal-grid fallback only, leaving actual masonry marked reference. See [MDN grid lanes](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Grid_lanes).

## Author a completely independent grid system

```ts
import {createGridSystem, resolveCreatorGrid, renderCreatorGridCss}
  from "@kingbattash/universal-foundation-css";

const system = createGridSystem({
  id: "studio",
  grids: [
    {kind:"tracks", id:"dashboard", name:"Our grid",
      weights:[1], gapPx:12, paddingPx:16,
      breakpoints:[
        {minViewportPx:640, weights:[2,1]},
        {minViewportPx:1100, weights:[2,1,3]},
      ]},
    {kind:"composition", id:"own-guides", name:"Original guides",
      guides:[{axis:"x",ratio:0.37},{axis:"y",ratio:0.62}]},
  ],
});
const geometry = resolveCreatorGrid(system,"dashboard",800,800);
const output = renderCreatorGridCss(system); // caller decides whether/where to write
```

This generates a CSS selector `.uf-cg-studio-dashboard` with only the supplied weighted tracks and breakpoints. Composition guides stay data-only. CSS IDs are validated against injection; numeric input and ordered breakpoints are checked, and geometry rejects overflowing padding/gaps. `createGridSystem({id:"empty",grids:[]})` is valid. There is **no implicit file write**, mandatory adapter or starter system. The CLI's initial `uf-css init` wizard remains a separate simpler interface; visual grid editing remains later work.

Pure TypeScript geometry includes `weightedTrackLayout`, `fixedContainerWidth`, `autoFitColumnCount`, `manuscriptGeometry`, `baselinePositions`, `compositionGuides`, `diagonalGuides`, `goldenTriangleGuides` and `rootRectangleGuide`. These calculate dimensions and lines; they do not impose designs.

## Classical canons: researched references, not invented implementations

Van de Graaf page construction is associated with diagonals and typographic area, and Raúl Rosarivo with reconstructions based on ninths. Villard de Honnecourt is a historical construction/division reference. Tschichold's golden page canon concerns specific historical proportions: **2:3 is not mathematically equal to φ**. No universal browser algorithm reproducing all historical variants is claimed. For research, consult [Typography and proportions (OERT)](https://www.oert.org/en/typography-and-proportions/) and [Medical Writing, vol. 22 no. 1](https://journal.emwa.org/media/2239/v22i1.pdf). The exported `classicalCanonReferences` deliberately preserves these distinctions.

## Testing and limits

`examples/grids/operations.html` and `examples/grids/editorial.html` demonstrate different creator-owned styles, long content and source-first layouts. `layouts.json` records matching source order at 320/768/1440 CSS px for **static** assertions. Unit tests check numerical reconstruction, custom responsive selection, serialization safety, and overflow constraints. Real Tailwind v4 and Bootstrap compilation plus a packed CSS import exercise the optional recipe export.

**Not tested by these fixtures:** actual rendered screenshots at specific viewport widths, 200%/400% browser zoom, real keyboard focus, RTL, screen-reader output, and physical devices. Those are Phase 09 acceptance work. Geometric harmony does not override reading order, accessibility or content fit.
