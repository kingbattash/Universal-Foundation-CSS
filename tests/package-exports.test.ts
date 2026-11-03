import test from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

const root=process.cwd()
const pkg=JSON.parse(readFileSync(resolve(root,"package.json"),"utf8"))
const expectedExports: Record<string,string> = {
  ".":"./dist/src/index.js",
  "./css":"./src/css/foundation.css",
  "./tokens.css":"./src/css/tokens.generated.css",
  "./tailwind-v3":"./adapters/tailwind-v3/preset.generated.cjs",
  "./tailwind-v4":"./adapters/tailwind-v4/theme.generated.css",
  "./bootstrap":"./adapters/bootstrap/bootstrap.generated.css",
  "./stylex":"./adapters/stylex/tokens.generated.stylex.ts",
  "./react-native":"./adapters/react-native/tokens.generated.ts",
  "./package.json":"./package.json",
}
test("public exports resolve to files actually present after build",async()=>{
  assert.equal(pkg.type,"module")
  assert.equal(pkg.license,"Apache-2.0")
  assert.ok(pkg.sideEffects.includes("**/*.css"),"CSS side-effect imports must not be tree-shaken")
  assert.equal(pkg.peerDependenciesMeta?.["@stylexjs/stylex"]?.optional,true)
  for(const [subpath, target] of Object.entries(expectedExports)){
    const value=pkg.exports[subpath]
    const chosen=typeof value==="string"?value:value?.default
    assert.equal(chosen,target,`Unexpected export for ${subpath}`)
    assert.ok(existsSync(resolve(root,target)),`Missing exported file: ${target}`)
  }
  assert.equal(pkg.exports["."].types,"./dist/src/index.d.ts")
  assert.ok(existsSync(resolve(root,pkg.exports["."].types)))
  const library=await import(pathToFileURL(resolve(root,pkg.exports["."].default)).href)
  assert.equal(typeof library.modularScale,"function")
  assert.equal(library.modularScale(0),16)
})
test("npm pack dry-run includes all advertised entry points and excludes tests",()=>{
  const out=spawnSync("npm",["pack","--dry-run","--json","--ignore-scripts"],{
    cwd:root,encoding:"utf8",timeout:60000,maxBuffer:5*1024*1024,
  })
  assert.equal(out.status,0,`npm pack failed: ${out.stderr}`)
  const packed=JSON.parse(out.stdout) as Array<{files:Array<{path:string}>}>
  assert.equal(packed.length,1)
  const paths=new Set(packed[0].files.map(f=>f.path))
  for(const target of Object.values(expectedExports)){
    assert.ok(paths.has(target.replace(/^\.\//,"")),`Export absent from tarball: ${target}`)
  }
  assert.ok(paths.has("dist/src/index.d.ts"))
  assert.ok(paths.has("scripts/cli.mjs"))
  assert.ok(paths.has("scripts/init-project.mjs"))
  assert.ok(paths.has("scripts/lib/init/config.mjs"))
  assert.equal(pkg.bin["uf-css"], "./scripts/cli.mjs")
  assert.ok(paths.has("LICENSE"))
  assert.ok(paths.has("README.md"))
  assert.ok(!Array.from(paths).some(p=>p.startsWith("node_modules/")||p.startsWith("tests/")))
})
