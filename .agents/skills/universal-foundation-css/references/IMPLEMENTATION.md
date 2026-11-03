# New project implementation guide

1. Inventory framework, styling tools and target devices. Preserve existing design conventions unless asked to migrate.
2. Choose `foundation-formular` defaults or project-specific constraints, then document the overrides.
3. Define token layers: **primitive/core → semantic → project brand → component-specific**. Avoid a cycle where a universal package imports a project package.
4. Select only the grid systems appropriate to the content (e.g. responsive columns for marketing, baseline for long text). Use geometry helpers only where geometry helps.
5. Create a semantic reading order and a task hierarchy. Compare it with the CSS visual order.
6. Define component contracts with explicit names, behavior, states and keyboard support.
7. Render web/native variants using the same canonical role decisions but different platform layout implementations.
8. Test and document exceptions. Check that design-token changes propagate from a single source.

Package state matters: a registry entry marked `reference` is not an implemented renderer.

## Example planning record

```json
{
  "product": "example-product",
  "brand": "defined in consuming project",
  "platforms": ["web", "native"],
  "canonicalTokens": "packages/design-core/tokens",
  "gridChoices": ["twelve-column", "manuscript"],
  "primaryTask": "Find and complete the main action",
  "checks": ["responsive", "focus", "contrast", "reduced-motion"]
}
```
