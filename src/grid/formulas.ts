import { columnWidth, goldenSplit, rootRectangleRatio } from "../foundation-formular/formular.js"

/** Geometry suitable for CSS grid column layouts. */
export function gridTrackWidths(containerPx:number, columns:8|12, gapPx:number):number{
  return columnWidth(containerPx,columns,gapPx)
}
export function thirds(total:number):readonly [number,number,number] {
  if(!Number.isFinite(total)||total<=0) throw new RangeError("total must be positive and finite")
  return [total/3,total/3,total/3] as const
}
export function phiSections(total:number):Readonly<{primary:number;secondary:number}> {
  return goldenSplit(total)
}
export function rootRectangleHeight(width:number,root:2|3|4|5):number{
  if(!Number.isFinite(width)||width<=0) throw new RangeError("width must be positive and finite")
  return width*rootRectangleRatio(root)
}
