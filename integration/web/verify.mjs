#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import babel from "@babel/core";
import stylexPlugin from "@stylexjs/babel-plugin";
import postcss from "postcss";
import postcssImport from "postcss-import";

const current = dirname(fileURLToPath(import.meta.url));
const root = resolve(current, "../..");
const require = createRequire(import.meta.url);
const out = await mkdtemp(join(tmpdir(), "uf-css-integration-"));
let passed = 0;

function binPath(name, binName) {
  const pkgPath = require.resolve(`${name}/package.json`);
  const pkg = require(pkgPath);
  const path = typeof pkg.bin === "string" ? pkg.bin : pkg.bin?.[binName];
  assert.ok(path, `Missing executable ${binName} in ${name}`);
  return resolve(dirname(pkgPath),path);
}
function run(command, args) {
  const result=spawnSync(command,args,{cwd:root,encoding:"utf8",timeout:180000,maxBuffer:20*1024*1024});
  if(result.error)throw result.error;
  assert.equal(result.status,0, `Command failed: ${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
}
function cssContains(text, selector) {
  assert.ok(text.includes(selector), `Expected ${selector} in output`);
}
async function verifyTailwindV4() {
  const target=join(out,"tailwind-v4.css");
  run(process.execPath,[binPath("@tailwindcss/cli","tailwindcss"),"-i",join(current,"tailwind-v4/input.css"),"-o",target]);
  const output=await readFile(target,"utf8");
  for(const cls of [".bg-uf-action",".bg-uf-canvas",".text-uf-text",".p-uf-4",".rounded-uf-lg"])cssContains(output,cls);
  cssContains(output,"--uf-action");
  console.log("PASS: Tailwind v4 CLI generated UF-CSS utilities");
  passed++;
}
async function verifyTailwindV3() {
  const target=join(out,"tailwind-v3.css");
  run(process.execPath,[binPath("tailwindcss-v3","tailwindcss"),"-c",join(current,"tailwind-v3/tailwind.config.cjs"),"-i",join(current,"tailwind-v3/input.css"),"-o",target]);
  const output=await readFile(target,"utf8");
  for(const cls of [".bg-uf-action",".bg-uf-canvas",".text-uf-text",".p-uf-4",".rounded-uf-lg"])cssContains(output,cls);
  cssContains(output,"--uf-action");
  console.log("PASS: Tailwind v3 CLI generated UF-CSS utilities");
  passed++;
}
async function verifyBootstrap() {
  const file=join(current,"bootstrap/input.css");
  const output=await postcss([postcssImport()]).process(await readFile(file,"utf8"),{from:file});
  cssContains(output.css,".btn-primary");
  cssContains(output.css,"--uf-action");
  cssContains(output.css,"--bs-btn-bg: var(--uf-action)");
  cssContains(output.css,"--bs-primary-rgb: 140, 180, 255");
  assert.ok(output.css.length>100000,"Bootstrap CSS did not appear in compiled bundle");
  await writeFile(join(out,"bootstrap.css"),output.css);
  console.log("PASS: Bootstrap stylesheet bundled with UF-CSS overrides");
  passed++;
}
async function verifyStyleX() {
  const tokensFile=join(root,"adapters/stylex/tokens.generated.stylex.ts");
  const fixtureFile=join(current,"stylex/fixture.stylex.ts");
  for(const filename of [tokensFile,fixtureFile]) {
    const source=await readFile(filename,"utf8");
    const result=babel.transformSync(source,{
      filename, configFile:false, babelrc:false, sourceType:"module",
      parserOpts:{plugins:["typescript"]},
      plugins:[
        [stylexPlugin,{dev:false,unstable_moduleResolution:{type:"commonJS",rootDir:root}}],
        ["@babel/plugin-transform-typescript",{}],
      ],
    });
    assert.ok(result?.code,"No Babel output");
    assert.ok(result?.metadata && "stylex" in result.metadata,`StyleX plugin did not extract metadata from ${relative(root,filename)}`);
  }
  console.log("PASS: StyleX Babel compiler accepted generated tokens and consumer styles");
  passed++;
}
try {
  await verifyTailwindV4();
  await verifyTailwindV3();
  await verifyBootstrap();
  await verifyStyleX();
  console.log(`Web framework integrations: ${passed}/4 passed.`);
} finally {
  await rm(out,{recursive:true,force:true});
}
