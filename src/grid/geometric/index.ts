import { goldenSectionGuides, rootRectangleHeight, ruleOfThirdsGuides } from "../formulas.js";

export interface LineSegment {
  readonly x1Px: number; readonly y1Px: number;
  readonly x2Px: number; readonly y2Px: number;
}
function rectangle(widthPx: number, heightPx: number): void {
  if (!Number.isFinite(widthPx) || widthPx <= 0 ||
      !Number.isFinite(heightPx) || heightPx <= 0) throw new RangeError("dimensions must be positive and finite");
}

/** Two straight diagonals of a rectangle, not an entire historical armature. */
export function diagonalGuides(widthPx: number, heightPx: number): readonly LineSegment[] {
  rectangle(widthPx,heightPx);
  return [
    {x1Px:0,y1Px:0,x2Px:widthPx,y2Px:heightPx},
    {x1Px:widthPx,y1Px:0,x2Px:0,y2Px:heightPx},
  ];
}

/** The diagonal from upper left and two points dividing the opposing edges. */
export function goldenTriangleGuides(widthPx: number, heightPx: number): readonly LineSegment[] {
  rectangle(widthPx,heightPx);
  const phiX = goldenSectionGuides(widthPx,heightPx).verticalPx[0];
  return [
    {x1Px:0,y1Px:0,x2Px:widthPx,y2Px:heightPx},
    {x1Px:0,y1Px:heightPx,x2Px:phiX,y2Px:0},
  ];
}

/**
 * Optional guide data. This is a *mathematical construction*, not the layout
 * of a real UI, and does not make historical "golden canon" claims.
 */
export function compositionGuides(widthPx: number, heightPx: number) {
  rectangle(widthPx,heightPx);
  return {
    thirds: ruleOfThirdsGuides(widthPx,heightPx),
    phi: goldenSectionGuides(widthPx,heightPx),
    diagonals: diagonalGuides(widthPx,heightPx),
  } as const;
}

export function rootRectangleGuide(shortSidePx: number, root:2|3|4|5) {
  return {shortSidePx, longSidePx:rootRectangleHeight(shortSidePx,root), root} as const;
}
