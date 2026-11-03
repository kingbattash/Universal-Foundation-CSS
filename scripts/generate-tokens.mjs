#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseTokens } from "./lib/tokens/parse.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(await readFile(resolve(root, "tokens/source.tokens.json"), "utf8"));
const buildOutputs = function buildOutputs(source) {
  // Shared DTCG token resolver used by the neutral starter AND user-created systems.
  // Preserve the starter renderer's existing { hex } shape without duplicate validation.
  const resolved = new Map(Array.from(parseTokens(source), ([path, token]) => [path, {
    type: token.type,
    value: token.type === "color" ? { hex: token.value } : token.value,
  }]));
  const pick=path=>{const t=resolved.get(path);if(!t)throw Error(`Required token missing: ${path}`);return t.value};
  const cssValue=path=>{
    const t=resolved.get(path);if(!t)throw Error(`No token ${path}`);
    if(t.type==="color")return t.value.hex;
    if(t.type==="dimension"||t.type==="duration")return `${t.value.value}${t.value.unit}`;
    if(t.type==="fontFamily")return (Array.isArray(t.value)?t.value:[t.value]).map(f=>f.includes(" ")&&!f.startsWith('"')?`"${f}"`:f).join(", ");
    if(t.type==="cubicBezier")return `cubic-bezier(${t.value.join(", ")})`;
    return String(t.value);
  };
  const lines=["/* Generated from tokens/source.tokens.json. Do not edit directly. */","@layer uf.tokens {","  :root, [data-uf-theme=\"light\"] {"];
  const properties={};const colorNames=Object.keys(source.semantic);
  for(const name of Object.keys(source.core.space)){properties[`--uf-space-${name}`]=cssValue(`core.space.${name}`)}
  for(const name of Object.keys(source.core.radius)){properties[`--uf-radius-${name}`]=cssValue(`core.radius.${name}`)}
  properties["--uf-content-max"]=cssValue("core.layout.containerMax");
  properties["--uf-content-wide"]=cssValue("core.layout.containerWide");
  properties["--uf-reading-max"]=`${pick("core.layout.readingMeasure")}ch`;
  properties["--uf-gutter"]=`clamp(${cssValue("core.layout.gutterMobile")}, 4vw, ${cssValue("core.layout.gutterDesktop")})`;
  properties["--uf-touch-target"]=cssValue("core.layout.touchTarget");
  properties["--uf-font-heading"]=cssValue("core.type.fontHeading");
  properties["--uf-font-body"]=cssValue("core.type.fontBody");
  properties["--uf-type-body"]=cssValue("core.type.bodySize");
  properties["--uf-type-caption"]=cssValue("core.type.captionSize");
  properties["--uf-type-display-min"]=cssValue("core.type.displayMin");
  properties["--uf-type-display-max"]=cssValue("core.type.displayMax");
  properties["--uf-leading-body"]=cssValue("core.type.bodyLineHeight");
  for(const name of Object.keys(source.core.motion)) properties[`--uf-motion-${name.replace(/([A-Z])/g,"-$1").toLowerCase()}`]=cssValue(`core.motion.${name}`);
  for(const name of colorNames){properties[`--uf-${name.replace(/([A-Z])/g,"-$1").toLowerCase()}`]=cssValue(`semantic.${name}`)}
  // Every neutral core primitive has a stable namespaced CSS value, including
  // new optional role categories. Legacy semantic aliases remain compatible.
  const kebab = part => part.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  for (const path of resolved.keys()) {
    if (!path.startsWith("core.")) continue;
    const variable = "--uf-" + path.slice("core.".length).split(".").map(kebab).join("-");
    properties[variable] = cssValue(path);
  }
  for(const [name,value] of Object.entries(properties))lines.push(`    ${name}: ${value};`);
  lines.push("  }",'  [data-uf-theme="dark"], [data-bs-theme="dark"] {');
  for(const name of colorNames){const cssName=name.replace(/([A-Z])/g,"-$1").toLowerCase();lines.push(`    --uf-${cssName}: ${cssValue(`themes.dark.${name}`)};`)}
  lines.push("  }","}","");
  const files={"src/css/tokens.generated.css":lines.join("\n")};
  const coreValues={colors:Object.fromEntries(Object.keys(source.core.color).map(name=>[name,pick(`core.color.${name}`).hex])),
    spacePx:Object.fromEntries(Object.keys(source.core.space).map(name=>[name,pick(`core.space.${name}`).value])),
    radiusPx:Object.fromEntries(Object.keys(source.core.radius).map(name=>[name,pick(`core.radius.${name}`).value])),
    layout:Object.fromEntries(Object.keys(source.core.layout).map(name=>[name,resolved.get(`core.layout.${name}`).type==="dimension"?pick(`core.layout.${name}`).value:pick(`core.layout.${name}`)])),
    type:Object.fromEntries(Object.keys(source.core.type).map(name=>[name,resolved.get(`core.type.${name}`).type==="dimension"?pick(`core.type.${name}`).value:pick(`core.type.${name}`)])),
    motion:Object.fromEntries(Object.keys(source.core.motion).map(name=>[name,resolved.get(`core.motion.${name}`).type==="duration"?pick(`core.motion.${name}`).value:pick(`core.motion.${name}`)])),
    scale:Object.fromEntries(Object.keys(source.core.scale).map(name=>[name,pick(`core.scale.${name}`)])),
    density:Object.fromEntries(Object.keys(source.core.density).map(name=>[name,pick(`core.density.${name}`).value])),
    zIndex:Object.fromEntries(Object.keys(source.core.zIndex).map(name=>[name,pick(`core.zIndex.${name}`)])),
    elevation:Object.fromEntries(Object.keys(source.core.elevation).map(name=>[name,pick(`core.elevation.${name}`)])),
    light:Object.fromEntries(colorNames.map(name=>[name,pick(`semantic.${name}`).hex])),
    dark:Object.fromEntries(colorNames.map(name=>[name,pick(`themes.dark.${name}`).hex])),
  };
  files["src/tokens/generated.ts"]=`/** Generated from tokens/source.tokens.json — do not edit. */\nexport const generatedTokens = ${JSON.stringify(coreValues,null,2)} as const\n`;
  // Browser framework mappings; source CSS must load before any mappings.
  const vars=name=>`var(--uf-${name.replace(/([A-Z])/g,"-$1").toLowerCase()})`;
  const twColors=Object.fromEntries(colorNames.map(name=>[`uf-${name.replace(/([A-Z])/g,"-$1").toLowerCase()}`,vars(name)]));
  const twSpace=Object.fromEntries(Object.keys(source.core.space).map(k=>[`uf-${k}`,`var(--uf-space-${k})`]));
  for (const k of Object.keys(source.core.density)) twSpace[`uf-density-${k}`] = `var(--uf-density-${k})`;
  const twRadius=Object.fromEntries(Object.keys(source.core.radius).map(k=>[`uf-${k}`,`var(--uf-radius-${k})`]));
  files["adapters/tailwind-v3/preset.generated.cjs"]=`/* Generated — Tailwind v3 theme preset. Also import UF-CSS tokens CSS. */\nmodule.exports = ${JSON.stringify({theme:{extend:{colors:twColors,spacing:twSpace,borderRadius:twRadius,maxWidth:{"uf-content":"var(--uf-content-max)","uf-reading":"var(--uf-reading-max)"},fontFamily:{"uf-body":["var(--uf-font-body)"],"uf-heading":["var(--uf-font-heading)"]}}}},null,2)}\n`;
  const t4=["/* Generated — import after Tailwind v4 and UF-CSS tokens. */","@theme inline {"];
  for(const [n,v] of Object.entries(twColors))t4.push(`  --color-${n}: ${v};`);
  for(const [n,v] of Object.entries(twSpace))t4.push(`  --spacing-${n}: ${v};`);
  for(const [n,v] of Object.entries(twRadius))t4.push(`  --radius-${n}: ${v};`);
  t4.push("  --font-uf-body: var(--uf-font-body);","  --font-uf-heading: var(--uf-font-heading);","}","");
  files["adapters/tailwind-v4/theme.generated.css"]=t4.join("\n");
  const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(", ");
  const bootstrapRoot={
    "--bs-body-bg":vars("canvas"),"--bs-body-color":vars("text"),"--bs-border-color":vars("border"),
    "--bs-primary":vars("action"),"--bs-secondary-color":vars("textSecondary"),
    "--bs-link-color":vars("info"),"--bs-danger":vars("danger"),"--bs-success":vars("success"),
    "--bs-font-sans-serif":"var(--uf-font-body)",
  };
  const bsLines=["/* Generated — load after Bootstrap 5.3 CSS; does not replace Bootstrap Sass configuration. */",
    ":root, [data-bs-theme=\"light\"] {"];
  for(const [name,value] of Object.entries(bootstrapRoot))bsLines.push(`  ${name}: ${value};`);
  for(const [name,kind] of Object.entries({"--bs-body-bg-rgb":"canvas","--bs-body-color-rgb":"text","--bs-primary-rgb":"action","--bs-danger-rgb":"danger","--bs-success-rgb":"success"}))bsLines.push(`  ${name}: ${rgb(coreValues.light[kind])};`);
  bsLines.push("}","[data-bs-theme=\"dark\"], [data-uf-theme=\"dark\"] {");
  for(const [name,value] of Object.entries(bootstrapRoot))bsLines.push(`  ${name}: ${value};`);
  for(const [name,kind] of Object.entries({"--bs-body-bg-rgb":"canvas","--bs-body-color-rgb":"text","--bs-primary-rgb":"action","--bs-danger-rgb":"danger","--bs-success-rgb":"success"}))bsLines.push(`  ${name}: ${rgb(coreValues.dark[kind])};`);
  bsLines.push("}",".btn-primary {","  --bs-btn-bg: var(--uf-action);","  --bs-btn-border-color: var(--uf-action);","  --bs-btn-color: var(--uf-on-action);","  --bs-btn-hover-bg: var(--uf-action-hover);","  --bs-btn-hover-border-color: var(--uf-action-hover);","  --bs-btn-hover-color: var(--uf-on-action);","  --bs-btn-active-bg: var(--uf-action-hover);","  --bs-btn-active-border-color: var(--uf-action-hover);","  --bs-btn-active-color: var(--uf-on-action);","}","");
  files["adapters/bootstrap/bootstrap.generated.css"]=bsLines.join("\n");
  const stylexVars={...Object.fromEntries(colorNames.map(name=>[name,coreValues.light[name]])),
    ...Object.fromEntries(Object.keys(source.core.space).map(k=>[`space${k}`,`${coreValues.spacePx[k]}px`])),
    ...Object.fromEntries(Object.keys(source.core.radius).map(k=>[`radius${k}`,`${coreValues.radiusPx[k]}px`])),
    motionFast:`${coreValues.motion.fast}ms`,motionStandard:`${coreValues.motion.standard}ms`};
  Object.assign(stylexVars,
    ...["scale","density","zIndex","elevation"].map(group => Object.fromEntries(
      Object.entries(coreValues[group]).map(([name,value])=>[group+name[0].toUpperCase()+name.slice(1),typeof value==="number"&&group==="density"?value+"px":value])
    ))
  );
  files["adapters/stylex/tokens.generated.stylex.ts"]=`/** Generated — requires the consuming app's StyleX compiler. */\nimport * as stylex from "@stylexjs/stylex"\n\nexport const ufVars = stylex.defineVars(${JSON.stringify(stylexVars,null,2)})\n\nexport const ufDarkTheme = stylex.createTheme(ufVars, ${JSON.stringify(coreValues.dark,null,2)})\n`;
  const nativeValues={colors:coreValues.light,darkColors:coreValues.dark,space:coreValues.spacePx,radius:coreValues.radiusPx,
    typography:{bodySize:coreValues.type.bodySize,captionSize:coreValues.type.captionSize,displayMin:coreValues.type.displayMin,displayMax:coreValues.type.displayMax,bodyLineHeight:coreValues.type.bodyLineHeight,headingLineHeight:coreValues.type.headingLineHeight},
    layout:coreValues.layout,scale:coreValues.scale,density:coreValues.density,zIndex:coreValues.zIndex,elevation:coreValues.elevation,
    motionMs:Object.fromEntries(Object.entries(coreValues.motion).filter(([name])=>!name.endsWith("Easing")))};
  files["adapters/react-native/tokens.generated.ts"]=`/** Generated — React Native numbers represent dp/pt starting points. Adjust font scaling per platform. */\nexport const ufNativeTokens = ${JSON.stringify(nativeValues,null,2)} as const\n`;
  return files;
};
const generated = buildOutputs(source);
const check = process.argv.includes("--check");
let dirty = 0;
for (const [relativePath, content] of Object.entries(generated)) {
  const path = resolve(root, relativePath);
  if (check) {
    try {
      if (await readFile(path, "utf8") !== content) { console.error("Outdated:", relativePath); dirty++; }
    } catch {
      console.error("Missing:", relativePath); dirty++;
    }
  } else {
    await mkdir(dirname(path), {recursive:true});
    await writeFile(path,content,"utf8");
    console.log("Generated:",relativePath);
  }
}
if (dirty) process.exitCode=1;
else console.log(check ? "All generated adapters are current." : "All adapters generated.");
