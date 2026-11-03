import test from "node:test";
import assert from "node:assert/strict";
import {
  modularScale, spacingStep, spacingScale, linearInterpolate, fluidValueAt,
  fluidClamp, goldenSplit, columnWidth, contrastRatio, passesWcagAA,
  relativeLuminance, fibonacci, fibonacciRatio, goldenRectangle, rootRectangleRatio,
  fittsDifficultyBits, fittsMovementTimeMs, hickHymanDifficultyBits, hickHymanChoiceTimeMs,
} from "../src/foundation-formular/index.js";
import {
  gridTrackLayout, gridTrackWidths, gridSpanWidth,
  rootRectangleHeight, ruleOfThirdsGuides, goldenSectionGuides,
} from "../src/grid/index.js";

test("modular scale preserves starter behavior but accepts original creator parameters", () => {
  assert.equal(modularScale(0), 16);
  assert.equal(modularScale(1), 20);
  assert.equal(modularScale(-1), 12.8);
  assert.equal(modularScale(2, 10, 1.5), 22.5);
  for (const base of [10, 14, 18]) {
    let last = 0;
    for (let step = -3; step <= 7; step++) {
      const value = modularScale(step, base, 1.2);
      assert.ok(value > last);
      last = value;
    }
  }
  for (const value of [Infinity, NaN]) assert.throws(() => modularScale(value), RangeError);
  assert.throws(() => modularScale(5000, 16, 1.5), RangeError);
  assert.throws(() => modularScale(1, 16, 1), RangeError);
});

test("spacing values are user-owned and reject negative, overflow or unrepresentable input", () => {
  assert.equal(spacingStep(6), 24);
  assert.deepEqual(spacingScale([0, 1, 2.5, 4], 6), [0, 6, 15, 24]);
  assert.deepEqual(spacingScale([], 6), []);
  assert.throws(() => spacingStep(-1), RangeError);
  assert.throws(() => spacingStep(Infinity), RangeError);
  assert.throws(() => spacingStep(Number.MAX_VALUE, 2), RangeError);
  assert.throws(() => spacingScale([1, -2], 8), RangeError);
});

test("linear interpolation clamps by default but allows extrapolation and reversed outputs", () => {
  assert.equal(linearInterpolate(50, 0, 100, 0, 10), 5);
  assert.equal(linearInterpolate(-20, 0, 100, 0, 10), 0);
  assert.equal(linearInterpolate(120, 0, 100, 10, 0), 0);
  assert.equal(linearInterpolate(120, 0, 100, 0, 10, false), 12);
  assert.throws(() => linearInterpolate(10, 1, 1, 0, 10), RangeError);
  assert.throws(() => linearInterpolate(NaN, 1, 2, 0, 10), RangeError);
});

test("fluid expressions and numerical interpolation retain endpoints and bounds", () => {
  assert.match(fluidClamp(16, 32), /^clamp\(16px, calc\(/);
  assert.equal(fluidValueAt(320, 16, 32, 320, 1280), 16);
  assert.equal(fluidValueAt(1280, 16, 32, 320, 1280), 32);
  assert.equal(fluidValueAt(800, 16, 32, 320, 1280), 24);
  assert.equal(fluidValueAt(100, 16, 32, 320, 1280), 16);
  assert.equal(fluidValueAt(2000, 16, 32, 320, 1280), 32);
  for (let viewport = 320, previous = 0; viewport <= 1280; viewport += 40) {
    const current = fluidValueAt(viewport, 14, 28, 320, 1280);
    assert.ok(current >= previous && current >= 14 && current <= 28);
    previous = current;
  }
  assert.throws(() => fluidClamp(32, 16), RangeError);
  assert.throws(() => fluidClamp(16, 32, 900, 600), RangeError);
  assert.throws(() => fluidValueAt(Infinity, 16, 24), RangeError);
});

test("equal and spanned columns reconcile without overflow, for arbitrary grid count", () => {
  assert.equal(columnWidth(1200, 12, 20), (1200 - 11 * 20) / 12);
  assert.equal(gridTrackWidths(1200, 5, 12), (1200 - 4 * 12) / 5);
  for (const columns of [1, 3, 5, 8, 12, 24]) {
    const layout = gridTrackLayout(1440, columns, 12, 24);
    assert.ok(Math.abs(layout.trackPx * columns + layout.totalGapsPx + 2 * layout.outerPaddingPx - 1440) < 1e-8);
    assert.ok(Math.abs(gridSpanWidth(1440, columns, columns, 12, 24) - layout.innerWidthPx) < 1e-8);
  }
  assert.throws(() => columnWidth(100, 12, 20), RangeError);
  assert.throws(() => gridTrackLayout(100, 3, 5, 50), RangeError);
  assert.throws(() => gridTrackLayout(100, 2.5, 4), RangeError);
  assert.throws(() => gridSpanWidth(100, 3, 4, 4), RangeError);
  assert.throws(() => gridSpanWidth(100, 3, 0, 4), RangeError);
});

test("golden and root geometry return dimensions without prescribing a layout", () => {
  const { primary, secondary } = goldenSplit(1000);
  assert.ok(primary > secondary);
  assert.ok(Math.abs(primary + secondary - 1000) < 0.001);
  const rect = goldenRectangle(1000);
  assert.ok(Math.abs(rect.longSidePx / rect.shortSidePx - rect.ratio) < 1e-12);
  assert.equal(rootRectangleRatio(4), 2);
  assert.equal(rootRectangleHeight(300, 4), 600);
  assert.throws(() => rootRectangleRatio(6 as 2), RangeError);
  assert.throws(() => rootRectangleHeight(Number.MAX_VALUE, 5), RangeError);
});

test("Fibonacci progression uses safe integers and converges toward phi", () => {
  assert.deepEqual(Array.from({ length: 9 }, (_, i) => fibonacci(i)), [0, 1, 1, 2, 3, 5, 8, 13, 21]);
  assert.equal(fibonacci(78), 8944394323791464);
  assert.ok(Math.abs(fibonacciRatio(40) - (1 + Math.sqrt(5)) / 2) < 1e-10);
  assert.throws(() => fibonacci(79), RangeError);
  assert.throws(() => fibonacci(-1), RangeError);
  assert.throws(() => fibonacciRatio(1), RangeError);
});

test("thirds and golden section positions are ordered and inside original dimensions", () => {
  const thirds = ruleOfThirdsGuides(1200, 900);
  assert.deepEqual(thirds.verticalPx, [400, 800]);
  assert.deepEqual(thirds.horizontalPx, [300, 600]);
  const golden = goldenSectionGuides(1200, 900);
  assert.ok(golden.verticalPx[0] > 0 && golden.verticalPx[1] < 1200);
  assert.ok(golden.verticalPx[0] < golden.verticalPx[1]);
  assert.ok(Math.abs(golden.verticalPx[0] + golden.verticalPx[1] - 1200) < 1e-9);
  assert.throws(() => ruleOfThirdsGuides(0, 10), RangeError);
  assert.throws(() => goldenSectionGuides(10, Infinity), RangeError);
});

test("Fitts and Hick–Hyman models require empirical timing coefficients", () => {
  assert.equal(fittsDifficultyBits(100, 100), 1);
  assert.equal(fittsDifficultyBits(0, 100), 0);
  assert.ok(fittsDifficultyBits(300, 20) > fittsDifficultyBits(100, 20));
  assert.ok(fittsDifficultyBits(100, 20) > fittsDifficultyBits(100, 40));
  assert.equal(fittsMovementTimeMs(100, 100, { interceptMs: 150, slopeMsPerBit: 100 }), 250);
  assert.equal(hickHymanDifficultyBits(3), 2);
  assert.equal(hickHymanChoiceTimeMs(3, { interceptMs: 200, slopeMsPerBit: 80 }), 360);
  assert.throws(() => fittsDifficultyBits(-1, 10), RangeError);
  assert.throws(() => fittsDifficultyBits(10, 0), RangeError);
  assert.throws(() => hickHymanDifficultyBits(2.5), RangeError);
  assert.throws(() => hickHymanDifficultyBits(0), RangeError);
  assert.throws(() => fittsMovementTimeMs(10, 20, { interceptMs: -1, slopeMsPerBit: 2 }), RangeError);
});

test("WCAG contrast math is unchanged and rejects unsupported hex colors", () => {
  assert.equal(relativeLuminance("#000000"), 0);
  assert.equal(relativeLuminance("#ffffff"), 1);
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  assert.equal(passesWcagAA("#777777", "#ffffff"), false);
  assert.equal(passesWcagAA("#000000", "#ffffff"), true);
  assert.throws(() => contrastRatio("white", "#000000"), TypeError);
});
