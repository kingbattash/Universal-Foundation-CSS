#!/usr/bin/env node
/** Strict notes preflight. Reads only; never changes package.json or tags. */
import {readFile} from "node:fs/promises";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {isPrereleaseVersion} from "./lib/release/manifest.mjs";
import {validateReleaseNotes} from "./lib/release/notes.mjs";
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=="--candidate"||!isPrereleaseVersion(args[1]))
  throw new Error("Usage: node scripts/verify-release-notes.mjs --candidate 0.2.0-beta.1");
const version=args[1],root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const pkg=JSON.parse(await readFile(join(root,"package.json"),"utf8"));
if(pkg.version!==version)throw new Error("Release notes candidate must match package.json");
const read=async(path)=>{
  try{return await readFile(join(root,path),"utf8");}
  catch(e){if(e?.code==="ENOENT")return null;throw e;}
};
const changelog=await read("CHANGELOG.md");
const notes=await read("docs/releases/"+version+".md");
const errors=validateReleaseNotes(version,changelog,notes);
if(errors.length)throw new Error("Release notes preflight rejected:\n"+errors.join("\n"));
console.log("PASS: reviewed prerelease notes and dated changelog entry match "+version);
