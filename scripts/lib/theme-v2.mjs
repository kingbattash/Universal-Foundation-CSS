/**
 * Phase 03: creator-owned project theme v2.
 * Unlike legacy neutral-starter v1, the v2 path NEVER imports or inherits
 * UF-CSS neutral values. All chosen tokens and mappings come from the creator.
 */
import { parseTokens, camel } from "./tokens/parse.mjs";
import { cssTokenValue, nativeTokenValue, rgb } from "./tokens/format.mjs";
import { generateCustomSystem } from "./tokens/custom-renderer.mjs";
import { contrast } from "./project-theme.mjs";

const plain = x => x !== null && typeof x === "object" && !Array.isArray(x) && Object.getPrototypeOf(x) === Object.prototype;
const safeName = /^[a-z][a-z0-9-]{0,47}$/;
const safeCheckName = /^[a-z][a-z0-9-]{0,63}$/;
const err = message => { throw new Error(message); };

const kebab = n => n.replace(/([a-z0-9])([A-Z])/g,"$1-$2").replaceAll("_","-").toLowerCase();
const cssVar = (prefix,path) => "--"+prefix+"-"+path.split(".").map(kebab).join("-");
const cssDecl = (prefix,records) => Array.from(records, ([path,token]) =>
  "    "+cssVar(prefix,path)+": "+cssTokenValue(token)+";").join("\n");

function assertKeys(object, known, where) {
  if (!plain(object)) err(where+" must be an object");
  for(const key of Object.keys(object)) if(!known.includes(key)) err(where+": unknown key "+key);
}
function mergeMode(base, override, location = []) {
  if (!plain(override)) err("Theme mode overrides must be objects: "+location.join("."));
  const target=structuredClone(base);
  for(const [key, child] of Object.entries(override)) {
    if(key.startsWith("$")) err("Theme mode group metadata cannot be overridden at "+location.join("."));
    if(!Object.hasOwn(target,key)) err("Mode override references undeclared token: "+[...location,key].join("."));
    const existing=target[key];
    if(!plain(child) || !plain(existing)) err("Invalid mode override at "+[...location,key].join("."));
    if(Object.hasOwn(existing,"$value")) {
      if(!Object.hasOwn(child,"$value")) err("A mode token override requires $value: "+[...location,key].join("."));
      for(const field of Object.keys(child)) {
        if(!["$value","$description","$deprecated","$extensions","$type"].includes(field)) err("Unsupported mode token override field: "+field);
      }
      target[key]={...existing,...child};
    } else {
      target[key]=mergeMode(existing,child,[...location,key]);
    }
  }
  return target;
}
function nativeTree(records) {
  const out=Object.create(null);
  for(const [path,token] of records){
    const parts=path.split(".");
    let target=out;
    for(const k of parts.slice(0,-1)) target=target[k]??=Object.create(null);
    target[parts.at(-1)]=nativeTokenValue(token);
  }
  return JSON.parse(JSON.stringify(out));
}
function validateChecks(checks,modes) {
  if (!Array.isArray(checks)) err("contrastChecks must be an array");
  const used=new Set(), report=[];
  for(const item of checks) {
    assertKeys(item,["name","foreground","background","minimum","type"],"contrastChecks entry");
    const name=item.name;
    if(typeof name!=="string"||!safeCheckName.test(name)||used.has(name)) err("Invalid or duplicate contrast check: "+name);
    used.add(name);
    if(typeof item.foreground!=="string"||typeof item.background!=="string") err("Contrast check token paths must be strings");
    const min=item.minimum ?? (item.type==="ui" || item.type==="large-text" || item.type==="focus"?3:4.5);
    if(typeof min!=="number"||!Number.isFinite(min)||min<1||min>21) err("Invalid contrast minimum for "+name);
    if(item.type!==undefined&&!["text","large-text","ui","focus"].includes(item.type)) err("Unsupported check type "+item.type);
    for(const [mode,records] of Object.entries(modes)) {
      const a=records.get(item.foreground),b=records.get(item.background);
      if(!a||!b||a.type!=="color"||b.type!=="color") err("Contrast check "+name+" requires existing color tokens in "+mode);
      const ratio=contrast(a.value,b.value);
      report.push({name,mode,foreground:item.foreground,background:item.background,
        minimum:min,ratio:Number(ratio.toFixed(3)),passed:ratio>=min});
    }
  }
  const failures=report.filter(x=>!x.passed);
  if(failures.length) err("Contrast validation failed: "+failures.map(x=>x.mode+"."+x.name+" "+x.ratio.toFixed(2)+":1 < "+x.minimum+":1").join("; "));
  return report;
}
function bootstrapRules(prefix,records,mapping,selector) {
  const lines=[selector+" {"];
  for(const [key,path] of Object.entries(mapping)) {
    if(!/^--bs-[a-z0-9-]+$/.test(key)) err("Invalid Bootstrap variable: "+key);
    if(typeof path!=="string") err("Bootstrap mappings must use token paths");
    const token=records.get(path);
    if(!token) err("Unknown Bootstrap token: "+path);
    if(key.endsWith("-rgb") && token.type!=="color") err("RGB Bootstrap mapping must point at color: "+key);
    lines.push("  "+key+": "+(key.endsWith("-rgb") ? rgb(token.value):"var("+cssVar(prefix,path)+")")+";");
  }
  lines.push("}");
  return lines.join("\n");
}
export function normalizeThemeV2(input) {
  assertKeys(input,["schemaVersion","name","tokens","modes","mapping","contrastChecks"],"theme v2");
  if(input.schemaVersion!==2) err("Theme schemaVersion must be 2");
  if(typeof input.name!=="string"||!safeName.test(input.name)) err("Theme name must be lowercase kebab-case");
  const tokens=input.tokens;
  if(!plain(tokens)) err("Provide a creator-owned tokens object");
  const base=parseTokens(tokens);
  const rawModes=input.modes??{};
  assertKeys(rawModes,["light","dark"],"modes");
  const resolved={light:base};
  if(rawModes.light!==undefined) resolved.light=parseTokens(mergeMode(tokens,rawModes.light));
  if(rawModes.dark!==undefined) resolved.dark=parseTokens(mergeMode(tokens,rawModes.dark));
  const mappings=input.mapping??{};
  if(!plain(mappings)) err("Theme mapping must be an object");
  // Generator validates the explicit mappings and their expected token types.
  const generated=generateCustomSystem({source:tokens,prefix:input.name,mapping:mappings});
  const contrastChecks=validateChecks(input.contrastChecks??[],resolved);
  return {name:input.name,raw:input,resolved,generated,contrastChecks,mapping:mappings};
}
export function renderThemeV2Files(theme) {
  const {name,resolved,generated,mapping}=theme;
  const css=[
    "/* Creator-owned tokens. No neutral UF-CSS preset required. */",
    "@layer uf.project {",
    "  :root, [data-uf-theme=\"light\"] {",
    cssDecl(name,resolved.light),
    "  }",
  ];
  if(resolved.dark) css.push("  [data-uf-theme=\"dark\"], [data-bs-theme=\"dark\"] {",cssDecl(name,resolved.dark),"  }");
  css.push("}","");
  const bsMap=mapping.bootstrap??{};
  const bootstrap=["/* Explicit consumer Bootstrap overrides. Load after Bootstrap CSS. */",
    bootstrapRules(name,resolved.light,bsMap,":root, [data-bs-theme=\"light\"]")];
  if(resolved.dark) bootstrap.push(bootstrapRules(name,resolved.dark,bsMap,'[data-bs-theme="dark"], [data-uf-theme="dark"]'));
  bootstrap.push("");
  const modes=Object.keys(resolved);
  const stylex=[
    "/** Creator-owned StyleX themes. Compile with your app's StyleX compiler. */",
    'import * as stylex from "@stylexjs/stylex"',
    'import { systemVars } from "./stylex-vars.stylex"',
  ];
  for(const mode of modes) {
    const values=Object.fromEntries(Array.from(resolved[mode],([path,token])=>[camel(path),cssTokenValue(token)]));
    stylex.push("export const "+mode+"Theme = stylex.createTheme(systemVars, "+JSON.stringify(values,null,2)+")");
  }
  stylex.push("");
  const native={name,modes:Object.fromEntries(Object.entries(resolved).map(([mode,records])=>[mode,nativeTree(records)]))};
  const manifest={format:"uf-css-project-theme-v2",name,designFreedom:"all tokens and mappings are consumer-owned",
    roles:Array.from(resolved.light,([path,token])=>({path,type:token.type})),
    modes,contrastChecks:theme.contrastChecks,
    precedence:["consumer base tokens","explicit mode overrides","consumer component-state overrides"],
    files:["theme.css","tailwind-v3.cjs","tailwind-v4.css","bootstrap.css","stylex-vars.stylex.ts","stylex-theme.stylex.ts","native-theme.ts","theme.manifest.json"]};
  return {
    "theme.css":css.join("\n"),
    "tailwind-v3.cjs":generated["tailwind-v3.cjs"],
    "tailwind-v4.css":generated["tailwind-v4.css"],
    "bootstrap.css":bootstrap.join("\n"),
    "stylex-vars.stylex.ts":generated["stylex.stylex.ts"],
    "stylex-theme.stylex.ts":stylex.join("\n"),
    "native-theme.ts":"/* Fully consumer-owned theme; native dimensions use dp/pt starting points. */\nexport const projectNativeTheme = "+JSON.stringify(native,null,2)+" as const\n",
    "theme.manifest.json":JSON.stringify(manifest,null,2)+"\n"
  };
}
