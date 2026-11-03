#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeProjectTheme, renderThemeFiles } from "./lib/project-theme.mjs";
import { normalizeThemeV2, renderThemeV2Files } from "./lib/theme-v2.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args=process.argv.slice(2);
function help() {
  console.log("Usage: node scripts/generate-project-theme.mjs --config PATH --out DIRECTORY [--check | --force]");
  console.log("Outputs: theme.css, bootstrap.css, stylex-theme.ts, native-theme.ts and theme.manifest.json");
  console.log("No network requests. Refuses overwrites unless --force is explicitly supplied.");
}
function getOption(name) {
  const index=args.indexOf(name);
  if(index<0 || !args[index+1] || args[index+1].startsWith("--"))throw new Error(`Missing ${name} PATH`);
  return args[index+1];
}
async function main() {
  if(args.includes("--help")||args.length===0) { help(); return; }
  const legal=new Set(["--config","--out","--check","--force"]);
  for(let i=0;i<args.length;i++) {
    if(!legal.has(args[i]))throw new Error(`Unknown flag: ${args[i]}`);
    if(args[i]==="--config"||args[i]==="--out")i++;
  }
  const check=args.includes("--check"), force=args.includes("--force");
  if(check&&force)throw new Error("Choose either --check or --force");
  const configPath=resolve(getOption("--config"));
  const out=resolve(getOption("--out"));
  const input=JSON.parse(await readFile(configPath,"utf8"));
  let theme,files;
  if(input.schemaVersion===2) {
    theme=normalizeThemeV2(input);
    files=renderThemeV2Files(theme);
  } else if(input.schemaVersion===undefined||input.schemaVersion===1) {
    const source=JSON.parse(await readFile(join(root,"tokens/source.tokens.json"),"utf8"));
    const {schemaVersion: ignoredLegacyVersion,...legacy}=input;
    theme=normalizeProjectTheme(legacy,source);
    files=renderThemeFiles(theme);
  } else throw new Error("Unsupported project-theme schemaVersion");

  // Atomic preflight across the whole output set: do not create partial output.
  let mismatches=[];
  for(const [name,text] of Object.entries(files)) {
    const path=join(out,name);
    try {
      const existing=await readFile(path,"utf8");
      if(existing!==text) mismatches.push(name);
      else if(!check&&!force) mismatches.push(name);
    } catch(error) {
      if(error.code!=="ENOENT")throw error;
      if(check) mismatches.push(name);
    }
  }
  if(check) {
    if(mismatches.length)throw new Error(`Generated theme missing or stale: ${mismatches.join(", ")}`);
    console.log(`Project theme "${theme.name}" verified (${Object.keys(files).length} outputs).`);
    return;
  }
  if(mismatches.length&&!force)throw new Error(`Existing generated theme files require --force: ${mismatches.join(", ")}`);
  await mkdir(out,{recursive:true});
  for(const [name,text] of Object.entries(files))await writeFile(join(out,name),text,"utf8");
  console.log(`Generated project theme "${theme.name}" in ${out} (${Object.keys(files).length} outputs).`);
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
