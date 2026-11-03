import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Script } from "node:vm";
import {
  componentContracts, componentSpecifications, getComponentSpecification,
  transitionOperation, defineComponentContract,
} from "../src/components/index.js";
import {
  patterns, patternSpecifications, getPatternSpecification, definePattern,
} from "../src/patterns/index.js";
import { hierarchy } from "../src/hierarchy/index.js";
import { gridRegistry } from "../src/grid/index.js";
import type { ComponentContractName } from "../src/components/index.js";

test("original five component names survive while ten task contracts have explicit platform behavior",()=>{
  const original=["button","textField","tabs","dialog","card"];
  const keys=Object.keys(componentContracts) as ComponentContractName[];
  assert.equal(keys.length,10);
  for(const id of original)assert.ok(id in componentContracts);
  for(const id of keys){
    const spec=getComponentSpecification(id);
    assert.equal(spec.id,id);
    assert.equal(componentContracts[id].name.length>0,true);
    assert.ok(spec.web&&spec.native&&spec.task);
    assert.ok(spec.keyboard.length&&spec.screenReader.length&&spec.stateReview.length&&spec.constraints.length);
    assert.equal(spec.stateReview.every(s=>["idle","loading","success","error","empty","disabled"].includes(s)),true);
    assert.ok(componentContracts[id].accessibility.length);
    assert.ok(componentContracts[id].slots.length);
  }
  assert.deepEqual(Object.keys(componentSpecifications).sort(),keys.sort());
});

test("operation transitions demand an explicit completion event and reject invalid jumps",()=>{
  const start=transitionOperation("idle","start");
  assert.deepEqual(start,{previous:"idle",event:"start",next:"loading"});
  assert.equal(transitionOperation(start.next,"resolve").next,"success");
  assert.equal(transitionOperation("loading","reject").next,"error");
  assert.equal(transitionOperation("loading","no-results").next,"empty");
  assert.equal(transitionOperation("error","start").next,"loading");
  assert.equal(transitionOperation("disabled","enable").next,"idle");
  assert.equal(transitionOperation("loading","reset").next,"idle");
  assert.throws(()=>transitionOperation("idle","resolve"),RangeError);
  assert.throws(()=>transitionOperation("disabled","start"),RangeError);
  assert.throws(()=>transitionOperation("success","resolve"),RangeError);
  assert.ok(Object.isFrozen(start));
});

test("developer-owned components do not inherit any required visual system",()=>{
  const custom=defineComponentContract({
    id:"audio-choice",task:"Let listeners choose an accessible track",
    webBehavior:"Named native radio options",nativeBehavior:"Accessible radio selection",
    requiredStates:["idle","loading","error","disabled"],checks:["Can select with keyboard","Readable errors"],
  });
  assert.equal(custom.id,"audio-choice");
  assert.ok(!("palette" in custom)&&!("size" in custom)&&!("font" in custom));
  assert.ok(Object.isFrozen(custom)&&Object.isFrozen(custom.requiredStates)&&Object.isFrozen(custom.checks));
  const empty=defineComponentContract({
    id:"plain",task:"Information",webBehavior:"Document semantics",
    nativeBehavior:"Accessible text",requiredStates:[],checks:[],
  });
  assert.deepEqual(empty.checks,[]);
  assert.throws(()=>defineComponentContract({
    id:"bad",task:"Invalid",webBehavior:"Web",nativeBehavior:"Native",
    requiredStates:["idle","idle"],checks:[],
  }),RangeError);
  assert.throws(()=>defineComponentContract({
    id:"bad",task:"Invalid",webBehavior:"Web",nativeBehavior:"Native",
    requiredStates:["idle"],checks:["same","same"],
  }),RangeError);
  assert.throws(()=>defineComponentContract({
    id:"\n",task:"Invalid",webBehavior:"Web",nativeBehavior:"Native",
    requiredStates:[],checks:[],
  }),TypeError);
});

test("ten optional patterns preserve five original IDs, valid reading order and no forced grids",()=>{
  const old=["hero","article","dashboard","form","collection"];
  const ids=patterns.map(p=>p.id);
  assert.equal(ids.length,10);
  assert.equal(new Set(ids).size,10);
  for(const id of old)assert.ok(ids.includes(id as typeof ids[number]));
  for(const p of patterns){
    const spec=getPatternSpecification(p.id);
    assert.equal(spec.id,p.id);
    assert.ok(spec.webSemantics&&spec.nativeEquivalent&&spec.responsiveRule&&spec.caution);
    assert.ok(p.readingOrder.length>0);
    assert.equal(new Set(p.readingOrder).size,p.readingOrder.length);
    for(const id of p.hierarchy)assert.ok(hierarchy.some(h=>h.id===id));
    for(const id of p.suggestedGrids)assert.ok(gridRegistry.some(g=>g.id===id));
    assert.ok(spec.reviewStates.length>0);
  }
  assert.deepEqual(Object.keys(patternSpecifications).sort(),ids.slice().sort());
});

test("custom patterns allow zero grids, arbitrary localization and reject malformed order",()=>{
  const p=definePattern({
    id:"custom-journal",purpose:"Publish a non-template report",
    readingOrder:["عنوان الصفحة","body","metadata"],reviewStates:["unknown-creator-state"],
    notes:"Fully user-owned typography and layout",
  });
  assert.deepEqual(p.readingOrder,["عنوان الصفحة","body","metadata"]);
  assert.equal(p.reviewStates?.[0],"unknown-creator-state");
  assert.ok(Object.isFrozen(p)&&Object.isFrozen(p.readingOrder));
  assert.deepEqual(definePattern({id:"empty",purpose:"Nothing required",readingOrder:[]}).readingOrder,[]);
  assert.throws(()=>definePattern({id:"bad",purpose:"Invalid",readingOrder:["x","x"]}),RangeError);
  assert.throws(()=>definePattern({id:"bad",purpose:"Invalid",readingOrder:["\n"]}),TypeError);
});

test("optional CSS exposes no brand, typography reset or global tag style",()=>{
  const css=readFileSync(resolve("src/css/pattern-recipes.css"),"utf8");
  assert.match(css,/@layer uf\.pattern-recipes/);
  for(const cls of [".uf-p-section",".uf-p-split",".uf-p-toolbar",".uf-p-dashboard",
    ".uf-p-table-scroll",".uf-p-auth",".uf-p-fields",".uf-p-feedback"]){
    assert.ok(css.includes(cls),cls);
  }
  assert.doesNotMatch(css,/#[a-f0-9]{3,8}\b/i);
  assert.doesNotMatch(css,/(?:^|\n)\s*(?:body|html|button|input|table)\s*\{/);
  assert.doesNotMatch(css,/font-family|--uf-action/);
});

test("interactive HTML specimens use native semantics and compile their embedded scripts",()=>{
  const workflow=readFileSync(resolve("examples/components/workflow.html"),"utf8");
  const records=readFileSync(resolve("examples/components/records.html"),"utf8");
  for(const html of [workflow,records]){
    assert.match(html,/<main\b/);
    assert.match(html,/<h1\b/);
    assert.match(html,/href="#main"/);
    assert.match(html,/<meta name="viewport"/);
    const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script,"embedded script required");
    assert.doesNotThrow(()=>new Script(script));
    assert.doesNotMatch(script,/(?:fetch\(|XMLHttpRequest|localStorage|navigator\.sendBeacon)/);
  }
  assert.match(workflow,/role="tablist"/);
  assert.match(workflow,/role="tab"/);
  assert.match(workflow,/aria-selected="true"/);
  assert.match(workflow,/role="tabpanel"/);
  assert.match(workflow,/keydown/);
  assert.match(workflow,/showModal\(/);
  assert.match(workflow,/addEventListener\('close'/);
  assert.match(workflow,/<dialog\b/);
  assert.match(workflow,/aria-describedby="name-help name-error"/);
  assert.match(workflow,/aria-invalid/);
  assert.match(workflow,/role="status"/);
  assert.match(workflow,/Nothing was submitted to a server/);
  assert.match(records,/<nav aria-label/);
  assert.match(records,/<table\b/);
  assert.match(records,/scope="col"/);
  assert.match(records,/aria-sort="none"/);
  assert.match(records,/role="region"/);
  assert.match(records,/tabindex="0"/);
  assert.match(records,/<ul>/);
  assert.match(records,/No records match/);
  assert.match(records,/role="status"/);
});

test("native mapping is documented without claiming a React Native renderer",()=>{
  const native=readFileSync(resolve("examples/components/native-mapping.md"),"utf8");
  assert.match(native,/Pressable/);
  assert.match(native,/TextInput/);
  assert.match(native,/safe areas/);
  assert.match(native,/not a React Native component library/);
});
