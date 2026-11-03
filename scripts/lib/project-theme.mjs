/**
 * Pure project-theme builder. UF-CSS remains unbranded; consuming projects
 * supply their own colors. No external dependencies or browser APIs.
 */
const IDENTIFIER = /^[a-z][a-z0-9-]{0,63}$/;
const COLOR = /^#[0-9a-fA-F]{6}$/;
const SECTIONS = new Set(["name", "light", "dark"]);

export function resolveTokenColor(source, path, seen = []) {
  if (seen.includes(path)) throw new Error(`Circular token reference: ${[...seen,path].join(" -> ")}`);
  const token = path.split(".").reduce((obj, key) => obj && obj[key], source);
  if (!token || token.$type !== "color") throw new Error(`Not a color token: ${path}`);
  const value = token.$value;
  if (typeof value === "string") {
    const alias = /^\{([a-zA-Z0-9_.-]+)\}$/.exec(value);
    if (!alias) throw new Error(`Invalid token alias: ${path}`);
    return resolveTokenColor(source, alias[1], [...seen,path]);
  }
  if (!value || value.colorSpace !== "srgb" || !COLOR.test(value.hex ?? "")) {
    throw new Error(`Invalid hex color: ${path}`);
  }
  return value.hex.toLowerCase();
}

export function themeDefaults(source) {
  const roles = Object.keys(source.semantic);
  if (!roles.length) throw new Error("No semantic color roles found");
  return {
    light: Object.fromEntries(roles.map(role => [role, resolveTokenColor(source, `semantic.${role}`)])),
    dark: Object.fromEntries(roles.map(role => [role, resolveTokenColor(source, `themes.dark.${role}`)])),
  };
}

function srgb(hex) {
  return [1,3,5].map(i => parseInt(hex.slice(i,i+2), 16)/255)
    .map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
}
export function contrast(first, second) {
  const [a,b] = [first,second].map(hex => {
    if (!COLOR.test(hex)) throw new Error("Theme colors must be #RRGGBB");
    const [r,g,blue] = srgb(hex);
    return r*.2126 + g*.7152 + blue*.0722;
  });
  return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}

function validatePalette(palette, variant) {
  const checks = [
    ["text", "canvas", 4.5],
    ["textSecondary", "canvas", 4.5],
    ["onAction", "action", 4.5],
    ["onAction", "actionHover", 4.5],
    ["focus", "canvas", 3],
  ];
  for (const [fg,bg,min] of checks) {
    const result=contrast(palette[fg],palette[bg]);
    if (result < min) throw new Error(
      `${variant}: ${fg} / ${bg} contrast ${result.toFixed(2)}:1 below required ${min}:1`
    );
  }
}

export function normalizeProjectTheme(input, source) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Theme config must be a JSON object");
  const unknown=Object.keys(input).filter(key=>!SECTIONS.has(key));
  if(unknown.length) throw new Error(`Unknown theme config key(s): ${unknown.join(", ")}`);
  if (typeof input.name !== "string" || !IDENTIFIER.test(input.name)) throw new Error("Theme name must be kebab-case, 1–64 characters");
  const defaults=themeDefaults(source);
  const output={name:input.name,light:{...defaults.light},dark:{...defaults.dark}};
  for(const mode of ["light","dark"]) {
    const section=input[mode]??{};
    if (typeof section !== "object" || Array.isArray(section)) throw new Error(`${mode} must be a JSON object`);
    for(const [role,color] of Object.entries(section)) {
      if (!Object.hasOwn(defaults[mode], role)) throw new Error(`Unknown semantic role: ${role}`);
      if (typeof color!=="string" || !COLOR.test(color)) throw new Error(`Invalid color for ${mode}.${role}; expected #RRGGBB`);
      output[mode][role]=color.toLowerCase();
    }
    validatePalette(output[mode],mode);
  }
  return output;
}

function kebab(name) {return name.replace(/([A-Z])/g,"-$1").toLowerCase()}
function cssPalette(palette) {
  return Object.entries(palette).map(([name,color])=>`  --uf-${kebab(name)}: ${color};`).join("\n");
}
function rgb(hex) {return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(", ")}
function bootstrapPalette(palette) {
  const entries={
    "--bs-body-bg-rgb":rgb(palette.canvas),
    "--bs-body-color-rgb":rgb(palette.text),
    "--bs-primary-rgb":rgb(palette.action),
    "--bs-danger-rgb":rgb(palette.danger),
    "--bs-success-rgb":rgb(palette.success),
  };
  return Object.entries(entries).map(([name,value])=>`  ${name}: ${value};`).join("\n");
}

export function renderThemeFiles(theme) {
  const notice = `/* Generated for ${theme.name}; do not edit by hand. */`;
  const css=`${notice}
/* Import after UF-CSS. These unlayered overrides take precedence over uf.tokens. */
:root, [data-uf-theme="light"] {
${cssPalette(theme.light)}
}
[data-uf-theme="dark"], [data-bs-theme="dark"] {
${cssPalette(theme.dark)}
}
`;
  const bs=`${notice}
/* Load after Bootstrap and its UF-CSS adapter to update RGB channel variables. */
:root, [data-bs-theme="light"] {
${bootstrapPalette(theme.light)}
}
[data-bs-theme="dark"], [data-uf-theme="dark"] {
${bootstrapPalette(theme.dark)}
}
`;
  const st=`/** Generated for ${theme.name}. Requires a StyleX compiler. */
import * as stylex from "@stylexjs/stylex"
import { ufVars } from "@kingbattash/universal-foundation-css/stylex"

export const projectLightTheme = stylex.createTheme(ufVars, ${JSON.stringify(theme.light,null,2)})
export const projectDarkTheme = stylex.createTheme(ufVars, ${JSON.stringify(theme.dark,null,2)})
`;
  const native=`/** Generated for ${theme.name}. Use with React Native/Expo. */
export const projectNativeTheme = ${JSON.stringify(theme,null,2)} as const
`;
  const manifest=JSON.stringify({name:theme.name,format:"UF-CSS project-theme-v1",roles:Object.keys(theme.light),contrast:{
    lightTextOnCanvas:Number(contrast(theme.light.text,theme.light.canvas).toFixed(2)),
    lightAction:Number(contrast(theme.light.onAction,theme.light.action).toFixed(2)),
    darkTextOnCanvas:Number(contrast(theme.dark.text,theme.dark.canvas).toFixed(2)),
    darkAction:Number(contrast(theme.dark.onAction,theme.dark.action).toFixed(2)),
  },files:["theme.css","bootstrap.css","stylex-theme.ts","native-theme.ts"]},null,2)+"\n";
  return {
    "theme.css":css,
    "bootstrap.css":bs,
    "stylex-theme.ts":st,
    "native-theme.ts":native,
    "theme.manifest.json":manifest,
  };
}
