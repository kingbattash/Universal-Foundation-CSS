import test from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { generatedTokens } from "../src/tokens/generated.js"
import { coreTokens, layoutTokens, starterNeutralTheme, starterNeutralDarkTheme } from "../src/tokens/index.js"

const repo = process.cwd()
const file = (path: string) => readFileSync(resolve(repo, path), "utf8")

test("generators produce deterministic committed outputs", () => {
  const check = spawnSync(process.execPath, ["scripts/generate-tokens.mjs", "--check"], { cwd: repo, encoding: "utf8" })
  assert.equal(check.status, 0, check.stderr)
})
test("typed core exports consume the generated canonical source", () => {
  assert.equal(coreTokens.neutral.white, generatedTokens.colors.white)
  assert.equal(layoutTokens.containerMaxPx, generatedTokens.layout.containerMax)
  assert.deepEqual(starterNeutralTheme, generatedTokens.light)
  assert.deepEqual(starterNeutralDarkTheme, generatedTokens.dark)
})
test("vanilla CSS only uses namespaced tokens and includes generated theme variables", () => {
  const css=file("src/css/foundation.css")
  const vars=file("src/css/tokens.generated.css")
  assert.match(css, /@import "\.\/tokens\.generated\.css";/)
  assert.match(vars, /--uf-canvas: #ffffff;/)
  assert.match(vars, /--uf-action: #111111;/)
  assert.match(vars, /--uf-action: #8cb4ff;/)
})
test("Tailwind adapters reference CSS variables instead of hardcoding a brand", () => {
  const theme=file("adapters/tailwind-v4/theme.generated.css")
  const preset=file("adapters/tailwind-v3/preset.generated.cjs")
  assert.match(theme, /@theme inline/)
  assert.match(theme, /--color-uf-canvas: var\(--uf-canvas\);/)
  assert.match(preset, /var\(--uf-action\)/)
})
test("Bootstrap, StyleX and Native adapters share core light and dark roles", () => {
  const bootstrap=file("adapters/bootstrap/bootstrap.generated.css")
  const stylex=file("adapters/stylex/tokens.generated.stylex.ts")
  const native=file("adapters/react-native/tokens.generated.ts")
  assert.match(bootstrap, /--bs-primary: var\(--uf-action\);/)
  assert.match(bootstrap, /--bs-primary-rgb: 140, 180, 255;/)
  assert.match(stylex, /stylex\.defineVars/)
  assert.match(stylex, /stylex\.createTheme/)
  assert.ok(native.includes(`"canvas": "${generatedTokens.light.canvas}"`))
  assert.ok(native.includes(`"canvas": "${generatedTokens.dark.canvas}"`))
})
