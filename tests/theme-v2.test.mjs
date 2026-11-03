import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, writeFile, rm, symlink, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { normalizeThemeV2, renderThemeV2Files } from "../scripts/lib/theme-v2.mjs";

const root=process.cwd();
const path=name=>resolve(root,"examples/project-theme",name+".v2.json");
const run=(args)=>spawnSync(process.execPath,["scripts/generate-project-theme.mjs",...args],{cwd:root,encoding:"utf8",timeout:60000});
const read=async name=>JSON.parse(await readFile(path(name),"utf8"));

test("two unrelated themes use only creator values, mode overrides and custom typography",async()=>{
  const editorial=normalizeThemeV2(await read("editorial"));
  const operational=normalizeThemeV2(await read("operations"));
  assert.equal(editorial.name,"copper-editorial");
  assert.equal(operational.name,"harbor-operations");
  const a=renderThemeV2Files(editorial),b=renderThemeV2Files(operational);
  assert.equal(Object.keys(a).length,8);
  assert.match(a["theme.css"],/--copper-editorial-ui-canvas: #fff8ee/);
  assert.match(a["theme.css"],/--copper-editorial-ui-canvas: #211b20/);
  assert.match(b["theme.css"],/--harbor-operations-ui-canvas: #f2faff/);
  assert.match(b["theme.css"],/--harbor-operations-ui-canvas: #071421/);
  assert.doesNotMatch(a["theme.css"],/--uf-canvas|--harbor-operations-/);
  assert.doesNotMatch(b["theme.css"],/--uf-canvas|--copper-editorial-/);
  assert.match(a["theme.css"],/--copper-editorial-typography-heading: Georgia, serif/);
  assert.match(a["theme.css"],/--copper-editorial-ui-focus: #f3b6c9/);
  assert.match(b["theme.css"],/--harbor-operations-ui-action-hover: #aaecff/);
  assert.match(b["theme.css"],/--harbor-operations-corners-card: 16px/);
  assert.ok(b["tailwind-v4.css"].includes("--color-harbor-operations-action: var(--harbor-operations-ui-action)"));
  assert.match(a["tailwind-v3.cjs"],/copper-editorial-comfortable/);
  assert.match(b["bootstrap.css"],/--bs-body-bg-rgb: 7, 20, 33/);
  assert.match(a["stylex-vars.stylex.ts"],/stylex.defineVars/);
  assert.match(a["stylex-theme.stylex.ts"],/stylex.createTheme/);
  assert.match(b["native-theme.ts"],/"enter": 125/);
  assert.equal(JSON.parse(a["theme.manifest.json"]).contrastChecks.length,10);
  assert.equal(JSON.parse(b["theme.manifest.json"]).contrastChecks.length,10);
  assert.ok(editorial.contrastChecks.every(c=>c.passed));
  assert.ok(operational.contrastChecks.every(c=>c.passed));
});
test("v2 CLI generates safely and maintains check/force behavior",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"uf-css-theme-v2-"));
  try{
    for(const name of ["editorial","operations"]){
      const out=join(dir,name);
      const args=["--config",path(name),"--out",out];
      const c=run(args);
      assert.equal(c.status,0,c.stderr);
      assert.equal((await readdir(out)).length,8);
      assert.equal(run([...args,"--check"]).status,0);
      assert.notEqual(run(args).status,0,"must refuse unsafe overwrites");
      assert.equal(run([...args,"--force"]).status,0);
      await writeFile(join(out,"theme.css"),"drift");
      assert.notEqual(run([...args,"--check"]).status,0);
      assert.equal(run([...args,"--force"]).status,0);
    }
  }finally{await rm(dir,{recursive:true,force:true});}
});
test("theme v2 rejects invalid modes, unknown token overrides, and insufficient contrast before any writes",async()=>{
  const folder=await mkdtemp(join(tmpdir(),"uf-css-theme-invalid-v2-"));
  try{
    const original=await read("editorial");
    const bad=[
      {...original,modes:{dark:{ui:{invented:{$value:"#ffffff"}}}}},
      {...original,modes:{dark:{ui:{action:{$value:{colorSpace:"srgb",components:[1,1,1],hex:"#ffffff"}}}}}},
      {...original,contrastChecks:[{name:"nope",foreground:"wrong.path",background:"ui.canvas"}]},
      {...original,tokens:{brand:{wrong:{$type:"color",$value:"red"}}}},
      {...original,mapping:{tailwind:{colors:{bad:"spacing.compact"}}}},
      {...original,modes:{sunset:{ui:{}}}},
      {...original,name:"bad;css"},
    ];
    for(const [index,config] of bad.entries()){
      const input=join(folder,"bad-"+index+".json"),output=join(folder,"bad-"+index);
      await writeFile(input,JSON.stringify(config));
      const result=run(["--config",input,"--out",output]);
      assert.notEqual(result.status,0,"invalid config "+index+" should reject");
      await assert.rejects(()=>readdir(output),{code:"ENOENT"});
    }
  }finally{await rm(folder,{recursive:true,force:true});}
});
test("mode-specific changes preserve original base and do not mutate configuration",async()=>{
  const orig=await read("operations");
  const json=JSON.stringify(orig);
  const one=renderThemeV2Files(normalizeThemeV2(orig));
  const two=renderThemeV2Files(normalizeThemeV2(structuredClone(orig)));
  assert.deepEqual(one,two);
  assert.equal(JSON.stringify(orig),json);
  assert.match(one["theme.css"],/--harbor-operations-ui-action: #0755ba/);
  assert.match(one["theme.css"],/--harbor-operations-ui-action: #78dcff/);
  assert.match(one["bootstrap.css"],/--bs-primary-rgb: 7, 85, 186/);
  assert.match(one["bootstrap.css"],/--bs-primary-rgb: 120, 220, 255/);
});

test("theme generation rejects symlinked output directories, including with --force",async()=>{
 const temp=await mkdtemp(join(tmpdir(),"uf-css-theme-symlink-"));
 try {
   const real=join(temp,"real");
   await mkdir(real);
   const alias=join(temp,"alias");
   await symlink(real,alias,"dir");
   const r=run(["--config",path("operations"),"--out",alias,"--force"]);
   assert.notEqual(r.status,0);
   assert.match(r.stderr,/symlink/i);
   assert.deepEqual(await readdir(real),[]);
 }finally{await rm(temp,{recursive:true,force:true});}
});
