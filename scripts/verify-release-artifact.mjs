#!/usr/bin/env node
/**
 * Inspect npm's actual dry-run tarball file manifest. No release, version
 * mutation, git tag, network publish or destructive filesystem operation.
 */
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {validateManifest,validatePackedFiles} from "./lib/release/manifest.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const opts={candidate:undefined,requirePrerelease:false};
const args=process.argv.slice(2);
for(let i=0;i<args.length;i++){
  if(args[i]==="--candidate"){
    if(opts.candidate!==undefined||!args[i+1]||args[i+1].startsWith("--"))throw new Error("--candidate requires one version");
    opts.candidate=args[++i];
  }else if(args[i]==="--require-prerelease"){
    if(opts.requirePrerelease)throw new Error("Duplicate --require-prerelease");
    opts.requirePrerelease=true;
  }else throw new Error("Unexpected argument: "+args[i]);
}
const pkg=JSON.parse(readFileSync(resolve(root,"package.json"),"utf8"));
const initial=validateManifest(pkg,opts);
if(initial.length)throw new Error("Release manifest rejected: "+initial.join("; "));
const out=spawnSync(process.platform==="win32"?"npm.cmd":"npm",
  ["pack","--dry-run","--json","--ignore-scripts"],{
    cwd:root,encoding:"utf8",timeout:90000,maxBuffer:10*1024*1024,
});
if(out.error)throw out.error;
if(out.status!==0)throw new Error("npm pack --dry-run failed: "+out.stderr);
const meta=JSON.parse(out.stdout);
if(!Array.isArray(meta)||meta.length!==1||!Array.isArray(meta[0].files))
  throw new Error("Unexpected npm pack manifest result");
const failures=validatePackedFiles(pkg,meta[0].files);
if(failures.length)throw new Error("Release tarball rejected:\n"+failures.join("\n"));
console.log("PASS: "+pkg.name+"@"+pkg.version+
  " release artifact includes "+meta[0].files.length+" files, all advertised entry points and CLI runtime, no test output");
console.log("Release artifact is DRY RUN ONLY: no version change, tag, publish or npm write to registry.");
