#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(await readFile(resolve(root, "tokens/source.tokens.json"), "utf8"));
const buildOutputs = function buildOutputs(source) {
  const tokens=new Map();
  function walk(obj,path) {
    for(const [name,child] of Object.entries(obj)) {
      if(name.startsWith("$")) continue;
      const p=[...path,name].join(".");
      if(!child||typeof child!=="object"||Array.isArray(child))throw Error(`Invalid token group: ${p}`);
      if(Object.hasOwn(child,"$value")) {
        if(typeof child.$type!=="string")throw Error(`Token ${p} missing $type`);
        tokens.set(p,child);
      } else walk(child,[...path,name]);
    }
  }
  walk(source,[]);
  const resolved=new Map();
  function resolveToken(path,chain=[]) {
    if(resolved.has(path)) return resolved.get(path);
    if(chain.includes(path))throw Error(`Circular token reference: ${[...chain,path].join(" -> ")}`);
    const token=tokens.get(path);if(!token)throw Error(`Missing token reference: ${path}`);
    const { $type:type,$value:raw }=token;
    let value=raw;
    const ref=typeof raw==="string" && raw.match(/^\{([a-zA-Z0-9_.-]+)\}$/);
    if(ref) {
      const target=resolveToken(ref[1],[...chain,path]);
      if(type!==target.type)throw Error(`Reference type mismatch: ${path}`);
      value=target.value;
    }
    const err=()=>{throw Error(`Invalid ${type} value: ${path}`)};
    if(type==="color"){
      if(!value||typeof value!=="object"||value.colorSpace!=="srgb"||!Array.isArray(value.components)||value.components.length!==3||value.components.some(x=>typeof x!=="number"||!Number.isFinite(x)||x<0||x>1)||!/^#[0-9a-fA-F]{6}$/.test(value.hex||""))err();
      const derived="#"+value.components.map(n=>Math.round(n*255).toString(16).padStart(2,"0")).join("");
      if(derived.toLowerCase()!==value.hex.toLowerCase())err();
    } else if(type==="dimension"||type==="duration"){
      if(!value||typeof value!=="object"||typeof value.value!=="number"||!Number.isFinite(value.value)||!(type==="dimension"?["px","rem"]:["ms","s"]).includes(value.unit))err();
    } else if(type==="number"){
      if(typeof value!=="number"||!Number.isFinite(value))err();
    } else if(type==="fontFamily"){
      if(!(typeof value==="string"&&value.length>0)&&!(Array.isArray(value)&&value.length>0&&value.every(x=>typeof x==="string"&&x.length>0)))err();
    } else if(type==="cubicBezier"){
      if(!Array.isArray(value)||value.length!==4||value.some(x=>typeof x!=="number"||!Number.isFinite(x))||value[0]<0||value[0]>1||value[2]<0||value[2]>1)err();
    } else throw Error(`Unsupported DTCG type ${type}: ${path}`);
    const result={type,value};resolved.set(path,result);return result;
  }
  for(const path of tokens.keys())resolveToken(path);
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
  for(const [name,value] of Object.entries(properties))lines.push(`    ${name}: ${value};`);
  lines.push("  }",'  [data-uf-theme="dark"], [data-bs-theme="dark"] {');
  for(const name of colorNames){const cssName=name.replace(/([A-Z])/g,"-$1").toLowerCase();lines.push(`    --uf-${cssName}: ${cssValue(`themes.dark.${name}`)};`)}
  lines.push("  }","}","");
  const files={"src/css/tokens.generated.css":lines.join("\n")};
  const coreValues={colors:Object.fromEntries(Object.keys(source.core.color).map(name=>[name,pick(`core.color.${name}`).hex])),
    spacePx:Object.fromEntries(Object.keys(source.core.space).map(name=>[name,pick(`core.space.${name}`).value])),
    radiusPx:Object.fromEntries(Object.keys(source.core.radius).map(name=>[name,pick(`core.radius.${name}`).value])),
    layout:Object.fromEntries(Object.keys(source.core.layout).map(name=>[name,pick(`core.layout.${name}`).value])),
    type:Object.fromEntries(Object.keys(source.core.type).map(name=>[name,["fontHeading","fontBody"].includes(name)?pick(`core.type.${name}`):pick(`core.type.${name}`).value])),
    motion:Object.fromEntries(Object.keys(source.core.motion).map(name=>[name,name==="standardEasing"?pick(`core.motion.${name}`):pick(`core.motion.${name}`).value])),
    light:Object.fromEntries(colorNames.map(name=>[name,pick(`semantic.${name}`).hex])),
    dark:Object.fromEntries(colorNames.map(name=>[name,pick(`themes.dark.${name}`).hex])),
  };
  files["src/tokens/generated.ts"]=`/** Generated from tokens/source.tokens.json — do not edit. */\nexport const generatedTokens = ${JSON.stringify(coreValues,null,2)} as const\n`;
  // Browser framework mappings; source CSS must load before any mappings.
  const vars=name=>`var(--uf-${name.replace(/([A-Z])/g,"-$1").toLowerCase()})`;
  const twColors=Object.fromEntries(colorNames.map(name=>[`uf-${name.replace(/([A-Z])/g,"-$1").toLowerCase()}`,vars(name)]));
  const twSpace=Object.fromEntries(Object.keys(source.core.space).map(k=>[`uf-${k}`,`var(--uf-space-${k})`]));
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
  files["adapters/stylex/tokens.generated.stylex.ts"]=`/** Generated — requires the consuming app's StyleX compiler. */\nimport * as stylex from "@stylexjs/stylex"\n\nexport const ufVars = stylex.defineVars(${JSON.stringify(stylexVars,null,2)})\n\nexport const ufDarkTheme = stylex.createTheme(ufVars, ${JSON.stringify(coreValues.dark,null,2)})\n`;
  const nativeValues={colors:coreValues.light,darkColors:coreValues.dark,space:coreValues.spacePx,radius:coreValues.radiusPx,
    typography:{bodySize:coreValues.type.bodySize,captionSize:coreValues.type.captionSize,displayMin:coreValues.type.displayMin,displayMax:coreValues.type.displayMax,bodyLineHeight:coreValues.type.bodyLineHeight,headingLineHeight:coreValues.type.headingLineHeight},
    layout:coreValues.layout,motionMs:Object.fromEntries(Object.entries(coreValues.motion).filter(([name])=>name!=="standardEasing"))};
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
