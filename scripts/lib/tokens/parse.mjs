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
      const record = { type, value }; // referenced value was validated already
      cache.set(path, record);
      return record;
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

export { plain, validKey, reserved, kebab, tokenName, camel, error };
