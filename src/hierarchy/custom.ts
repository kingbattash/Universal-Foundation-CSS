/**
 * Creator-owned hierarchy models. No default categories, scales or CSS styles
 * are inserted. Lower numeric priority = more prominent, by creator choice.
 */
export interface CustomHierarchyLevel {
  readonly id: string;
  readonly label: string;
  readonly priority: number;
  readonly semanticRole?: string;
  readonly strategies?: readonly string[];
}
export interface CustomHierarchyRelationship {
  readonly from: string;
  readonly to: string;
  readonly kind: "sequence" | "dependency" | "grouping" | "emphasis";
  readonly reason: string;
}
export interface CustomHierarchySystem {
  readonly id: string;
  readonly name: string;
  readonly levels: readonly CustomHierarchyLevel[];
  readonly relationships?: readonly CustomHierarchyRelationship[];
}
function textField(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim() || value.length > 128 || /[\u0000-\u001f\u007f]/u.test(value)) {
    throw new TypeError(field + " must be a nonempty, printable string up to 128 characters");
  }
  return value.trim();
}

/**
 * Validates relations and cycles; returns a separately allocated, frozen model.
 * "grouping" and "emphasis" are contextual, not directed order dependencies.
 */
export function createHierarchySystem(input: CustomHierarchySystem): Readonly<CustomHierarchySystem> {
  if (!input || typeof input !== "object") throw new TypeError("system must be an object");
  const id = textField(input.id, "system.id");
  const name = textField(input.name, "system.name");
  if (!Array.isArray(input.levels)) throw new TypeError("levels must be an array");
  const levelIds = new Set<string>();
  const levels = input.levels.map((item, index) => {
    if (!item || typeof item !== "object") throw new TypeError("invalid level at " + index);
    const levelId = textField(item.id, "level.id");
    const label = textField(item.label, "level.label");
    if (levelIds.has(levelId)) throw new RangeError("duplicate level id: " + levelId);
    if (!Number.isFinite(item.priority) || !Number.isSafeInteger(item.priority)) {
      throw new RangeError("level.priority must be a finite safe integer");
    }
    levelIds.add(levelId);
    const semanticRole = item.semanticRole === undefined ? undefined : textField(item.semanticRole, "level.semanticRole");
    if (item.strategies !== undefined && !Array.isArray(item.strategies)) throw new TypeError("strategies must be an array");
    const strategies = item.strategies?.map((s: string) => textField(s, "strategy"));
    if (strategies && new Set(strategies).size !== strategies.length) throw new RangeError("duplicate strategies in " + levelId);
    return Object.freeze({ id:levelId, label, priority:item.priority, ...(semanticRole === undefined ? {} : { semanticRole }),
      ...(strategies === undefined ? {} : { strategies: Object.freeze(strategies) }) });
  });
  if (input.relationships !== undefined && !Array.isArray(input.relationships)) {
    throw new TypeError("relationships must be an array");
  }
  const edgeIds = new Set<string>();
  const orderedEdges = new Map<string, string[]>();
  const relationships = input.relationships?.map((relation) => {
    if (!relation || typeof relation !== "object") throw new TypeError("invalid relationship");
    const from = textField(relation.from, "relationship.from");
    const to = textField(relation.to, "relationship.to");
    const reason = textField(relation.reason, "relationship.reason");
    const kind = relation.kind;
    if (!(["sequence","dependency","grouping","emphasis"] as readonly string[]).includes(kind)) {
      throw new RangeError("unsupported relationship kind");
    }
    if (!levelIds.has(from) || !levelIds.has(to)) throw new RangeError("relationship references missing level");
    if (from === to) throw new RangeError("relationship cannot be self-referential");
    const edgeId = JSON.stringify([from,to,kind]);
    if (edgeIds.has(edgeId)) throw new RangeError("duplicate relationship");
    edgeIds.add(edgeId);
    if (kind === "sequence" || kind === "dependency") {
      const existing = orderedEdges.get(from) ?? [];
      existing.push(to);
      orderedEdges.set(from, existing);
    }
    return Object.freeze({ from,to,kind,reason });
  });
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(node: string): void {
    if (visiting.has(node)) throw new RangeError("cyclic ordered hierarchy relationship");
    if (visited.has(node)) return;
    visiting.add(node);
    for (const child of orderedEdges.get(node) ?? []) visit(child);
    visiting.delete(node);
    visited.add(node);
  }
  for (const id of levelIds) visit(id);
  return Object.freeze({ id,name,levels:Object.freeze(levels),
    ...(relationships === undefined ? {} : { relationships:Object.freeze(relationships) }) });
}

/** Stable numeric-priority reference order; ties retain creator-authored order. */
export function sortHierarchyLevels(system: CustomHierarchySystem): readonly CustomHierarchyLevel[] {
  const validated = createHierarchySystem(system);
  return [...validated.levels].sort((a,b) => a.priority - b.priority);
}
