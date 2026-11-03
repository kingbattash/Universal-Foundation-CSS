import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  gridRegistry, getGrid, listGrids, weightedTrackLayout, fixedContainerWidth,
  autoFitColumnCount, manuscriptGeometry, baselinePositions,
  compositionGuides, diagonalGuides, goldenTriangleGuides, rootRectangleGuide,
  classicalCanonReferences, createGridSystem, resolveCreatorGrid, renderCreatorGridCss,
} from "../src/grid/index.js";
import type { CreatorGridSystem } from "../src/grid/index.js";

const creator:CreatorGridSystem = {
  id:"harbor",grids:[
    {kind:"tracks",id:"workspace",name:"Operations layout",weights:[1],gapPx:12,paddingPx:16,
      breakpoints:[
        {minViewportPx:640,weights:[2,1]},
        {minViewportPx:1100,weights:[2,1,3]},
      ]},
    {kind:"composition",id:"original-guides",name:"Custom focal guides",
      guides:[{axis:"x",ratio:0.37},{axis:"y",ratio:0.62}]},
  ],
};
test("the original 37 references are still a five-family catalog, with truthful support levels",()=>{
  assert.equal(gridRegistry.length,37);
  assert.equal(new Set(gridRegistry.map(g=>g.id)).size,37);
  for (const [family,count] of [["web",8],["editorial",9],["geometric",12],["classical",6],["spacing",2]] as const) {
    assert.equal(listGrids(family).length,count);
  }
  const css=readFileSync(resolve("src/css/grid-recipes.css"),"utf8");
  assert.match(css, /@supports \(grid-template-columns: subgrid\)/);
  for (const grid of gridRegistry) {
    assert.ok(grid.name && grid.use && grid.caution && grid.referenceNote,grid.id);
    if (grid.support==="css-recipe") {
      assert.ok(grid.cssSelector && css.includes(grid.cssSelector+" {"),"Missing CSS recipe for "+grid.id);
    } else assert.equal(grid.cssSelector,undefined,"Reference should not promise CSS: "+grid.id);
  }
  assert.equal(getGrid("golden-canon").support,"reference");
  assert.equal(getGrid("masonry-grid").support,"reference");
  assert.match(getGrid("masonry-grid").referenceNote,/not true masonry/);
  assert.equal(getGrid("subgrid").support,"css-recipe");
});

test("equal and weighted tracks preserve total width for arbitrary layouts",()=>{
  for (const columns of [1,2,3,5,8,12,24,64]) {
    const weights=Array.from({length:columns},(_,i)=>1+(i%3));
    const geom=weightedTrackLayout(1600,weights,8,32);
    const sum=geom.widthsPx.reduce((a,b)=>a+b,0);
    assert.ok(Math.abs(sum+(columns-1)*8+64-1600)<1e-8);
    assert.ok(geom.widthsPx.every(w=>w>0));
  }
  const unequal=weightedTrackLayout(1200,[2,1,3],12,24);
  assert.ok(Math.abs(unequal.widthsPx[0]/unequal.widthsPx[1]-2)<1e-10);
  assert.ok(Math.abs(unequal.widthsPx[2]/unequal.widthsPx[1]-3)<1e-10);
  for(const bad of [
    ()=>weightedTrackLayout(100,[1,2,3],60,0),
    ()=>weightedTrackLayout(100,[],0,0),
    ()=>weightedTrackLayout(100,[1,0],0,0),
    ()=>weightedTrackLayout(100,[1,Infinity],0,0),
    ()=>weightedTrackLayout(100,[1,-1],0,0),
    ()=>weightedTrackLayout(100,[1,1],-1,0),
    ()=>weightedTrackLayout(100,[1,1],0,50),
  ]) assert.throws(bad,RangeError);
});

test("responsive, zoom-sized and fixed-container geometry stays finite and bounded",()=>{
  assert.equal(autoFitColumnCount(320,256,16),1);
  assert.equal(autoFitColumnCount(768,256,16),2);
  assert.equal(autoFitColumnCount(1440,256,16),5);
  assert.equal(autoFitColumnCount(500,800,12),1);
  assert.equal(fixedContainerWidth(320,1100,16),288);
  assert.equal(fixedContainerWidth(1440,1100,16),1100);
  assert.throws(()=>autoFitColumnCount(100,0),RangeError);
  assert.throws(()=>fixedContainerWidth(320,100,160),RangeError);
});

test("editorial geometry and baselines are creator-defined and reject clipping",()=>{
  assert.deepEqual(manuscriptGeometry(600,900,40,70),{
    pageWidthPx:600,pageHeightPx:900,textWidthPx:520,textHeightPx:760,marginInlinePx:40,marginBlockPx:70,
  });
  assert.deepEqual(baselinePositions(100,24,4),[4,28,52,76,100]);
  assert.deepEqual(baselinePositions(100,24,110),[]);
  assert.throws(()=>manuscriptGeometry(100,100,50,0),RangeError);
  assert.throws(()=>baselinePositions(100,0),RangeError);
  assert.throws(()=>baselinePositions(200000,0.01),RangeError);
});

test("geometric constructions return finite, within-rectangle guide geometry",()=>{
  const g=compositionGuides(1200,900);
  assert.deepEqual(g.thirds.verticalPx,[400,800]);
  assert.ok(g.phi.horizontalPx[0]>0&&g.phi.horizontalPx[1]<900);
  assert.deepEqual(diagonalGuides(100,200)[0],{x1Px:0,y1Px:0,x2Px:100,y2Px:200});
  assert.equal(goldenTriangleGuides(100,200).length,2);
  assert.equal(rootRectangleGuide(300,4).longSidePx,600);
  assert.throws(()=>compositionGuides(0,100),RangeError);
  assert.throws(()=>diagonalGuides(100,NaN),RangeError);
  assert.deepEqual(classicalCanonReferences.map(x=>x.id),
    ["golden-canon","van-de-graaf","rosarivo","villard"]);
});

test("creator grids inherit neither a starter preset nor an automatic CSS stylesheet",()=>{
  const normalized=createGridSystem(creator);
  assert.equal(normalized.grids.length,2);
  assert.equal(normalized.id,"harbor");
  assert.ok(Object.isFrozen(normalized)&&Object.isFrozen(normalized.grids));
  const tracks=normalized.grids[0];
  assert.equal(tracks.kind,"tracks");
  if(tracks.kind==="tracks") {
    assert.ok(Object.isFrozen(tracks.weights));
    assert.ok(Object.isFrozen(tracks.breakpoints));
    assert.ok(Object.isFrozen(tracks.breakpoints?.[0].weights));
  }
  assert.equal(creator.grids[0].name,"Operations layout");
  assert.deepEqual(createGridSystem({id:"empty",grids:[]}).grids,[]);
  assert.ok(!renderCreatorGridCss({id:"empty",grids:[]}).includes(".uf-cg-empty"));
});

test("responsive creator grid chooses highest applicable breakpoint without mutating the design",()=>{
  const mobile=resolveCreatorGrid(creator,"workspace",320,320);
  const tablet=resolveCreatorGrid(creator,"workspace",768,768);
  const desktop=resolveCreatorGrid(creator,"workspace",1440,1440);
  assert.deepEqual([mobile.geometry.weights.length,tablet.geometry.weights.length,desktop.geometry.weights.length],[1,2,3]);
  assert.deepEqual([mobile.minViewportPx,tablet.minViewportPx,desktop.minViewportPx],[null,640,1100]);
  for (const state of [mobile,tablet,desktop]) {
    const geometry=state.geometry;
    assert.ok(geometry.widthsPx.reduce((a,b)=>a+b,0)<=geometry.containerPx);
    assert.ok(Math.abs(geometry.widthsPx.reduce((a,b)=>a+b,0)+2*geometry.paddingPx+
      (geometry.weights.length-1)*geometry.gapPx-geometry.containerPx)<1e-8);
  }
  assert.throws(()=>resolveCreatorGrid(creator,"original-guides",500,500),RangeError);
  assert.throws(()=>resolveCreatorGrid(creator,"missing",500,500),RangeError);
});

test("creator grid validator rejects dangerous IDs and invalid breakpoints",()=>{
  const bad: CreatorGridSystem[]=[
    {id:"evil;",grids:[]},
    {id:"ok",grids:[{kind:"tracks",id:"invalid;id",name:"X",weights:[1]}]},
    {id:"ok",grids:[{kind:"tracks",id:"same",name:"X",weights:[1]},
                     {kind:"tracks",id:"same",name:"Y",weights:[1]}]},
    {id:"ok",grids:[{kind:"tracks",id:"small",name:"X",weights:[1],
      breakpoints:[{minViewportPx:700,weights:[1,1]},{minViewportPx:600,weights:[1]}]}]},
    {id:"ok",grids:[{kind:"tracks",id:"big",name:"X",weights:[1],
      breakpoints:[{minViewportPx:700,weights:[1]},{minViewportPx:700,weights:[1]}]}]},
    {id:"ok",grids:[{kind:"tracks",id:"zero",name:"X",weights:[0]}]},
    {id:"ok",grids:[{kind:"tracks",id:"infinity",name:"X",weights:[Infinity]}]},
    {id:"ok",grids:[{kind:"composition",id:"guide",name:"X",guides:[{axis:"x",ratio:2}]}]},
  ];
  for(const invalid of bad) assert.throws(()=>createGridSystem(invalid),Error,JSON.stringify(invalid));
});

test("rendered creator-owned CSS is deterministic, safe and only generates chosen track grids",()=>{
  const css=renderCreatorGridCss(creator);
  assert.equal(css,renderCreatorGridCss(creator));
  assert.match(css,/\.uf-cg-harbor-workspace \{/);
  assert.match(css,/@media \(min-width: 640px\)/);
  assert.match(css,/@media \(min-width: 1100px\)/);
  assert.ok(!css.includes("original-guides"));
  assert.ok(!css.includes("neutral"));
  assert.doesNotMatch(css,/\}\s*(?:h1|html|body|button)\s*\{/);
  assert.throws(()=>renderCreatorGridCss({id:"unsafe",grids:[{
    kind:"tracks",id:"hack}body{",name:"Unsafe",weights:[1],
  }]}),TypeError);
});

test("responsive specimens keep source order without implicit CSS visual reordering",()=>{
  const fixture=JSON.parse(readFileSync(resolve("examples/grids/layouts.json"),"utf8")) as {
    examples:Array<{file:string;ids:string[];viewports:Array<{widthPx:number;visualOrder:string[]}>}>;
  };
  assert.equal(fixture.examples.length,2);
  for(const example of fixture.examples) {
    const html=readFileSync(resolve("examples/grids",example.file),"utf8");
    const actual=[...html.matchAll(/data-uf-grid-node="([^"]+)"/g)].map(x=>x[1]);
    assert.deepEqual(actual,example.ids);
    assert.deepEqual(example.viewports.map(x=>x.widthPx),[320,768,1440]);
    for(const viewport of example.viewports) assert.deepEqual(viewport.visualOrder,example.ids);
    assert.match(html,/href="#main"/);
    assert.match(html,/<main\b/);
    assert.doesNotMatch(html,/(?:grid-auto-flow\s*:\s*dense|\border\s*:)/);
  }
  const source=readFileSync(resolve("src/css/grid-recipes.css"),"utf8");
  assert.doesNotMatch(source,/grid-auto-flow\s*:\s*dense/);
  assert.doesNotMatch(source,/#(?:[0-9a-f]{3}|[0-9a-f]{6})\b/i);
  assert.match(source,/\.uf-g-masonry-fallback/);
  assert.match(source,/grid-template-columns: subgrid/);
});
