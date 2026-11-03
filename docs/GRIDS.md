# Grid systems: choose, don't collect

UF-CSS currently registers **37** useful layout and composition entries. Not all 37 are browser-implemented grids.

| Family | Count | Scope |
| --- | ---: | --- |
| Web | 8 | Responsive columns, fixed/fluid grids, subgrid, bento, masonry |
| Editorial | 9 | Manuscript, column, modular, baseline, nested, axial, radial and other editorial arrangements |
| Geometric | 12 | Rule of thirds, Phi, golden spiral, Fibonacci, diagonals, square-root constructions |
| Classical | 6 | Golden canon, Van de Graaf, Rosarivo, Villard, golden section, root rectangle |
| Spacing | 2 | Four-point and eight-point spacing rhythms |

`src/grid/registry.ts` is the authoritative source of names and statuses.

## Support levels

- `css-recipe`: supported in the initial optional CSS adapter in a **basic** form (e.g., twelve-column, responsive auto-fit, and editorial columns).
- `mathematical`: can be expressed through the core formula helpers; **not necessarily** an on-screen guide overlay.
- `reference`: conceptual/historical reference; **no CSS implementation** is promised.

## Selecting for a project

| Project need | Suggested starting point |
| --- | --- |
| Marketing or corporate site | Responsive or twelve-column |
| Long-form research/document | Manuscript and baseline rhythm |
| Operational dashboard | Column layout + appropriate modular grouping |
| Photography/art direction | Rule of thirds or golden-section composition |
| Editorial spread | Asymmetric or hierarchical grid, subject to readability |
| Mobile screen | Responsive, content-led stacking; maintain DOM order |

The golden ratio is optional. Accessibility, content fit, keyboard reading order and localization take precedence over an attractive geometric overlay.
