import type { HierarchyId, HierarchyFamily } from "./hierarchy.js";
import type { HierarchyStrategyId } from "./strategies.js";

/** A reference specification, not an imposed hierarchy or CSS style. */
export interface HierarchySpecification {
  readonly id: HierarchyId;
  readonly family: HierarchyFamily;
  readonly kind: "major" | "technique";
  /** Which content should be more salient for its task and audience. */
  readonly priorityRule: string;
  readonly relationships: readonly HierarchyId[];
  readonly constraints: readonly string[];
  readonly example: string;
  readonly antiPattern: string;
  readonly strategies: readonly HierarchyStrategyId[];
  readonly support: "guidance" | "css-hook";
}
