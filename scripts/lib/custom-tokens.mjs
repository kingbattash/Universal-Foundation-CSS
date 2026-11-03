/**
 * User-owned token compiler. This is an intentionally strict SUBSET of DTCG.
 * No color, spacing, typography, semantic role, hierarchy or grid is required.
 */
const plain = x => x !== null && typeof x === "object" && !Array.isArray(x) && Object.getPrototypeOf(x) === Object.prototype;
const validKey = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const reserved = new Set(["__proto__", "prototype", "constructor"]);
const kebab = name => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
const tokenName = path => path.split(".").map(kebab).join("-");
const camel = path => { const w = path.split(/[._-]/); return w[0] + w.slice(1).map(s => s[0].toUpperCase() + s.slice(1)).join(""); };
const error = msg => { throw new Error(msg); };
const finite = n => typeof n === "number" && Number.isFinite(n);
function validate(type, v, path) {
  if (type === "color") {
    if (!plain(v) || v.colorSpace !== "srgb" || !Array.isArray(v.components) || v.components.length !== 3 ||
      v.components.some(n => !finite(n) || n < 0 || n > 1) || !/^#[\da-f]{6}$/i.test(v.hex || "") ||
      (v.alpha !== undefined && v.alpha !== 1)) error("Invalid opaque sRGB color: " + path);
    const hex = "#" + v.components.map(n => Math.round(n * 255).toString(16).padStart(2, "0")).join("");
    if (hex.toLowerCase() !== v.hex.toLowerCase()) error("Color channels disagree with hex: " + path);
    return hex.toLowerCase();
  }
  if (type === "dimension" || type === "duration") {
    if (!plain(v) || !finite(v.value) || !(type === "dimension" ? ["px", "rem"] : ["ms", "s"]).includes(v.unit) ||
      (type === "duration" && v.value < 0)) error("Invalid " + type + ": " + path);
    return { value: v.value, unit: v.unit };
  }
  if (type === "number") {
    if (!finite(v)) error("Invalid number: " + path);
    return v;
  }
  if (type === "fontFamily") {
    const fonts = Array.isArray(v) ? v : [v];
    if (!fonts.length || fonts.some(f => typeof f !== "string" || !f.trim() || /[\r\n;{}]/.test(f))) error("Invalid font family: " + path);
    return fonts;
  }
  if (type === "fontWeight") {
    if (!(finite(v) && v > 0 && v <= 1000) && !(typeof v === "string" && /^(normal|bold|bolder|lighter)$/.test(v))) error("Invalid font weight: " + path);
    return v;
  }
  if (type === "cubicBezier") {
    if (!Array.isArray(v) || v.length !== 4 || v.some(x => !finite(x)) || v[0] < 0 || v[0] > 1 || v[2] < 0 || v[2] > 1) error("Invalid bezier: " + path);
    return v;
  }
  error("Unsupported DTCG token type: " + type + " at " + path);
}
export function parseTokens(source) {
  if (!plain(source)) error("Token source must be a JSON object");
  const tokens = new Map();
  function scan(node, parts = [], inherited) {
    if (!plain(node)) error("Invalid token group: " + parts.join("."));
    if (Object.hasOwn(node, "$extends")) error("$extends is not supported in the current DTCG subset");
    const type = node.$type ?? inherited;
    if (Object.hasOwn(node, "$value")) {
      if (!parts.length) error("Root token is not supported");
      tokens.set(parts.join("."), { type, value: node.$value });
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith("$")) continue;
      if (!validKey.test(key) || reserved.has(key)) error("Invalid token key: " + key);
      scan(value, [...parts, key], type);
    }
  }
  scan(source);
  if (!tokens.size) error("At least one user-defined token is required");
  const cache = new Map();
  function resolve(path, chain = []) {
    if (cache.has(path)) return cache.get(path);
    if (chain.includes(path)) error("Circular alias: " + [...chain, path].join(" -> "));
    const token = tokens.get(path);
    if (!token) error("Missing alias: " + path);
    const alias = typeof token.value === "string" ? /^\{([a-zA-Z0-9_.-]+)\}$/.exec(token.value) : null;
    let type = token.type, value = token.value;
    if (alias) {
      const target = resolve(alias[1], [...chain, path]);
      if (type && type !== target.type) error("Alias type mismatch: " + path);
      type = target.type;
      value = target.value;
    }
    if (!type) error("Missing $type: " + path);
    const record = { type, value: validate(type, value, path) };
    cache.set(path, record);
    return record;
  }
  for (const key of tokens.keys()) resolve(key);
  const cssNames = new Set(), jsNames = new Set();
  for (const path of cache.keys()) {
    const c = tokenName(path), j = camel(path);
    if (cssNames.has(c) || jsNames.has(j)) error("Token output collision: " + path);
    cssNames.add(c);
    jsNames.add(j);
  }
  return cache;
}
function cssValue(t) {
  if (t.type === "color") return t.value;
  if (t.type === "dimension" || t.type === "duration") return String(t.value.value) + t.value.unit;
  if (t.type === "fontFamily") return t.value.map(f => /^[a-zA-Z][a-zA-Z0-9-]*$/.test(f) ? f : JSON.stringify(f)).join(", ");
  if (t.type === "cubicBezier") return "cubic-bezier(" + t.value.join(", ") + ")";
  return String(t.value);
}
function nativeValue(t) {
  if (t.type === "dimension") return t.value.unit === "px" ? t.value.value : { value: t.value.value, unit: "rem" };
  if (t.type === "duration") return t.value.unit === "s" ? t.value.value * 1000 : t.value.value;
  return t.value;
}
function mappingObject(value, field) {
  if (value === undefined) return {};
  if (!plain(value)) error("Expected mapping object: " + field);
  return value;
}
function mapTokens(mapping, field, records, expectedType) {
  return Object.entries(mappingObject(mapping, field)).map(([name, path]) => {
    if (!validKey.test(name) || reserved.has(name)) error("Invalid adapter alias: " + name);
    const r = records.get(path);
    if (!r) error("Unknown mapped token: " + path);
    if (r.type !== expectedType) error("Mapped type mismatch: " + field + "." + name);
    return [name, path, r];
  });
}
function nativeTree(records) {
  const root = Object.create(null);
  for (const [path, record] of records) {
    const parts = path.split(".");
    let cursor = root;
    for (const key of parts.slice(0, -1)) cursor = cursor[key] ??= Object.create(null);
    cursor[parts.at(-1)] = nativeValue(record);
  }
  return JSON.parse(JSON.stringify(root));
}
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(", ");
export function generateCustomSystem({ source, prefix, mapping = {} }) {
  if (typeof prefix !== "string" || !/^[a-z][a-z0-9-]{0,47}$/.test(prefix)) error("Prefix must be lowercase kebab-case");
  const tokens = parseTokens(source);
  if (!plain(mapping) || Object.keys(mapping).some(k => !["tailwind", "bootstrap"].includes(k))) error("Unknown adapter mapping section");
  const tw = mappingObject(mapping.tailwind, "tailwind");
  if (Object.keys(tw).some(k => !["colors", "spacing", "radii", "fonts"].includes(k))) error("Unknown Tailwind mapping group");
  const choices = {
    colors: mapTokens(tw.colors, "colors", tokens, "color"),
    spacing: mapTokens(tw.spacing, "spacing", tokens, "dimension"),
    radii: mapTokens(tw.radii, "radii", tokens, "dimension"),
    fonts: mapTokens(tw.fonts, "fonts", tokens, "fontFamily"),
  };
  const cssVar = path => "--" + prefix + "-" + tokenName(path);
  const css = ["/* User-owned tokens. No UF-CSS starter defaults applied. */", "@layer uf.user-tokens {", "  :root {"];
  for (const [path, token] of tokens) css.push("    " + cssVar(path) + ": " + cssValue(token) + ";");
  css.push("  }", "}", "");
  const tw4 = ["/* User-defined mappings only. */", "@theme inline {"];
  const preset = { theme: { extend: { colors: {}, spacing: {}, borderRadius: {}, fontFamily: {} } } };
  const groups = { colors: ["color", "colors"], spacing: ["spacing", "spacing"], radii: ["radius", "borderRadius"], fonts: ["font", "fontFamily"] };
  for (const [group, [namespace, target]] of Object.entries(groups)) {
    for (const [label, path] of choices[group]) {
      const name = prefix + "-" + kebab(label), value = "var(" + cssVar(path) + ")";
      tw4.push("  --" + namespace + "-" + name + ": " + value + ";");
      preset.theme.extend[target][name] = value;
    }
  }
  tw4.push("}", "");
  const bs = ["/* Explicit Bootstrap variable mappings chosen by the consumer. */", ":root {"];
  for (const [label, path] of Object.entries(mappingObject(mapping.bootstrap, "bootstrap"))) {
    if (!/^--bs-[a-z0-9-]+$/.test(label)) error("Unsupported Bootstrap property: " + label);
    const record = tokens.get(path);
    if (!record) error("Unknown Bootstrap mapped token: " + path);
    if (label.endsWith("-rgb") && record.type !== "color") error("Bootstrap RGB expects a color: " + label);
    bs.push("  " + label + ": " + (label.endsWith("-rgb") ? rgb(record.value) : "var(" + cssVar(path) + ")") + ";");
  }
  bs.push("}", "");
  const stylex = Object.fromEntries(Array.from(tokens, ([path, record]) => [camel(path), cssValue(record)]));
  const manifest = { format: "uf-css-custom-system-v1", prefix,
    tokens: Array.from(tokens, ([path, record]) => ({ path, type: record.type })),
    outputs: ["tokens.css", "tailwind-v4.css", "tailwind-v3.cjs", "bootstrap.css", "stylex.stylex.ts", "native.ts", "manifest.json"] };
  return {
    "tokens.css": css.join("\n"),
    "tailwind-v4.css": tw4.join("\n"),
    "tailwind-v3.cjs": "/* User-defined Tailwind v3 preset. */\nmodule.exports = " + JSON.stringify(preset, null, 2) + "\n",
    "bootstrap.css": bs.join("\n"),
    "stylex.stylex.ts": '/* User-defined StyleX variables; requires compiler. */\nimport * as stylex from "@stylexjs/stylex"\nexport const systemVars = stylex.defineVars(' + JSON.stringify(stylex, null, 2) + ")\n",
    "native.ts": "/* User-defined native values; rem dimensions need platform conversion. */\nexport const systemTokens = " + JSON.stringify(nativeTree(tokens), null, 2) + " as const\n",
    "manifest.json": JSON.stringify(manifest, null, 2) + "\n",
  };
}
