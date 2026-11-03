import { foundation } from "./foundation.js";

/** Exact Fibonacci integer F(n), for 0 <= n <= 78 (JavaScript safe-integer range). */
export function fibonacci(index: number): number {
  if (!Number.isSafeInteger(index) || index < 0 || index > 78) {
    throw new RangeError("index must be a safe integer from 0 to 78");
  }
  if (index < 2) return index;
  let previous = 0;
  let current = 1;
  for (let i = 2; i <= index; i += 1) {
    const next = previous + current;
    if (!Number.isSafeInteger(next)) throw new RangeError("Fibonacci result exceeds safe integer range");
    previous = current;
    current = next;
  }
  return current;
}

/** Ratio F(n) / F(n-1) for n>=2; approaches phi without equaling it. */
export function fibonacciRatio(index: number): number {
  if (!Number.isSafeInteger(index) || index < 2 || index > 78) {
    throw new RangeError("index must be a safe integer from 2 to 78");
  }
  return fibonacci(index) / fibonacci(index - 1);
}

/** Constructs the short side from a creator-selected long side in CSS px. */
export function goldenRectangle(longSidePx: number): Readonly<{ longSidePx: number; shortSidePx: number; ratio: number }> {
  if (!Number.isFinite(longSidePx) || longSidePx <= 0) throw new RangeError("longSidePx must be positive and finite");
  const shortSidePx = longSidePx / foundation.goldenRatio;
  if (!Number.isFinite(shortSidePx) || shortSidePx <= 0) throw new RangeError("short side is not representable");
  return { longSidePx, shortSidePx, ratio: foundation.goldenRatio };
}
