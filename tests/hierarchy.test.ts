import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  hierarchy, hierarchySpecifications, hierarchyStrategies,
  createHierarchySystem, sortHierarchyLevels, getHierarchySpecification,
} from "../src/hierarchy/index.js";
import { auditReadingOrder, defineSemanticRoles, semantic } from "../src/semantic/index.js";
import type { CustomHierarchySystem } from "../src/hierarchy/index.js";
import type { SemanticFlowAudit } from "../src/semantic/index.js";

test("the 20 optional hierarchy references have complete, consistent specifications", () => {
  assert.equal(hierarchy.length, 20);
  assert.equal(hierarchySpecifications.length, 20);
  assert.equal(new Set(hierarchySpecifications.map((s) => s.id)).size, 20);
  for (const item of hierarchy) {
    const spec = getHierarchySpecification(item.id);
    assert.equal(spec.id, item.id);
    assert.equal(spec.family, item.family);
    assert.equal(spec.kind, item.technique ? "technique" : "major");
    assert.ok(spec.priorityRule && spec.example && spec.antiPattern);
    assert.ok(spec.constraints.length > 0);
    assert.ok(spec.strategies.length > 0);
    for (const relation of spec.relationships) assert.ok(hierarchy.some((x) => x.id === relation));
    for (const strategy of spec.strategies) assert.ok(strategy in hierarchyStrategies);
  }
});

test("CSS techniques are opt-in, prefixed, and require no predetermined brand palette", () => {
  const css = readFileSync(resolve(process.cwd(), "src/css/hierarchy-strategies.css"), "utf8");
  assert.match(css, /@layer uf\.hierarchy/);
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}/);
  assert.doesNotMatch(css, /(?:^|\n)\s*(?:h1|body|button|html)\s*\{/);
  for (const strategy of Object.values(hierarchyStrategies)) {
    if (strategy.cssHook !== null) assert.ok(css.includes(strategy.cssHook + " {"), strategy.cssHook);
  }
});

const custom: CustomHierarchySystem = {
  id:"custom/report", name:"An independent reporting scheme",
  levels:[
    { id:"technical-detail", label:"Technical detail", priority:6, semanticRole:"appendix", strategies:["my-company-density"] },
    { id:"decision", label:"Decision summary", priority:1, semanticRole:"executive-action", strategies:["decision-highlight"] },
    { id:"supporting-evidence", label:"Supporting evidence", priority:4 },
  ],
  relationships:[
    { from:"decision", to:"supporting-evidence", kind:"sequence", reason:"decision context first" },
    { from:"supporting-evidence", to:"technical-detail", kind:"dependency", reason:"details follow sources" },
  ],
};

test("independent hierarchy systems inherit no preset and cannot mutate input", () => {
  const sys = createHierarchySystem(custom);
  assert.deepEqual(sys.levels.map((l) => l.id), ["technical-detail","decision","supporting-evidence"]);
  assert.deepEqual(sortHierarchyLevels(custom).map((l) => l.id), ["decision","supporting-evidence","technical-detail"]);
  assert.equal(sys.levels.length,3);
  assert.ok(!sys.levels.some((l) => l.id === "typographic"));
  assert.ok(Object.isFrozen(sys) && Object.isFrozen(sys.levels));
  assert.ok(Object.isFrozen(sys.levels[0]));
  assert.ok(Object.isFrozen(sys.levels[0].strategies));
  assert.ok(Object.isFrozen(sys.relationships));
  assert.equal(custom.levels[0].label,"Technical detail");
  assert.deepEqual(createHierarchySystem({id:"free",name:"No mandatory levels",levels:[]}).levels, []);
  assert.deepEqual(createHierarchySystem({id:"custom",name:"Unicode hierarchy",levels:[{id:"mwangaza",label:"Mwanga — الأول",priority:-2}]}).levels.map(l=>l.label), ["Mwanga — الأول"]);
});

test("creator-owned hierarchical relationships reject duplicates, dangling references and cycles", () => {
  assert.throws(() => createHierarchySystem({id:"broken",name:"Bad",levels:[
    {id:"A",label:"first",priority:1},{id:"A",label:"second",priority:2},
  ]}), /duplicate/);
  assert.throws(() => createHierarchySystem({id:"broken",name:"Bad",levels:[{id:"A",label:"A",priority:Infinity}]}), RangeError);
  assert.throws(() => createHierarchySystem({id:"broken",name:"Bad",levels:[
    {id:"A",label:"A",priority:1},{id:"B",label:"B",priority:2},
  ],relationships:[{from:"A",to:"missing",kind:"sequence",reason:"bad reference"}]}), /missing/);
  assert.throws(() => createHierarchySystem({id:"broken",name:"Bad",levels:[
    {id:"A",label:"A",priority:1},{id:"B",label:"B",priority:2},
  ],relationships:[
    {from:"A",to:"B",kind:"dependency",reason:"one"},
    {from:"B",to:"A",kind:"sequence",reason:"two"},
  ]}), /cyclic/);
  assert.throws(() => createHierarchySystem({id:"broken",name:"Bad",levels:[
    {id:"A",label:"A",priority:1,strategies:["same","same"]},
  ]}), /duplicate/);
  // Non-order emphasis/grouping relationships can legitimately be bidirectional.
  const parallel=createHierarchySystem({id:"ok",name:"OK",levels:[
    {id:"A",label:"A",priority:2},{id:"B",label:"B",priority:1},
  ],relationships:[
    {from:"A",to:"B",kind:"grouping",reason:"together"},
    {from:"B",to:"A",kind:"emphasis",reason:"related"},
  ]});
  assert.equal(parallel.relationships?.length,2);
});

test("optional semantic vocab can be fully replaced with creator-owned roles", () => {
  assert.ok(semantic.document.includes("article"));
  assert.ok(semantic.accessibility.includes("skip-link"));
  assert.ok(semantic.responsive.includes("reflow"));
  assert.deepEqual(defineSemanticRoles(["lookahead", "العنوان", "summary/detail"]), ["lookahead", "العنوان", "summary/detail"]);
  assert.deepEqual(defineSemanticRoles([]), []);
  assert.throws(() => defineSemanticRoles(["same","same"]), RangeError);
  assert.throws(() => defineSemanticRoles(["\n"]), TypeError);
});

test("responsive examples keep source order intact at 320px, 768px and 1440px (fixture-level only)", () => {
  const fixtures = JSON.parse(readFileSync(resolve(process.cwd(), "examples/hierarchy/layouts.json"), "utf8")) as {
    examples: Array<SemanticFlowAudit & { name: string }>;
  };
  assert.equal(fixtures.examples.length,2);
  for (const example of fixtures.examples) {
    assert.deepEqual(example.viewports.map((v) => v.widthPx), [320,768,1440]);
    assert.deepEqual(auditReadingOrder(example), [], example.name);
    const filename = example.name === "product-summary" ? "product-summary.html" : "article.html";
    const markup = readFileSync(resolve(process.cwd(), "examples/hierarchy", filename), "utf8");
    const actual = [...markup.matchAll(/data-uf-order-id="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(actual, example.nodes.map((node) => node.id), filename);
    assert.match(markup, /<main\b/);
    assert.match(markup, /<h1\b/);
    assert.match(markup, /href="#main"/);
    assert.doesNotMatch(markup, /\border\s*:/);
  }
});

test("reading-order analyzer warns about visual/DOM and focus divergence without claiming WCAG conformance", () => {
  const data: SemanticFlowAudit = {
    nodes:[{id:"heading"},{id:"cta",focusable:true},{id:"details"},{id:"other-link",focusable:true}],
    viewports:[
      {widthPx:320,visualOrder:["heading","cta","details","other-link"]},
      {widthPx:1440,visualOrder:["heading","other-link","details","cta"]},
    ],
  };
  const issues=auditReadingOrder(data);
  assert.deepEqual(issues.map(i=>i.code), ["visual-dom-divergence","focus-dom-divergence"]);
  assert.ok(issues.every((i)=>i.severity==="warning"&&i.widthPx===1440));
  const incomplete=auditReadingOrder({nodes:[{id:"a"},{id:"b"}],viewports:[
    {widthPx:500,visualOrder:["a","a","ghost"]},
  ]});
  assert.deepEqual(incomplete.map(i=>i.code),["duplicate-node","unexpected-node","missing-node"]);
  assert.throws(() => auditReadingOrder({nodes:[{id:"a"},{id:"a"}],viewports:[]}),RangeError);
  assert.throws(() => auditReadingOrder({nodes:[],viewports:[{widthPx:0,visualOrder:[]}]}),RangeError);
});
