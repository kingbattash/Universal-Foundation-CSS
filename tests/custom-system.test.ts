import test from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { spawnSync } from "node:child_process"

const repo = process.cwd()
const cli = resolve(repo, "scripts/generate-custom-system.mjs")
const run = (args: string[]) => spawnSync(process.execPath, [cli, ...args], { cwd: repo, encoding: "utf8" })

test("two unrelated design systems compile with no inherited mandatory style", async () => {
  for (const [name, prefix] of [["editorial", "press"], ["operations", "ops"]] as const) {
    const folder = await mkdtemp(join(tmpdir(), "uf-css-user-owned-"))
    try {
      const config = resolve(repo, "examples/custom-systems", name, "tokens.json")
      const mapping = resolve(repo, "examples/custom-systems", name, "mapping.json")
      const out = join(folder, "output")
      const options = ["--tokens", config, "--mapping", mapping, "--prefix", prefix, "--out", out]
      const result = run(options)
      assert.equal(result.status, 0, result.stderr)
      const names = await readdir(out)
      assert.equal(names.length, 7)
      const css = await readFile(join(out, "tokens.css"), "utf8")
      const tw = await readFile(join(out, "tailwind-v4.css"), "utf8")
      const native = await readFile(join(out, "native.ts"), "utf8")
      const bootstrap = await readFile(join(out, "bootstrap.css"), "utf8")
      const stylex = await readFile(join(out, "stylex.stylex.ts"), "utf8")
      assert.ok(css.includes("--" + prefix + "-"))
      assert.ok(tw.includes("--color-" + prefix + "-"))
      assert.ok(bootstrap.includes("--bs-primary-rgb:"))
      assert.match(stylex, /stylex\.defineVars/)
      assert.match(native, /as const/)
      assert.equal(run([...options, "--check"]).status, 0)
      assert.notEqual(run(options).status, 0, "Default should never overwrite")
      assert.equal(run([...options, "--force"]).status, 0)
      await writeFile(join(out, "tokens.css"), "drift")
      assert.notEqual(run([...options, "--check"]).status, 0)
      if (name === "editorial") {
        assert.match(css, /--press-paper-canvas: #fff7ed/)
        assert.match(css, /--press-roles-reading-ink: #292524/)
        assert.doesNotMatch(css, /--ops-navy-canvas/)
      } else {
        assert.match(css, /--ops-navy-canvas: #0b1220/)
        assert.match(css, /--ops-states-call-to-action: #22d3ee/)
        assert.doesNotMatch(css, /--press-paper-canvas/)
      }
    } finally {
      await rm(folder, { recursive: true, force: true })
    }
  }
})
test("no adapter mapping or starter semantic roles are required", async () => {
  const folder = await mkdtemp(join(tmpdir(), "uf-css-unmapped-"))
  try {
    const config = join(folder, "tokens.json")
    const out = join(folder, "build")
    await writeFile(config, JSON.stringify({ isolated: { ownValue: { $type: "number", $value: 7 } } }))
    const r = run(["--tokens", config, "--prefix", "unmapped", "--out", out])
    assert.equal(r.status, 0, r.stderr)
    assert.match(await readFile(join(out, "tokens.css"), "utf8"), /--unmapped-isolated-own-value: 7/)
    assert.doesNotMatch(await readFile(join(out, "tailwind-v4.css"), "utf8"), /--color-/)
  } finally { await rm(folder, { recursive: true, force: true }) }
})
test("invalid aliases, unsafe names, invalid types and collisions are rejected", async () => {
  const folder = await mkdtemp(join(tmpdir(), "uf-css-invalid-"))
  const bad = [
    { x: { a: { $type: "color", $value: "{x.missing}" } } },
    { x: { a: { $type: "color", $value: "{x.b}" }, b: { $value: "{x.a}" } } },
    { x: { a: { $type: "color", $value: "#ffffff" } } },
    { "a; color: red": { x: { $type: "number", $value: 1 } } },
    { one: { fooBar: { $type: "number", $value: 1 }, "foo-bar": { $type: "number", $value: 2 } } },
    { text: { value: { $type: "string", $value: "unsupported" } } },
  ]
  try {
    for (const [index, invalid] of bad.entries()) {
      const config = join(folder, index + ".json"), out = join(folder, index + "-out")
      await writeFile(config, JSON.stringify(invalid))
      const r = run(["--tokens", config, "--prefix", "test", "--out", out])
      assert.notEqual(r.status, 0, "Invalid configuration " + index + " should fail")
      await assert.rejects(() => readdir(out), { code: "ENOENT" })
    }
    const config = resolve(repo, "examples/custom-systems/editorial/tokens.json")
    const invalidPrefix = run(["--tokens", config, "--prefix", "bad;body", "--out", join(folder,"bad-prefix")])
    assert.notEqual(invalidPrefix.status, 0)
    const invalidMapping = join(folder, "invalid-mapping.json")
    await writeFile(invalidMapping, JSON.stringify({ tailwind: { colors: { wrong: "rhythm.small" } } }))
    assert.notEqual(run(["--tokens", config, "--mapping", invalidMapping, "--prefix", "test", "--out", join(folder,"wrong")]).status, 0)
  } finally { await rm(folder, { recursive: true, force: true }) }
})
