/**
 * Source-order audit only. DOM order is the baseline for screen-reader reading
 * order; CSS visual order at sample viewport widths is supplied by the caller.
 * These are warnings, NOT a browser, keyboard or WCAG conformance assertion.
 */
export interface SemanticFlowNode {
  readonly id: string;
  readonly focusable?: boolean;
}
export interface SemanticFlowViewport {
  readonly widthPx: number;
  readonly visualOrder: readonly string[];
}
export interface SemanticFlowAudit {
  readonly nodes: readonly SemanticFlowNode[];
  readonly viewports: readonly SemanticFlowViewport[];
}
export interface SemanticFlowIssue {
  readonly code: "missing-node" | "unexpected-node" | "duplicate-node" | "visual-dom-divergence" | "focus-dom-divergence";
  readonly widthPx: number;
  readonly severity: "warning" | "error";
  readonly message: string;
}
function idValue(id: unknown): id is string {
  return typeof id === "string" && !!id.trim() && !/[\u0000-\u001f\u007f]/u.test(id);
}
export function auditReadingOrder(input: SemanticFlowAudit): readonly SemanticFlowIssue[] {
  if (!input || typeof input !== "object" || !Array.isArray(input.nodes) || !Array.isArray(input.viewports)) {
    throw new TypeError("audit requires nodes and viewports arrays");
  }
  const ids = input.nodes.map((node) => {
    if (!node || !idValue(node.id)) throw new TypeError("invalid source node id");
    return node.id;
  });
  if (new Set(ids).size !== ids.length) throw new RangeError("duplicate source node id");
  const idSet = new Set(ids);
  const focusIds = ids.filter((id, index) => input.nodes[index].focusable === true);
  const issues: SemanticFlowIssue[] = [];
  for (const viewport of input.viewports) {
    if (!viewport || !Number.isFinite(viewport.widthPx) || viewport.widthPx <= 0 ||
        !Array.isArray(viewport.visualOrder)) throw new RangeError("invalid viewport/order");
    const widthPx = viewport.widthPx;
    const seen = new Set<string>();
    for (const visualId of viewport.visualOrder) {
      if (!idValue(visualId)) throw new TypeError("invalid visual order id");
      if (seen.has(visualId)) {
        issues.push({ code:"duplicate-node", widthPx, severity:"error", message:"Repeated visual node: " + visualId });
      }
      seen.add(visualId);
      if (!idSet.has(visualId)) {
        issues.push({ code:"unexpected-node", widthPx, severity:"error", message:"Unknown visual node: " + visualId });
      }
    }
    for (const id of ids) if (!seen.has(id)) {
      issues.push({ code:"missing-node", widthPx, severity:"error", message:"Missing visual node: " + id });
    }
    // Only compare complete and unique permutations to avoid misleading warnings.
    if (viewport.visualOrder.length !== ids.length || seen.size !== ids.length ||
        viewport.visualOrder.some((id) => !idSet.has(id))) continue;
    if (ids.some((id, index) => viewport.visualOrder[index] !== id)) {
      issues.push({ code:"visual-dom-divergence", widthPx, severity:"warning",
        message:"Visual order differs from DOM reading order; manually inspect meaning and focus flow." });
    }
    const visualFocus = viewport.visualOrder.filter((id) => focusIds.includes(id));
    if (visualFocus.some((id, index) => id !== focusIds[index])) {
      issues.push({ code:"focus-dom-divergence", widthPx, severity:"warning",
        message:"Visual focusable order differs from DOM focusable order; test keyboard traversal." });
    }
  }
  return issues;
}
