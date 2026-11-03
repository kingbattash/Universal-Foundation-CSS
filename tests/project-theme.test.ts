import test from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join,resolve } from "node:path"
import { spawnSync } from "node:child_process"

const repo=process.cwd();
const cli=resolve(repo,"scripts/generate-project-theme.mjs");
const config=resolve(repo,"examples/project-theme/theme.json");
const run=(args:string[])=>spawnSync(process.execPath,[cli,...args],{cwd:repo,encoding:"utf8"});

test("generated project theme has a web, Bootstrap, StyleX and native adapter",async()=>{
  const folder=await mkdtemp(join(tmpdir(),"uf-css-project-"));
  try {
    const out=join(folder,"outputs");
    const args=["--config",config,"--out",out];
    const create=run(args);
    assert.equal(create.status,0,create.stderr);
    const names=await readdir(out);
    assert.deepEqual(names.sort(),["bootstrap.css","native-theme.ts","stylex-theme.ts","theme.css","theme.manifest.json"].sort());
    assert.match(await readFile(join(out,"theme.css"),"utf8"),/--uf-action: #005bbb/);
    assert.match(await readFile(join(out,"bootstrap.css"),"utf8"),/--bs-primary-rgb: 0, 91, 187/);
    assert.match(await readFile(join(out,"stylex-theme.ts"),"utf8"),/stylex.createTheme/);
    assert.match(await readFile(join(out,"native-theme.ts"),"utf8"),/"name": "example-product"/);
    const verify=run([...args,"--check"]);
    assert.equal(verify.status,0,verify.stderr);
    const deny=run(args);
    assert.notEqual(deny.status,0,"Should require --force for existing outputs");
    const force=run([...args,"--force"]);
    assert.equal(force.status,0,force.stderr);
    await writeFile(join(out,"theme.css"),"drift");
    const stale=run([...args,"--check"]);
    assert.notEqual(stale.status,0,"Checks must fail on user modifications");
  } finally {await rm(folder,{recursive:true,force:true})}
});
test("rejects unknown roles, invalid colors and insufficient contrast without writing output",async()=>{
  const folder=await mkdtemp(join(tmpdir(),"uf-css-theme-invalid-"));
  try {
    for(const [name,overrides] of [
      ["unknown",{light:{nonexistent:"#123456"}}],
      ["unsafe",{light:{action:"red; background:black"}}],
      ["contrast",{light:{action:"#ffffff",onAction:"#ffffff"}}],
    ] as const) {
      const conf=join(folder,`${name}.json`);
      const out=join(folder,`${name}-out`);
      await writeFile(conf,JSON.stringify({name:"example-product",...overrides}));
      const result=run(["--config",conf,"--out",out]);
      assert.notEqual(result.status,0,`Expected bad config ${name} to fail`);
      await assert.rejects(()=>readdir(out),{code:"ENOENT"});
    }
  } finally {await rm(folder,{recursive:true,force:true})}
});
