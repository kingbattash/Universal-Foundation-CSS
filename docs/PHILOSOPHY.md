# Philosophy: a foundation for creating your own design system

**Universal Foundation CSS (UF-CSS) is not a design system that products must follow.** It is an open, framework-neutral **design-system construction toolkit**: mathematical tools, knowledge references, semantic modeling methods, optional examples, token generators, platform adapters, and checks. A consumer defines its own system.

## What the consumer owns

The user or product team has the final say over:

- Typography: fonts, type scales, line height, weights and reading measure.
- Grids: use one predefined grid, several, a custom algorithm, or none.
- Hierarchy: establish the categories, priorities, visual methods and naming conventions appropriate to the product.
- Spacing, radii, color, elevation, motion and density.
- Component types, variants, visual appearance and layout patterns.
- Product-specific behavior and content, provided accessibility and platform requirements are respected.
- Framework choice: Vanilla CSS, Tailwind, Bootstrap, StyleX, React Native or another implementation.

## What the universal foundation contributes

1. **Composable capabilities:** Pure formulas, token schemas, optional presets, hierarchy references, grid construction helpers, component/interaction contracts and accessibility evaluation tools.
2. **Open extension points:** Import, replace, omit, override or extend design decisions without changing the UF-CSS source code. Future phases must add custom grid and hierarchy definitions, not only lookup of fixed built-in registries.
3. **Interoperability:** Generate appropriate outputs for a project's chosen stack without coercing a styling-library migration.
4. **Design-system creation:** Help a developer define and document **their own** semantic rules, component contracts and selected design methodology.
5. **Validation without aesthetic enforcement:** Check technical correctness, accessibility, reference integrity and generated-output parity. Do not reject an original design merely because it differs from a default aesthetic.

## Defaults are examples, not requirements

The 4px spacing seed, neutral palette, example 12-column layout, 20 hierarchy categories and 37 grid references are **optional examples or research catalogs**, not the canonical design that every project must adopt. Their existence does not imply a fixed number of legitimate hierarchies or grids.

The canonical `tokens/source.tokens.json` currently holds the **starter's default values** for reproducible output generation. It must not be mistaken for the one palette, scale or theme every consumer must use. Planned consumer configuration and extension APIs must make replacing these defaults straightforward.

## Core constraints (about interoperability, not design taste)

- **No organizational branding in universal source.** Company identity belongs to its consuming package.
- **No mandatory visual language.** UF-CSS must not dictate a product's visual appearance.
- **No mandatory framework.** Adapters are opt-in; the core remains framework-neutral.
- **No forced grid or hierarchy taxonomy.** Registries are resources, and custom definitions are first-class design goals.
- **No compulsory UI components.** Component contracts and examples are optional aids.
- **No duplicated token authorities.** Within a project, one declared token source generates the selected platform outputs.
- **No false quality claims.** Passing CI doesn't guarantee a usable, accessible interface.
- **No aesthetic "compliance score."** Accessibility requirements and mechanically verifiable invariants may be checked; design choices remain the creator's.

## Expected consumer workflow

```text
Choose your product and framework
            ↓
Define YOUR design principles and audience
            ↓
Create your own tokens, hierarchy and grid strategy
            ↓
Optionally use UF-CSS calculations, references and patterns
            ↓
Generate the selected platform adapters
            ↓
Implement your own components and product identity
            ↓
Test usability, accessibility, consistency and responsiveness
```

A project using no built-in grid preset and a completely custom type scale is just as valid a UF-CSS consumer as one using every example preset.

## Architectural direction

Keep the **seven conceptual core domains** as the organizational structure of UF-CSS; do **not** mistake those directories for seven rules that consuming projects must mirror. Build consumer-owned configuration, plugin interfaces and manifest-driven generation before expanding prescriptive templates.

**UF-CSS creates the possibility of many independent design systems. It does not standardize them into one appearance.**
