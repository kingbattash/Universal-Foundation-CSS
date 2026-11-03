#!/usr/bin/env node
/*
 * Test a real local tarball install without publishing to npm.
 * The package must work from another directory—not only from the repo tree.
 */
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath } from "node:url"

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..")
const npm=process.platform==="win32"?"npm.cmd":"npm"
const scratch=await mkdtemp(join(tmpdir(),"uf-css-packed-"))

function run(command,args,cwd){
  const outcome=spawnSync(command,args,{cwd,encoding:"utf8",timeout:120000,maxBuffer:5*1024*1024});
  if(outcome.error)throw outcome.error
  assert.equal(outcome.status,0,`Failed: ${command} ${args.join(" ")}\n${outcome.stdout}\n${outcome.stderr}`)
  return outcome.stdout
}
try{
  const info=JSON.parse(run(npm,["pack","--json","--ignore-scripts","--pack-destination",scratch],root));
  assert.equal(info.length,1,"Expected exactly one npm package")
  const tarball=join(scratch,info[0].filename)
  // Install a local tarball without network or optional framework dependencies.
  run(npm,["install","--prefix",scratch,"--offline","--ignore-scripts","--no-save","--no-audit","--no-fund","--package-lock=false","--omit=optional",tarball],scratch)

  const fixture=`import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import {modularScale,spacingStep,gridRegistry} from "@kingbattash/universal-foundation-css";

const require=createRequire(import.meta.url);
assert.equal(modularScale(1),20);
assert.equal(spacingStep(4),16);
assert.ok(gridRegistry.length>0);

const preset=require("@kingbattash/universal-foundation-css/tailwind-v3");
assert.equal(preset.theme.extend.colors["uf-action"],"var(--uf-action)");

for(const subpath of ["/css","/tokens.css","/tailwind-v4","/bootstrap","/stylex","/react-native"]){
  const filepath=require.resolve("@kingbattash/universal-foundation-css"+subpath);
  assert.ok(readFileSync(filepath,"utf8").length>50, "Empty export "+subpath);
}
console.log("PASS: installed tarball exports usable outside repository");
`;
  await writeFile(join(scratch,"consumer-smoke.mjs"),fixture,"utf8")
  const stdout=run(process.execPath,["consumer-smoke.mjs"],scratch)
  process.stdout.write(stdout)
  const customTokens={custom:{size:{$type:"dimension",$value:{value:13,unit:"px"}}}}
  const input=join(scratch,"custom.tokens.json")
  await writeFile(input,JSON.stringify(customTokens))
  const compiler=join(scratch,"node_modules","@kingbattash","universal-foundation-css","scripts","generate-custom-system.mjs")
  run(process.execPath,[compiler,"--tokens",input,"--prefix","independent","--out",join(scratch,"my-system")],scratch)
  const stylesheet=await readFile(join(scratch,"my-system","tokens.css"),"utf8")
  assert.match(stylesheet,/--independent-custom-size: 13px/)
  console.log("PASS: installed CLI creates custom tokens without universal presets")
  const builderConfig={schemaVersion:1,name:"portable-demo",frameworks:["vanilla-css","tailwind-v4"],design:{colors:{accent:"#147d87"},grids:{layouts:[{id:"twelve-column"}],guides:["golden-ratio"]},hierarchy:["information"]}}
  const builderInput=join(scratch,"builder-config.json")
  const builderOut=join(scratch,"generated-by-wizard")
  await writeFile(builderInput,JSON.stringify(builderConfig))
  const executable=join(scratch,"node_modules","@kingbattash","universal-foundation-css","scripts","cli.mjs")
  const preview=run(process.execPath,[executable,"init","--config",builderInput,"--out",builderOut,"--dry-run"],scratch)
  assert.match(preview,/Design system preview/)
  const created=run(process.execPath,[executable,"init","--config",builderInput,"--out",builderOut,"--yes"],scratch)
  assert.match(created,/Created your own design system/)
  assert.match(await readFile(join(builderOut,"generated","tokens.css"),"utf8"),/--portable-demo-palette-accent: #147d87/)
  console.log("PASS: packaged uf-css init previews before creating a custom system")
}finally{
  await rm(scratch,{recursive:true,force:true})
}
