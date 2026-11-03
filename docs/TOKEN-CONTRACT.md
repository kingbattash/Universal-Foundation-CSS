# Token contract — Phase 02

**UF-CSS is a toolkit for creating original design systems, not a prescribed design system.** The values in `tokens/source.tokens.json` belong to the **optional neutral starter**. A consumer can instead create a completely independent DTCG-style file and generate adapters with no starter inheritance.

## Two mutually independent generation modes

| Mode | Authoritative source | Command | Effect |
| --- | --- | --- | --- |
| Neutral example | `tokens/source.tokens.json` in this repository | `npm run generate:tokens` | Builds opt-in starter adapters and `src/tokens/generated.ts` |
| Original user system | User-owned `my-tokens.json` anywhere | `node scripts/cli.mjs generate --tokens FILE --prefix NAME --out DIR [--mapping FILE]` | Builds user-selected variables and adapters, **without** importing the neutral example |
| Interactive project setup | User answers questions or supplies `design-system.config.json` | `node scripts/cli.mjs init` or `--config ... --dry-run` | Previews and selectively creates user-owned inputs/adapters after confirmation |

Within either generation mode, exactly one token manifest is authoritative for the values that mode emits. The two modes **share validation and formatting infrastructure**, but never share mandatory palette, typography, spacing, hierarchy, or grid decisions.

## Shared module contracts

```text
scripts/lib/tokens/
├── parse.mjs             # DTCG 2025.10 supported profile, type validation, aliases
├── format.mjs            # CSS/native formatting and common name conversion
├── starter-renderer.mjs  # optional neutral example + framework outputs
└── custom-renderer.mjs   # completely user-authored names + optional mappings

scripts/generate-tokens.mjs      # deterministic starter file writes / drift check
scripts/lib/custom-tokens.mjs    # compatible re-export of custom compiler
scripts/generate-custom-system.mjs
scripts/lib/init/               # interactive system creation and safe preview
```

Do not add a second token parser inside a framework adapter. All sources should pass through the shared validator and renderers.

## Explicitly supported DTCG profile

Based on [Design Tokens Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format/), but **not a full implementation of that specification**.

| Token type | Supported value format | Key limitation |
| --- | --- | --- |
| `color` | Opaque `{colorSpace:"srgb",components:[r,g,b],hex?: "#RRGGBB"}` | sRGB only; alpha other than 1 and advanced color spaces not yet supported |
| `dimension` | `{value:number,unit:"px"\|"rem"}` | Native `rem` values stay tagged for consumer conversion |
| `duration` | `{value:number,unit:"ms"\|"s"}` | Non-negative durations only |
| `number` | Finite number | No unit or aesthetic default |
| `fontFamily` | Non-empty family string or fallback array | Output formats may require platform-specific fallback choices |
| `fontWeight` | 1–1000 numeric weight or standard named weight | Consumer owns available font weights |
| `cubicBezier` | Four finite control point values; x values between 0 and 1 | Animation tooling must handle reduced motion independently |

**References:** Curly-brace aliases such as `{palette.primary}` resolve to an existing token, with type checking, missing-reference rejection and cycle detection. `$type` may be inherited from a parent group; a token alias may inherit its referenced type. Numeric path segments are supported (e.g. `space.4`). The parser also validates recognized descriptive metadata (`$description`, `$deprecated`, `$extensions`); root `$schema` is treated as an informational string only.

**Output-safe name profile:** Names must be ASCII letters, digits, underscores or hyphens and start with a letter or digit. Generated CSS and JS names are checked for collisions (for example, `fooBar` vs `foo-bar`). **This is narrower than DTCG's broad JSON-string name allowance**, because the current generator targets CSS variables, StyleX, TypeScript and other runtimes. A future escaping/mapping layer may remove the restriction.

**Not yet supported:** token/group `$extends`, JSON Pointer alias references, color spaces other than opaque sRGB, advanced composite types such as shadow/border/gradient/typography, arbitrary Unicode token names, or complete 2025.10 resolver behaviors. The DTCG Format Module's published report currently contains an editor's note that an official JSON Schema is still being explored; UF-CSS does **not** claim to validate against a finalized official JSON Schema.

## Layers are choices, not mandatory names

Some organizations use primitive → semantic → component roles. Others have different structures. The custom compiler accepts arbitrary token groups and validates types **without** requiring `core`, `semantic`, `theme`, `brand`, `primary`, `color` or `grid`. Tailwind and Bootstrap mappings are optional, explicitly authored aliases. A mapping cannot point at an absent token or use the wrong type.

## Unit and output behavior

- CSS dimensions and durations retain their units; CSS colors are serialized as normalized sRGB hex.
- StyleX variables are generated for each project-owned token; the consuming application must compile the `.stylex.ts` module.
- React Native receives numeric px layout starting points and millisecond durations; unresolved `rem` values are tagged `{value,unit:"rem"}`, not silently treated as dp.
- Responsive breakpoints and other starter preferences remain **optional**; a consumer may define completely different values.
- A token only becomes a Tailwind/Bootstrap utility when it has a relevant mapping. This prevents accidental presets.

## Determinism and governance

1. Hand-edit the correct canonical source. **Never** manually patch `*.generated.*` output.
2. Run `npm run generate:tokens` when changing the neutral example, then `npm run check:tokens`.
3. For consumer systems, run `uf-css generate --tokens ... --out ...` and `--check` on the generated folder; use `--force` deliberately if updating it.
4. Validate with `npm run verify` and web/native integration tests as applicable.
5. The CI parity suite changes token values **in memory** and asserts affected values/aliases update in the emitted CSS, TS, Bootstrap, StyleX, Tailwind references and native adapter. It also compares committed generated outputs byte-for-byte with the current neutral source.
6. Keep custom branding and app-specific visual decisions **out of the UF-CSS repository**.

The current Phase 02 scope is the **declared supported 2025.10 profile** and fully reproducible adapter generation for the existing token types. Full standard support and richer advanced token types are separate future capabilities; they should not be represented as complete already.
