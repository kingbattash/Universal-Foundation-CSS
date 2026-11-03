#!/usr/bin/env node
/**
 * Real consumer smoke test: pack a built UF-CSS, install it outside the
 * source checkout, compile installed exports with locked toolchains.
 */
import {spawnSync} from "node:child_process";
import {mkdtemp,writeFile,readFile,rm} from "node:fs/promises";
import {dirname,join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {createRequire} from "node:module";
import assert from "node:assert/strict";
import babel from "@babel/core";
import postcss from "postcss";
import postcssImport from "postcss-import";
import stylexPlugin from "@stylexjs/babel-plugin";
import transformTypescript from "@babel/plugin-transform-typescript";

const cwd=dirname(fileURLToPath(import.meta.url)),root=resolve(cwd,"../..");
const require=createRequire(import.meta.url);
const temp=await mkdtemp(join(cwd,"temp-packed-"));
const npm=process.platform==="win32"?"npm.cmd":"npm";
function run(command,args,dir=root){
  const p=spawnSync(command,args,{cwd:dir,encoding:"utf8",timeout:180000,maxBuffer:20*1024*1024});
  if(p.error)throw p.error;
  assert.equal(p.status,0,"Failed "+command+" "+args.join(" ")+"\n"+p.stdout+"\n"+p.stderr);
  return p.stdout;
}
function toolBin(name,bin){
  const path=require.resolve(name+"/package.json"),pkg=require(path);
  const file=typeof pkg.bin==="string"?pkg.bin:pkg.bin?.[bin];
  assert.ok(file,"Missing binary "+name+"/"+bin);
  return resolve(dirname(path),file);
}
function includes(text,...items){
  for(const item of items)assert.ok(text.includes(item),"Missing "+item+" from compiled output");
}
async function compileStylex(file){
  const source=await readFile(file,"utf8");
  const out=babel.transformSync(source,{filename:file,configFile:false,babelrc:false,sourceType:"module",
    parserOpts:{plugins:["typescript"]},
    plugins:[
      [stylexPlugin,{dev:false,unstable_moduleResolution:{type:"commonJS",rootDir:cwd}}],
      [transformTypescript,{}]
    ]});
  assert.ok(out?.code && out?.metadata && "stylex" in out.metadata,
    "StyleX compiler did not transform "+file);
}
try{
  const packed=JSON.parse(run(npm,["pack","--json","--ignore-scripts","--pack-destination",temp]));
  assert.equal(packed.length,1);
  const consumer=join(temp,"consumer");
  run(npm,["install","--prefix",consumer,"--offline","--ignore-scripts","--no-save",
    "--no-audit","--no-fund","--package-lock=false","--omit=optional",join(temp,packed[0].filename)],temp);
  const packageRoot=join(consumer,"node_modules","@kingbattash","universal-foundation-css");
  const themePath=join(consumer,"theme");
  run(process.execPath,[join(packageRoot,"scripts","cli.mjs"),"theme","--config",
    join(root,"examples/project-theme/editorial.v2.json"),"--out",themePath],consumer);
  includes(await readFile(join(themePath,"theme.css"),"utf8"),
    "--copper-editorial-ui-canvas: #fff8ee","--copper-editorial-typography-heading");

  const classes=["bg-uf-action","bg-copper-editorial-canvas","text-copper-editorial-ink",
    "p-copper-editorial-comfortable","rounded-copper-editorial-card"];
  const css4=[
    '@import "tailwindcss";',
    '@import "@kingbattash/universal-foundation-css/css";',
    '@import "@kingbattash/universal-foundation-css/tailwind-v4";',
    '@import "./theme/theme.css";',
    '@import "./theme/tailwind-v4.css";',
    '@source inline("'+classes.join(" ")+'");'
  ].join("\n");
  await writeFile(join(consumer,"v4.css"),css4);
  run(process.execPath,[toolBin("@tailwindcss/cli","tailwindcss"),
    "-i",join(consumer,"v4.css"),"-o",join(consumer,"out-v4.css")],cwd);
  const output4=await readFile(join(consumer,"out-v4.css"),"utf8");
  for(const cls of classes)includes(output4,"."+cls);
  includes(output4,"--copper-editorial-ui-canvas: #fff8ee","--uf-action");
  console.log("PASS: packed Tailwind v4 compiles optional starter and independent theme");

  const config=[
    'const path=require("node:path");',
    'module.exports={presets:[',
    'require("@kingbattash/universal-foundation-css/tailwind-v3"),',
    'require("./theme/tailwind-v3.cjs")',
    '],content:[path.join(__dirname,"fixture.html")]};'
  ].join("\n");
  await writeFile(join(consumer,"tailwind.config.cjs"),config);
  await writeFile(join(consumer,"fixture.html"),'<div class="'+classes.join(" ")+'">Example</div>');
  await writeFile(join(consumer,"v3.css"),"@tailwind utilities;\n");
  run(process.execPath,[toolBin("tailwindcss-v3","tailwindcss"),"-c",join(consumer,"tailwind.config.cjs"),
    "-i",join(consumer,"v3.css"),"-o",join(consumer,"out-v3.css")],cwd);
  const output3=await readFile(join(consumer,"out-v3.css"),"utf8");
  for(const cls of classes)includes(output3,"."+cls);
  console.log("PASS: packed Tailwind v3 consumes installed presets");

  const bootstrapFile=join(consumer,"bootstrap.css");
  const bootstrapPath=require.resolve("bootstrap/dist/css/bootstrap.min.css");
  // postcss-import does not resolve exports-subpath specifiers directly.
  // Resolve the actual installed package export through Node first.
  const installedRequire=createRequire(join(consumer,"consumer.cjs"));
  const foundationCss=installedRequire.resolve("@kingbattash/universal-foundation-css/css");
  const adapterCss=installedRequire.resolve("@kingbattash/universal-foundation-css/bootstrap");
  const optionalGridCss=installedRequire.resolve("@kingbattash/universal-foundation-css/grid.css");
  const importedGrid=await postcss([postcssImport()]).process(
    '@import "'+optionalGridCss+'";',{from:join(consumer,"grid-smoke.css")});
  includes(importedGrid.css,".uf-g-auto",".uf-g-subgrid",".uf-g-masonry-fallback");
  console.log("PASS: installed opt-in grid CSS is an importable package export");
  await writeFile(bootstrapFile,[
    '@import "'+bootstrapPath+'";',
    '@import "'+foundationCss+'";',
    '@import "'+adapterCss+'";',
    '@import "./theme/theme.css";',
    '@import "./theme/bootstrap.css";'
  ].join("\n"));
  const bundled=await postcss([postcssImport()]).process(
    await readFile(bootstrapFile,"utf8"),{from:bootstrapFile});
  includes(bundled.css,"--bs-primary-rgb: 139, 36, 66","--uf-action",".btn-primary");
  assert.ok(bundled.css.length>100000,"Bootstrap bundle appears incomplete");
  console.log("PASS: packed Bootstrap stylesheet imports and theme channels");

  await compileStylex(join(packageRoot,"adapters/stylex/tokens.generated.stylex.ts"));
  await compileStylex(join(themePath,"stylex-vars.stylex.ts"));
  await compileStylex(join(themePath,"stylex-theme.stylex.ts"));
  for(const file of [
    join(packageRoot,"adapters/react-native/tokens.generated.ts"),
    join(themePath,"native-theme.ts")
  ]) {
    const src=await readFile(file,"utf8");
    const result=babel.transformSync(src,{filename:file,configFile:false,babelrc:false,
      parserOpts:{plugins:["typescript"]},plugins:[[transformTypescript,{}]]});
    assert.ok(result?.code,"Native TS compilation failed: "+file);
  }
  console.log("PASS: installed StyleX and React Native source exports compile");
  console.log("Packed framework consumers: 5/5 passed");
}finally{await rm(temp,{recursive:true,force:true});}
