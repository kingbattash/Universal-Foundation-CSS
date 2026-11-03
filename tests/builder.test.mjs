import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, lstat, readdir, rm, writeFile, mkdir, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { normalizeBuilderConfig, combinationNotes } from "../scripts/lib/init/config.mjs";
import { buildScaffold, writeScaffold } from "../scripts/lib/init/scaffold.mjs";
import { collectWizard } from "../scripts/lib/init/wizard.mjs";

const root=process.cwd();
const script=resolve(root,"scripts/init-project.mjs");
const run=(args)=>spawnSync(process.execPath,[script,...args],{cwd:root,encoding:"utf8",timeout:60000});
const compact=(name="blank")=>({schemaVersion:1,name,frameworks:[],design:{}});

test("empty choices generate only a manifest and README: no imposed visual system",()=>{
  const plan=buildScaffold(compact());
  assert.deepEqual(Object.keys(plan.files).sort(),["README.md","design-system.config.json"].sort());
  assert.deepEqual(plan.config.design.colors,{});
  assert.deepEqual(plan.config.design.grids,{layouts:[],guides:[]});
});
test("selected color, grids and hierarchy generate only requested adapter and selected specs",()=>{
  const config=normalizeBuilderConfig({
    schemaVersion:1,name:"my-system",frameworks:["tailwind-v4","react-native"],
    design:{colors:{primary:"#234567",canvas:"#ffffff"},typography:{headingFont:"Georgia",baseSizePx:21},spacing:{unitPx:5},
      grids:{layouts:[{id:"twelve-column"},{id:"custom",name:"five-track",columns:5}],guides:["golden-ratio","rule-of-thirds"]},
      hierarchy:["typographic","my-own-priority"]}
  });
  const {files,notes}=buildScaffold(config);
  assert.match(files["tokens/system.tokens.json"],/"hex": "#234567"/);
  assert.match(files["generated/tailwind-v4.css"],/--color-my-system-primary/);
  assert.match(files["generated/native.ts"],/"primary": "#234567"/);
  assert.ok(!files["generated/bootstrap.css"]);
  assert.ok(!files["generated/tailwind-v3.cjs"]);
  assert.ok(!files["generated/stylex.stylex.ts"]);
  assert.match(files["composition/layout.css"],/repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(files["hierarchy/selected.json"],/my-own-priority/);
  assert.ok(notes.some(n=>n.includes("Golden ratio")));
});
test("composition guides and custom hierarchy need not generate CSS",()=>{
  const plan=buildScaffold({
    schemaVersion:1,name:"knowledge-only",frameworks:["vanilla-css"],
    design:{grids:{layouts:[],guides:["a-custom-guide"]},hierarchy:["original-system"]}
  });
  assert.ok(plan.files["composition/selected.json"]);
  assert.ok(plan.files["hierarchy/selected.json"]);
  assert.ok(!plan.files["composition/layout.css"]);
  assert.ok(!plan.files["generated/tokens.css"]);
});
test("wizard collects optional choices and user-authored grid definition without disk writes",async()=>{
  const input=["demo","","vanilla-css,tailwind-v4","accent=#224466,canvas=#ffffff","Georgia","","18","6",
    "custom","feature-grid","5","golden-ratio,baseline","typographic,own-priority"];
  const seen=[];
  const answers=await collectWizard(async prompt=>{seen.push(prompt);return input.shift()??"";},()=>{});
  assert.equal(input.length,0);
  const config=normalizeBuilderConfig(answers.config);
  assert.equal(answers.suggestedOut,"./demo");
  assert.equal(config.design.colors.accent,"#224466");
  assert.deepEqual(config.design.grids.layouts,[{id:"custom",name:"feature-grid",columns:5}]);
  assert.deepEqual(config.design.hierarchy,["typographic","own-priority"]);
  assert.ok(seen.some(x=>x.includes("Composition guides")));
});
test("dry-run, missing confirmation, generation, no-overwrite and --force",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"uf-css-builder-"));
  try{
    const out=join(dir,"new-design-system");
    const config=resolve(root,"examples/builder/editorial.config.json");
    const args=["--config",config,"--out",out];
    const preview=run([...args,"--dry-run"]);
    assert.equal(preview.status,0,preview.stderr);
    assert.match(preview.stdout,/Planned files:/);
    await assert.rejects(()=>lstat(out),{code:"ENOENT"});
    const unconfirmed=run(args);
    assert.notEqual(unconfirmed.status,0);
    await assert.rejects(()=>lstat(out),{code:"ENOENT"});
    const approved=run([...args,"--yes"]);
    assert.equal(approved.status,0,approved.stderr);
    const paths=await readdir(out);
    assert.ok(paths.includes("design-system.config.json"));
    assert.ok(paths.includes("generated"));
    assert.match(await readFile(join(out,"composition","layout.css"),"utf8"),/independent-editorial-grid--manuscript/);
    assert.ok(!await readFile(join(out,"README.md"),"utf8").then(v=>v.includes("AMGYNA")));
    const denied=run([...args,"--yes"]);
    assert.notEqual(denied.status,0);
    const repeated=run([...args,"--yes","--force"]);
    assert.equal(repeated.status,0,repeated.stderr);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test("invalid config rejected before creating folders or modifying existing files",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"uf-css-builder-invalid-"));
  try{
    const invalid=[
      {...compact("safe"),design:{colors:{accent:"#xyz123"}}},
      {...compact("safe"),design:{grids:{layouts:[{id:"custom",name:"grid",columns:0}]}}},
      {...compact("safe"),frameworks:["unrecognized-framework"]},
      {...compact("safe"),design:{hierarchy:["bad;rule"]}},
      {...compact("safe"),name:"../escape"}
    ];
    for(let i=0;i<invalid.length;i++){
      const config=join(dir,"invalid"+i+".json"),out=join(dir,"invalid-out-"+i);
      await writeFile(config,JSON.stringify(invalid[i]));
      const result=run(["--config",config,"--out",out,"--yes"]);
      assert.notEqual(result.status,0);
      await assert.rejects(()=>lstat(out),{code:"ENOENT"});
    }
  }finally{await rm(dir,{recursive:true,force:true});}
});
test("StyleX-only system omits browser CSS and reports low text contrast as guidance",()=>{
  const plan=buildScaffold({schemaVersion:1,name:"sxi",frameworks:["stylex"],design:{
    colors:{text:"#ffffff",canvas:"#ffffff"},grids:{layouts:[{id:"manuscript"}],guides:[]}
  }});
  assert.ok(plan.files["generated/stylex.stylex.ts"]);
  assert.ok(!plan.files["generated/tokens.css"]);
  assert.ok(!plan.files["composition/layout.css"]);
  assert.ok(plan.notes.some(x=>x.includes("below WCAG AA")));
});
test("scaffold refuses symbolic-link destination paths",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"uf-css-builder-link-"));
  try{
    const real=join(dir,"real");
    await mkdir(real);
    const alias=join(dir,"alias");
    await symlink(real,alias,"dir");
    await assert.rejects(()=>writeScaffold(alias,buildScaffold(compact()).files),/symbolic link/i);
    assert.equal((await readdir(real)).length,0);
  }finally{await rm(dir,{recursive:true,force:true});}
});
