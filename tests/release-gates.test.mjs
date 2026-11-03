import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {spawnSync} from "node:child_process";
import {isPrereleaseVersion,validateManifest,validatePackedFiles,EXPECTED_PACKAGE} from "../scripts/lib/release/manifest.mjs";
import {evaluateCI,REQUIRED_CI_CHECKS} from "../scripts/lib/release/checks.mjs";
import {validateReleaseNotes} from "../scripts/lib/release/notes.mjs";
const root=process.cwd();
const manifest=JSON.parse(readFileSync(resolve(root,"package.json"),"utf8"));

test("release validator accepts current package as unreleased working source",()=>{
  assert.equal(manifest.name,EXPECTED_PACKAGE);
  assert.deepEqual(validateManifest(manifest),[]);
  assert.ok(manifest.files.includes("dist/src"));
  assert.ok(!manifest.files.includes("dist"));
  assert.ok(manifest.files.includes("CHANGELOG.md"));
});

test("SemVer prerelease checks are strict and publication requires exact version",()=>{
  for(const version of ["0.2.0-beta.1","0.2.0-rc.0","1.0.0-alpha.42","2.1.0-preview.x"])
    assert.equal(isPrereleaseVersion(version),true,version);
  for(const version of ["0.1.0","1.0.0","1.2","v1.2.3","1.2.3+build","1.2.3-beta.01","1.2.3-"])
    assert.equal(isPrereleaseVersion(version),false,version);
  assert.ok(validateManifest(manifest,{requirePrerelease:true}).length>0);
  assert.ok(validateManifest(manifest,{candidate:"9.9.9-beta.1"}).some(s=>s.includes("Candidate version")));
  const clone=structuredClone(manifest);
  clone.version="0.2.0-beta.1";
  assert.deepEqual(validateManifest(clone,{candidate:"0.2.0-beta.1",requirePrerelease:true}),[]);
  clone.publishConfig.access="restricted";
  assert.ok(validateManifest(clone).some(s=>s.includes("Public scoped")));
  clone.repository.url="git+https://github.com/other/repo.git";
  assert.ok(validateManifest(clone).some(s=>s.includes("repository.url")));
});

test("package file validation rejects missing exports, test output and secret artifacts",()=>{
  const mockPaths=["LICENSE","README.md","CHANGELOG.md","package.json","tokens/source.tokens.json"];
  for(const path of Object.values(manifest.exports)){
    const def=typeof path==="string"?path:path.default;
    if(def)mockPaths.push(def.replace(/^\.\//,""));
    if(typeof path==="object"&&path.types)mockPaths.push(path.types.replace(/^\.\//,""));
  }
  for(const path of ["scripts/cli.mjs","scripts/init-project.mjs","scripts/audit-project.mjs",
    "scripts/generate-custom-system.mjs","scripts/generate-project-theme.mjs",
    "scripts/lib/audit/project.mjs","scripts/lib/init/config.mjs",
    "scripts/lib/init/scaffold.mjs","scripts/lib/init/wizard.mjs",
    "scripts/lib/project-theme.mjs","scripts/lib/theme-v2.mjs",
    "scripts/lib/custom-tokens.mjs","scripts/lib/tokens/parse.mjs",
    "scripts/lib/tokens/format.mjs","scripts/lib/tokens/custom-renderer.mjs",
    "scripts/lib/tokens/starter-renderer.mjs"])mockPaths.push(path);
  assert.deepEqual(validatePackedFiles(manifest,mockPaths),[]);
  assert.ok(validatePackedFiles(manifest,mockPaths.filter(x=>x!=="README.md")).some(s=>s.includes("README.md")));
  for(const name of ["dist/tests/registry.test.js",".env.local","test/private.pem","integration/example.js"])
    assert.ok(validatePackedFiles(manifest,[...mockPaths,name]).some(s=>s.includes("Unexpected")),name);
});

test("release CI gate rejects missing/pending/failing/newer failing checks",()=>{
  assert.equal(REQUIRED_CI_CHECKS.length,6);
  const ok=REQUIRED_CI_CHECKS.map((name,i)=>({name,id:i+1,status:"completed",conclusion:"success"}));
  assert.equal(evaluateCI(ok).ok,true);
  assert.equal(evaluateCI(ok.slice(1)).ok,false);
  assert.equal(evaluateCI([...ok,{name:"browser-quality",id:100,status:"completed",conclusion:"failure"}]).ok,false);
  assert.equal(evaluateCI([...ok,{name:"browser-quality",id:100,status:"in_progress",conclusion:null}]).ok,false);
  assert.equal(evaluateCI([...ok,{name:"unrelated",id:100,status:"completed",conclusion:"success"}]).ok,true);
});

test("release validation never mutates version or creates a tag",()=>{
  const proc=spawnSync(process.execPath,["scripts/verify-release-artifact.mjs","--candidate","9.9.9-beta.1","--require-prerelease"],{
    cwd:root,encoding:"utf8",timeout:15000,
  });
  assert.notEqual(proc.status,0);
  assert.match(proc.stderr,/Candidate version/);
  const after=JSON.parse(readFileSync(resolve(root,"package.json"),"utf8"));
  assert.equal(after.version,manifest.version);
});

test("publish action is opt-in manual only, branch and environment gated",()=>{
  const yaml=readFileSync(resolve(root,".github/workflows/release.yml"),"utf8");
  assert.match(yaml,/workflow_dispatch:/);
  assert.doesNotMatch(yaml,/^\s*(?:push|release|schedule):/m);
  assert.match(yaml,/refs\/heads\/main/);
  assert.match(yaml,/UF_CSS_RELEASE_ENABLED/);
  assert.match(yaml,/confirm_publish/);
  assert.match(yaml,/approval_phrase/);
  assert.match(yaml,/environment:\s*npm-prerelease/);
  assert.match(yaml,/id-token:\s*write/);
  assert.match(yaml,/npm publish/);
  assert.match(yaml,/--tag beta/);
  assert.match(yaml,/scripts\/check-release-ci\.mjs/);
  assert.match(yaml,/npm ci/);
});

test("release notes gate requires exact version, dated changelog and substantive migration/verification text",()=>{
  const version="0.2.0-beta.1";
  const changelog="## Unreleased\n\n## [0.2.0-beta.1] - 2026-11-03\n- Reviewed release notes.\n";
  const notes=[
    "# UF-CSS 0.2.0-beta.1",
    "## Changes","- Added a guarded package distribution path.",
    "## Compatibility","- Node 20+ source; Node 24 release runner.",
    "## Breaking changes","- None identified for this candidate.",
    "## Verification","- Core and six workflows passed at a verified SHA.",
    "## Remaining limitations","- Physical Android/iOS device testing pending.",
  ].join("\n");
  assert.deepEqual(validateReleaseNotes(version,changelog,notes),[]);
  assert.ok(validateReleaseNotes(version,"## Unreleased",notes).some(e=>e.includes("CHANGELOG.md")));
  assert.ok(validateReleaseNotes(version,changelog,notes.replace("## Verification","## Checks")).some(e=>e.includes("Verification")));
  assert.ok(validateReleaseNotes(version,changelog,notes.replace("None identified for this candidate.","TODO")).some(e=>e.includes("placeholder")));
  assert.ok(validateReleaseNotes("0.1.0",changelog,notes).length>0);
});
