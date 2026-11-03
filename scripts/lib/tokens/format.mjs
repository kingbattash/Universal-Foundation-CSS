/** Shared formatting functions used by both token emitters. */
export const kebab = name => name.replace(/([a-z0-9])([A-Z])/g,"$1-$2").replace(/_/g,"-").toLowerCase();
export function cssTokenValue(token) {
  const {type,value} = token;
  if (type === "color") return typeof value === "string" ? value : value.hex;
  if (type === "dimension" || type === "duration") return String(value.value) + value.unit;
  if (type === "fontFamily") return (Array.isArray(value) ? value : [value]).map(
    f => /^[a-zA-Z][a-zA-Z0-9-]*$/.test(f) ? f : JSON.stringify(f)
  ).join(", ");
  if (type === "cubicBezier") return "cubic-bezier(" + value.join(", ") + ")";
  return String(value);
}
export function nativeTokenValue(token) {
  const {type,value} = token;
  if (type === "dimension") return value.unit === "px" ? value.value : {value:value.value,unit:"rem"};
  if (type === "duration") return value.unit === "s" ? value.value * 1000 : value.value;
  return value;
}
export const rgb = hex => [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(", ");
