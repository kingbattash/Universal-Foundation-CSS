import { parseTokens, plain, validKey, reserved, kebab, tokenName, camel, error } from "./tokens/parse.mjs";
export { parseTokens } from "./tokens/parse.mjs";

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
