import test from "node:test"
import assert from "node:assert/strict"
import { hierarchy, listHierarchyFamily } from "../src/hierarchy/index.js"
import { gridRegistry, getGrid, listGrids, thirds, phiSections } from "../src/grid/index.js"
import { componentContracts } from "../src/components/index.js"
import { patterns } from "../src/patterns/index.js"

test("exactly 20 practical hierarchy categories with unique ids", () => {
  assert.equal(hierarchy.length, 20)
  assert.equal(new Set(hierarchy.map((h) => h.id)).size, 20)
  assert.equal(listHierarchyFamily("visual-technique").length, 7)
})
test("grid registry distinguishes CSS recipes from references", () => {
  assert.equal(gridRegistry.length, 37)
  assert.equal(new Set(gridRegistry.map((g)=>g.id)).size, 37)
  assert.equal(getGrid("golden-canon").support, "reference")
  assert.equal(getGrid("twelve-column").support, "css-recipe")
  assert.equal(listGrids("classical").length, 6)
  assert.ok(Math.abs(thirds(300)[0]-100)<0.001)
  assert.ok(phiSections(900).primary>phiSections(900).secondary)
})
test("pattern and component contracts remain referenced and accessible", () => {
  for(const pattern of patterns) {
    for(const gridId of pattern.suggestedGrids) assert.ok(gridRegistry.some(g=>g.id===gridId))
    for(const hierarchyId of pattern.hierarchy) assert.ok(hierarchy.some(h=>h.id===hierarchyId))
  }
  assert.ok(componentContracts.button.accessibility.some(x=>x.includes("Accessible name")))
  assert.ok(componentContracts.dialog.accessibility.some(x=>x.includes("focus")))
})
