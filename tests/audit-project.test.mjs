import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtemp,mkdir,readFile,readdir,rm,symlink,writeFile,lstat} from "node:fs/promises";
import {tmpdir} from "node:os";
import {dirname,join,resolve} from "node:path";
import {auditProject} from "../scripts/lib/audit/project.mjs";

const root=process.cwd();
const cli=resolve(root,"scripts/cli.mjs");
const run=(args)=>spawnSync(process.execPath,[cli,...args],{cwd:root,encoding:"utf8",timeout:30000});
async function file(path,content){
  await mkdir(dirname(path),{recursive:true});
  await writeFile(path,content,"utf8");
}
async function fixture(fn){
  const project=await mkdtemp(join(tmpdir(),"uf-audit-fixture-"));
  try{return await fn(project);}
  finally{await rm(project,{recursive:true,force:true});}
}

test("the project-audit CLI has a truthful inspect-only help entry",()=>{
  const help=run(["--help"]);
  assert.equal(help.status,0,help.stderr);
  assert.match(help.stdout,/uf-css audit --project DIRECTORY/);
  const auditHelp=run(["audit","--help"]);
  assert.equal(auditHelp.status,0,auditHelp.stderr);
  assert.match(auditHelp.stdout,/No file writes/);
  for(const args of [
    ["audit"],["audit","--project"],["audit","--project","." ,"--out","oops"],
    ["audit","--project",".","--format","yaml"],
    ["audit","--project",".","--format","json","--yes"],
  ]){
    const runResult=run(args);
    assert.notEqual(runResult.status,0,"invalid args accepted: "+args.join(" "));
  }
});

test("detect existing multi-package stack without changing or adding any file",async()=>fixture(async project=>{
  await file(join(project,"package.json"),JSON.stringify({name:"example",dependencies:{
    next:"^16.2.0",tailwindcss:"^4.1.0","@stylexjs/stylex":"^0.19.0",
  }}));
  await file(join(project,"src","app.css"),'@import "tailwindcss";\n:root{--original-ink:#112233;--padding-unit:7px;}');
  await file(join(project,"src","legacy.css"),':root{--original-ink:#445566;--spacing:11px;}');
  await file(join(project,"src","app.tsx"),'<nav aria-label="Main"><a href="/">Home</a></nav>\n<div onClick={toggle}>Toggle</div>');
  await file(join(project,"apps","mobile","package.json"),JSON.stringify({name:"mobile",dependencies:{
    expo:"~57.0.0","react-native":"0.86.3",
  }}));
  await file(join(project,"apps","mobile","App.tsx"),'export const App=()=>null;');
  await file(join(project,"node_modules","a-secret","index.css"),":root{--ignore-secret:black;}");
  await file(join(project,".env.local"),"PRIVATE_CREDENTIAL=anything\n");
  const before=(await readdir(project)).sort();
  const snapshot=await readFile(join(project,"src","app.css"),"utf8");
  const res=run(["audit","--project",project,"--format","json"]);
  assert.equal(res.status,0,res.stderr);
  const data=JSON.parse(res.stdout);
  assert.equal(data.readonly,true);
  assert.equal(data.kind,"uf-css-inspect-only-audit");
  const ids=data.frameworks.map(f=>f.id);
  for(const expected of ["tailwind-v4","stylex","nextjs","expo","react-native","vanilla-css"])
    assert.ok(ids.includes(expected),expected+" absent: "+JSON.stringify(ids));
  const selected=data.adapterChoices.map(x=>x.adapter);
  for(const adapter of ["tailwind-v4","stylex","react-native","css"])assert.ok(selected.includes(adapter));
  assert.ok(data.findings.some(f=>f.id==="token-conflict"));
  assert.ok(data.findings.some(f=>f.id==="nonsemantic-click-handler"));
  assert.ok(data.design.duplicates.some(d=>d.name==="--original-ink"&&d.conflict));
  assert.ok(!data.design.tokenNames.includes("--ignore-secret"));
  assert.ok(!res.stdout.includes("PRIVATE_CREDENTIAL"));
  assert.equal(await readFile(join(project,"src","app.css"),"utf8"),snapshot);
  assert.deepEqual((await readdir(project)).sort(),before);
  assert.ok(!data.nextSteps.some(step=>/automatically install/i.test(step)));
  assert.ok(!data.adapterChoices.some(a=>a.adapter==="bootstrap"));
  const text=run(["audit","--project",project]);
  assert.equal(text.status,0,text.stderr);
  assert.match(text.stdout,/inspect-only/);
  assert.match(text.stdout,/tailwind-v4/);
  assert.match(text.stdout,/approval required/);
}));

test("correctly detects Tailwind v3, Bootstrap 5, and their explicit CSS sources",async()=>fixture(async project=>{
  await file(join(project,"package.json"),JSON.stringify({devDependencies:{
    tailwindcss:"~3.4.0",bootstrap:"^5.3.0",
  }}));
  await file(join(project,"src","input.css"),'@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
  const audit=await auditProject(project);
  assert.ok(audit.frameworks.some(f=>f.id==="tailwind-v3"));
  assert.ok(audit.frameworks.some(f=>f.id==="bootstrap"));
  assert.ok(audit.adapterChoices.some(a=>a.adapter==="tailwind-v3"));
  assert.ok(audit.adapterChoices.some(a=>a.adapter==="bootstrap"));
  assert.ok(!audit.adapterChoices.some(a=>a.adapter==="tailwind-v4"));
}));

test("unknown or unsupported framework versions never trigger unverified adapter installation",async()=>fixture(async project=>{
  await file(join(project,"package.json"),JSON.stringify({dependencies:{tailwindcss:"workspace:*",bootstrap:"^6.0.0","vue":"^4.0.0"}}));
  const audit=await auditProject(project);
  assert.ok(audit.frameworks.some(f=>f.id==="tailwind-unknown"));
  assert.ok(audit.frameworks.some(f=>f.id==="bootstrap-unknown"));
  assert.equal(audit.adapterChoices.length,0);
  assert.ok(audit.findings.some(f=>f.id==="unsupported-stack"));
  const blank=await mkdtemp(join(tmpdir(),"uf-audit-blank-"));
  try{
    const empty=await auditProject(blank);
    assert.equal(empty.frameworks[0].id,"unknown");
    assert.equal(empty.adapterChoices.length,0);
  }finally{await rm(blank,{recursive:true,force:true});}
}));

test("does not follow symlinks into private content or mutate linked targets",async()=>fixture(async project=>{
  const external=await mkdtemp(join(tmpdir(),"uf-external-private-"));
  try{
    await file(join(external,"private.css"),':root{--external-credential:secret}');
    await symlink(external,join(project,"linked-assets"),"dir");
    await file(join(project,"source.css"),':root{--my-custom-size:31px}');
    const result=await auditProject(project);
    assert.equal(result.coverage.skippedSymlinks,1);
    assert.ok(result.findings.some(f=>f.id==="symlink-skipped"));
    assert.ok(!result.design.tokenNames.includes("--external-credential"));
    assert.ok(result.design.tokenNames.includes("--my-custom-size"));
    await assert.rejects(()=>auditProject(join(project,"linked-assets")),/non-symlink/);
    assert.equal((await readdir(external)).length,1);
  }finally{await rm(external,{recursive:true,force:true});}
}));

test("read-only audit handles bad package manifests and never executes scripts",async()=>fixture(async project=>{
  await file(join(project,"package.json"),"{this is not JSON}");
  await file(join(project,"run.js"),'throw new Error("DO NOT EXECUTE");');
  const data=await auditProject(project);
  assert.ok(data.findings.some(f=>f.id==="invalid-manifest"));
  assert.equal(data.coverage.candidateFiles,2);
  assert.equal(data.readonly,true);
}));

test("detects only potential CSS import-order concerns with source file evidence",async()=>fixture(async project=>{
  await file(join(project,"assets","main.css"),'h1 {color:red;}\n@import "theme.css";\n');
  const data=await auditProject(project);
  const finding=data.findings.find(f=>f.id==="import-order-review");
  assert.ok(finding);
  assert.equal(finding.evidence[0].line,2);
  assert.equal(finding.evidence[0].path,"assets/main.css");
}));

test("bounded input sets truncated coverage instead of claiming full inspection",async()=>fixture(async project=>{
  const large="a".repeat(126000);
  await file(join(project,"a.css"),large);
  await file(join(project,"b.css"),':root{--small: 1px;}');
  const data=await auditProject(project);
  assert.equal(data.coverage.truncated,true);
  assert.ok(data.findings.some(f=>f.id==="partial-audit"));
  assert.ok(data.design.tokenNames.includes("--small"));
}));

test("inspect-only packaged audit is available without installing dependencies in the target",async()=>{
  const pkg=JSON.parse(await readFile(join(root,"package.json"),"utf8"));
  assert.ok(pkg.files.includes("scripts/audit-project.mjs"));
  assert.ok(pkg.files.includes("scripts/lib/audit"));
  assert.ok(pkg.bin["uf-css"].endsWith("scripts/cli.mjs"));
});
