import test from "node:test"
import assert from "node:assert/strict"
import { modularScale, spacingStep, fluidClamp, goldenSplit, columnWidth, contrastRatio, passesWcagAA, relativeLuminance } from "../src/foundation-formular/index.js"

test("modular scale defaults", () => {
  assert.equal(modularScale(0), 16)
  assert.equal(modularScale(1), 20)
  assert.equal(modularScale(-1), 12.8)
})
test("spacing units reject invalid inputs", () => {
  assert.equal(spacingStep(6), 24)
  assert.throws(() => spacingStep(-1), RangeError)
  assert.throws(() => spacingStep(Number.POSITIVE_INFINITY), RangeError)
})
test("fluid clamp outputs CSS and validates bounds", () => {
  assert.match(fluidClamp(16, 32), /^clamp\(16px, calc\(/)
  assert.throws(() => fluidClamp(32, 16), RangeError)
  assert.throws(() => fluidClamp(16, 32, 900, 600), RangeError)
})
test("column and golden geometry retain dimensions", () => {
  assert.equal(columnWidth(1200, 12, 20), (1200-11*20)/12)
  assert.throws(() => columnWidth(100, 12, 20), RangeError)
  const { primary, secondary } = goldenSplit(1000)
  assert.ok(primary > secondary)
  assert.ok(Math.abs(primary + secondary - 1000) < 0.001)
})
test("WCAG contrast math", () => {
  assert.equal(relativeLuminance("#000000"), 0)
  assert.equal(relativeLuminance("#ffffff"), 1)
  assert.equal(contrastRatio("#000000", "#ffffff"), 21)
  assert.equal(passesWcagAA("#777777", "#ffffff"), false)
  assert.equal(passesWcagAA("#000000", "#ffffff"), true)
  assert.throws(() => contrastRatio("white", "#000000"), TypeError)
})
