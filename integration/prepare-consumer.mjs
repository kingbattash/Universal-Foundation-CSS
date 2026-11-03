#!/usr/bin/env node
/**
 * Prepare an isolated app fixture using the *packed* UF-CSS npm tarball.
 * This never modifies package.json, the lockfile, the public library or npm registry.
 *
 * Usage: node integration/prepare-consumer.mjs expo|nextjs
 */
import {spawnSync} from "node:child_process";
import {mkdtemp,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {dirname,join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import assert from "node:assert/strict";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const targetName=process.argv[2];
if(!["expo","nextjs"].includes(targetName)) throw new Error("Expected expo or nextjs fixture");
const consumer=join(root,"integration",targetName);
const temp=await mkdtemp(join(tmpdir(),"uf-css-consumer-"));
const npm=process.platform==="win32"?"npm.cmd":"npm";
function run(cmd,args,cwd=root){
  const result=spawnSync(cmd,args,{cwd,encoding:"utf8",timeout:240000,maxBuffer:10*1024*1024});
  if(result.error)throw result.error;
  assert.equal(result.status,0,"Failed "+cmd+" "+args.join(" ")+"\n"+result.stdout+"\n"+result.stderr);
  return result.stdout;
}
try{
  const packageData=JSON.parse(run(npm,["pack","--json","--ignore-scripts","--pack-destination",temp]));
  assert.equal(packageData.length,1);
  const tarball=join(temp,packageData[0].filename);
  run(npm,["install","--prefix",consumer,"--offline","--ignore-scripts",
    "--no-save","--no-audit","--no-fund","--package-lock=false","--omit=optional",tarball]);
  const cli=join(consumer,"node_modules","@kingbattash","universal-foundation-css","scripts","cli.mjs");
  const source=join(root,"examples/project-theme",
    targetName==="expo"?"operations.v2.json":"editorial.v2.json");
  run(process.execPath,[cli,"theme","--config",source,"--out",join(consumer,"generated"),"--force"]);
  console.log("PASS: "+targetName+" fixture installed the local UF-CSS tarball and generated an independent theme");
}finally{await rm(temp,{recursive:true,force:true});}
