import { weightedTrackLayout } from "./web/index.js";
import type { WeightedTrackLayout } from "./web/index.js";

/**
 * A system may contain ZERO grids. No UF-CSS grid preset, palette, spacing
 * scale or breakpoint is silently inherited.
 */
export interface CreatorGridBreakpoint {
  readonly minViewportPx: number;
  readonly weights: readonly number[];
}
export type CreatorGridDefinition =
  | {
    readonly kind:"tracks";
    readonly id:string;
    readonly name:string;
    readonly weights:readonly number[];
    readonly gapPx?:number;
    readonly paddingPx?:number;
    readonly breakpoints?:readonly CreatorGridBreakpoint[];
  }
  | {
    readonly kind:"composition";
    readonly id:string;
    readonly name:string;
    readonly guides:readonly {readonly axis:"x"|"y"; readonly ratio:number}[];
  };
export interface CreatorGridSystem {
  readonly id:string;
  readonly grids:readonly CreatorGridDefinition[];
}
export interface CreatorGridResolution {
  readonly gridId: string;
  readonly minViewportPx: number | null;
  readonly geometry: WeightedTrackLayout;
}

function slug(value: unknown, name: string): string {
  if (typeof value !== "string" || !/^[a-z][a-z0-9-]{0,63}$/.test(value)) {
    throw new TypeError(name + " must match /^[a-z][a-z0-9-]{0,63}$/");
  }
  return value;
}
function nameValue(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 128 || /[\u0000-\u001f\u007f]/u.test(value)) {
    throw new TypeError("grid name must be printable, nonempty and <=128 characters");
  }
  return value.trim();
}
function dimension(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1_000_000) {
    throw new RangeError(field + " must be finite, non-negative and <=1,000,000");
  }
  return value;
}
function weightValues(value: unknown): readonly number[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 64 ||
      value.some((n: unknown) => typeof n !== "number" || !Number.isFinite(n) || n <= 0 || n > 1_000_000)) {
    throw new RangeError("weights require 1–64 finite positive numbers <=1,000,000");
  }
  return Object.freeze([...value] as number[]);
}
export function createGridSystem(system: CreatorGridSystem): Readonly<CreatorGridSystem> {
  if (!system || typeof system !== "object" || !Array.isArray(system.grids)) throw new TypeError("system requires grids array");
  const id=slug(system.id,"system.id");
  const seen=new Set<string>();
  const grids:CreatorGridDefinition[]=system.grids.map((item) => {
    if (!item || typeof item !== "object") throw new TypeError("grid must be an object");
    const gridId=slug(item.id,"grid.id");
    const name=nameValue(item.name);
    if (seen.has(gridId)) throw new RangeError("duplicate grid id: " + gridId);
    seen.add(gridId);
    if (item.kind === "composition") {
      if (!Array.isArray(item.guides)) throw new TypeError("composition guides must be an array");
      const guides=item.guides.map((guide: {readonly axis:"x"|"y";readonly ratio:number})=>{
        if (!guide || !["x","y"].includes(guide.axis) ||
            typeof guide.ratio !== "number" || !Number.isFinite(guide.ratio) ||
            guide.ratio < 0 || guide.ratio > 1) throw new RangeError("invalid composition guide");
        return Object.freeze({axis:guide.axis,ratio:guide.ratio});
      });
      return Object.freeze({kind:"composition" as const,id:gridId,name,guides:Object.freeze(guides)});
    }
    if (item.kind !== "tracks") throw new RangeError("grid kind must be tracks or composition");
    const weights=weightValues(item.weights);
    const gapPx=dimension(item.gapPx??0,"gapPx");
    const paddingPx=dimension(item.paddingPx??0,"paddingPx");
    if (item.breakpoints !== undefined && !Array.isArray(item.breakpoints)) throw new TypeError("breakpoints must be an array");
    let last=-1;
    const breakpoints=item.breakpoints?.map((bp: CreatorGridBreakpoint)=>{
      if (!bp || typeof bp !== "object") throw new TypeError("invalid breakpoint");
      const minViewportPx=dimension(bp.minViewportPx,"minViewportPx");
      if (minViewportPx <= last) throw new RangeError("breakpoints must be strictly ascending");
      last=minViewportPx;
      return Object.freeze({minViewportPx,weights:weightValues(bp.weights)});
    });
    return Object.freeze({kind:"tracks" as const,id:gridId,name,weights,gapPx,paddingPx,
      ...(breakpoints===undefined?{}:{breakpoints:Object.freeze(breakpoints)})});
  });
  return Object.freeze({id,grids:Object.freeze(grids)});
}

/** Resolves authored column weights at a given viewport, then calculates CSS-pixel geometry. */
export function resolveCreatorGrid(
  system: CreatorGridSystem, gridId: string, viewportPx: number, containerPx: number,
): CreatorGridResolution {
  const normalized=createGridSystem(system);
  if (!Number.isFinite(viewportPx) || viewportPx <= 0) throw new RangeError("viewportPx must be positive");
  const grid=normalized.grids.find(g=>g.id===gridId);
  if (!grid) throw new RangeError("unknown grid id");
  if (grid.kind!=="tracks") throw new RangeError("composition guide has no tracks");
  const breakpoint=grid.breakpoints?.filter(b=>b.minViewportPx<=viewportPx).at(-1);
  return {gridId:grid.id,minViewportPx:breakpoint?.minViewportPx??null,
    geometry:weightedTrackLayout(containerPx,breakpoint?.weights??grid.weights,grid.gapPx,grid.paddingPx)};
}

/**
 * Safe deterministic opt-in CSS, usable by Vanilla, Tailwind, Bootstrap,
 * Vue/Svelte/Angular/etc. Composition guides are intentionally data-only.
 */
export function renderCreatorGridCss(system: CreatorGridSystem): string {
  const normalized=createGridSystem(system);
  const rules:string[]=["/* UF-CSS creator-owned grids; import only if explicitly selected. */","@layer uf.creator-grids {"];
  for(const grid of normalized.grids){
    if(grid.kind!=="tracks") continue;
    const selector=".uf-cg-"+normalized.id+"-"+grid.id;
    rules.push("  "+selector+" { display: grid; min-inline-size: 0; gap: "+grid.gapPx+"px; padding-inline: "+
      grid.paddingPx+"px; grid-template-columns: "+grid.weights.map(w=>w+"fr").join(" ")+"; }");
    rules.push("  "+selector+" > * { min-inline-size: 0; }");
    for (const bp of grid.breakpoints??[]) {
      rules.push("  @media (min-width: "+bp.minViewportPx+"px) { "+selector+" { grid-template-columns: "+
        bp.weights.map(w=>w+"fr").join(" ")+"; } }");
    }
  }
  rules.push("}");
  return rules.join("\n")+"\n";
}
