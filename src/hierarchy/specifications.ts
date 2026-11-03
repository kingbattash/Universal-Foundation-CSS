import { communicationSpecifications } from "./communication/index.js";
import { structuralSpecifications } from "./structural/index.js";
import { visualSpecifications } from "./visual-techniques/index.js";
import { interactiveSpecifications } from "./interactive/index.js";
import type { HierarchySpecification } from "./specification.js";
import type { HierarchyId } from "./hierarchy.js";

/** Non-exclusive reference specifications for the 20 legacy catalog items. */
export const hierarchySpecifications: readonly HierarchySpecification[] = [
  ...communicationSpecifications,
  ...structuralSpecifications,
  ...visualSpecifications,
  ...interactiveSpecifications,
];
export function getHierarchySpecification(id: HierarchyId): HierarchySpecification {
  const spec = hierarchySpecifications.find((candidate) => candidate.id === id);
  if (!spec) throw new Error("Unknown hierarchy specification: " + id);
  return spec;
}
