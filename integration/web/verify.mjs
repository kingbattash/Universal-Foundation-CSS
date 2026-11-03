#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { generateCustomSystem } from "../../scripts/lib/custom-tokens.mjs";
import { normalizeThemeV2, renderThemeV2Files } from "../../scripts/lib/theme-v2.mjs";
import assert from "node:assert/strict";
import babel from "@babel/core";
import stylexPlugin from "@stylexjs/babel-plugin";
import transformTypescript from "@babel/plugin-transform-typescript";
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
  cssContains(output,".uf-g-auto");
  cssContains(output,".uf-g-subgrid");
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
  cssContains(output.css,".uf-g-manuscript");
  cssContains(output.css,".uf-g-masonry-fallback");
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
        [transformTypescript,{}],
      ],
    });
    assert.ok(result?.code,"No Babel output");
    assert.ok(result?.metadata && "stylex" in result.metadata,`StyleX plugin did not extract metadata from ${relative(root,filename)}`);
  }
  console.log("PASS: StyleX Babel compiler accepted generated tokens and consumer styles");
  passed++;
}

async function verifyUserOwnedSystems() {
  // Generate two different systems without loading any default UF-CSS palette.
  for (const [name, prefix, expected] of [
    ["editorial", "press", ["bg-press-paper", "text-press-ink", "p-press-reading", "rounded-press-sharp"]],
    ["operations", "ops", ["bg-ops-canvas", "text-ops-ink", "p-ops-standard", "rounded-ops-elevated"]],
  ]) {
    const source = JSON.parse(await readFile(join(root, "examples/custom-systems", name, "tokens.json"), "utf8"));
    const mapping = JSON.parse(await readFile(join(root, "examples/custom-systems", name, "mapping.json"), "utf8"));
    const outputs = generateCustomSystem({ source, prefix, mapping });
    // Keep files inside integration/web so the Tailwind toolchains resolve packages.
    const temp = await mkdtemp(join(current, "temp-custom-"));
    try {
      for (const [file, content] of Object.entries(outputs)) await writeFile(join(temp, file), content, "utf8");
      const fixture = '<div class="' + expected.join(" ") + '">Custom</div>';
      await writeFile(join(temp, "fixture.html"), fixture, "utf8");

      const sourceCss = [
        '@import "tailwindcss";',
        '@import "./tokens.css";',
        '@import "./tailwind-v4.css";',
        '@source inline("' + expected.join(" ") + '");',
        '',
      ].join("\n");
      await writeFile(join(temp, "input.css"), sourceCss, "utf8");
      const v4out = join(temp, "compiled-v4.css");
      run(process.execPath, [binPath("@tailwindcss/cli", "tailwindcss"), "-i", join(temp, "input.css"), "-o", v4out]);
      const compiled = await readFile(v4out, "utf8");
      for (const cls of expected) cssContains(compiled, "." + cls);
      cssContains(compiled, "--" + prefix + "-");

      const config = [
        'const path=require("node:path");module.exports = {presets:[require("./tailwind-v3.cjs")],content:[path.join(__dirname,"fixture.html")]};',
        '',
      ].join("\n");
      await writeFile(join(temp, "tailwind.config.cjs"), config, "utf8");
      await writeFile(join(temp, "legacy.css"), "@tailwind utilities;\n", "utf8");
      const v3out = join(temp, "compiled-v3.css");
      run(process.execPath, [binPath("tailwindcss-v3", "tailwindcss"), "-c", join(temp, "tailwind.config.cjs"), "-i", join(temp, "legacy.css"), "-o", v3out]);
      const compiledLegacy = await readFile(v3out, "utf8");
      for (const cls of expected) cssContains(compiledLegacy, "." + cls);

      const bs = await postcss().process(outputs["bootstrap.css"], { from: undefined });
      cssContains(bs.css, "--bs-primary-rgb");
      const sxFile = join(temp, "stylex.stylex.ts");
      const result = babel.transformSync(outputs["stylex.stylex.ts"], {
        filename: sxFile, configFile: false, babelrc: false, sourceType: "module",
        parserOpts: { plugins: ["typescript"] },
        plugins: [
          [stylexPlugin, { dev: false, unstable_moduleResolution: { type: "commonJS", rootDir: root } }],
          [transformTypescript, {}],
        ],
      });
      assert.ok(result?.code && result?.metadata && "stylex" in result.metadata, "Custom StyleX compilation failed");
      const native = babel.transformSync(outputs["native.ts"], {
        filename: join(temp, "native.ts"), configFile: false, babelrc: false,
        parserOpts: { plugins: ["typescript"] }, plugins: [[transformTypescript, {}]],
      });
      assert.ok(native?.code, "Custom React Native token TypeScript compilation failed");
      console.log("PASS: independent " + name + " design system compiled by Tailwind v3/v4 and StyleX");
      passed++;
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  }
}


async function verifyIndependentThemes() {
  for(const [example,prefix] of [
    ["editorial","copper-editorial"],
    ["operations","harbor-operations"],
  ]) {
    const source=JSON.parse(await readFile(join(root,"examples/project-theme",example+".v2.json"),"utf8"));
    const files=renderThemeV2Files(normalizeThemeV2(source));
    const temp=await mkdtemp(join(current,"temp-theme-"));
    try {
      for(const [name,code] of Object.entries(files)) await writeFile(join(temp,name),code,"utf8");
      const utilities=[
        "bg-"+prefix+"-canvas","text-"+prefix+"-ink",
        "p-"+prefix+"-comfortable","rounded-"+prefix+"-card",
      ];
      await writeFile(join(temp,"fixture.html"),'<div class="'+utilities.join(" ")+'">A user-owned theme</div>');
      const css=['@import "tailwindcss";','@import "./theme.css";',
        '@import "./tailwind-v4.css";',
        '@source inline("'+utilities.join(" ")+'");',""].join("\n");
      await writeFile(join(temp,"input.css"),css);
      const compiled=join(temp,"tw4-result.css");
      run(process.execPath,[binPath("@tailwindcss/cli","tailwindcss"),"-i",join(temp,"input.css"),"-o",compiled]);
      const output=await readFile(compiled,"utf8");
      for(const name of utilities) cssContains(output,"."+name);
      cssContains(output,"--"+prefix+"-ui-canvas");

      const config='const path=require("node:path");module.exports={presets:[require("./tailwind-v3.cjs")],content:[path.join(__dirname,"fixture.html")]};';
      await writeFile(join(temp,"tailwind.config.cjs"),config);
      await writeFile(join(temp,"input-v3.css"),'@tailwind utilities;\n');
      const target=join(temp,"tw3-result.css");
      run(process.execPath,[binPath("tailwindcss-v3","tailwindcss"),"-c",join(temp,"tailwind.config.cjs"),"-i",join(temp,"input-v3.css"),"-o",target]);
      const v3=await readFile(target,"utf8");
      for(const name of utilities) cssContains(v3,"."+name);

      const bs=await postcss().process(files["bootstrap.css"],{from:undefined});
      cssContains(bs.css,"--bs-primary-rgb:");
      cssContains(bs.css,"[data-bs-theme=\"dark\"]");
      for(const sx of ["stylex-vars.stylex.ts","stylex-theme.stylex.ts"]) {
        const filepath=join(temp,sx);
        const transformed=babel.transformSync(files[sx],{
          filename:filepath,configFile:false,babelrc:false,sourceType:"module",
          parserOpts:{plugins:["typescript"]},
          plugins:[
            [stylexPlugin,{dev:false,unstable_moduleResolution:{type:"commonJS",rootDir:root}}],
            [transformTypescript,{}]
          ]
        });
        assert.ok(transformed?.code && transformed?.metadata && "stylex" in transformed.metadata,
          "Theme StyleX compilation failed: "+sx);
      }
      const native=babel.transformSync(files["native-theme.ts"],{
        filename:join(temp,"native-theme.ts"),configFile:false,babelrc:false,
        parserOpts:{plugins:["typescript"]},plugins:[[transformTypescript,{}]]
      });
      assert.ok(native?.code, "Theme React Native TypeScript transpilation failed");
      console.log("PASS: independent project "+example+" themes compile via Tailwind v3/v4, Bootstrap, StyleX and native TS");
      passed++;
    } finally { await rm(temp,{recursive:true,force:true}); }
  }
}

try {
  await verifyTailwindV4();
  await verifyTailwindV3();
  await verifyBootstrap();
  await verifyStyleX();
  await verifyUserOwnedSystems();
  await verifyIndependentThemes();
  console.log(`Web framework integrations: ${passed}/8 passed.`);
} finally {
  await rm(out,{recursive:true,force:true});
}
