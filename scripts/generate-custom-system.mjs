#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { generateCustomSystem } from "./lib/custom-tokens.mjs";

const args = process.argv.slice(2);
function usage() {
  console.log("Usage: node scripts/generate-custom-system.mjs --tokens FILE --prefix your-prefix --out DIRECTORY [--mapping FILE] [--check | --force]");
}
function option(name, required = false) {
  const index = args.indexOf(name);
  if (index < 0) {
    if (required) throw new Error("Missing required " + name);
    return undefined;
  }
  if (!args[index + 1] || args[index + 1].startsWith("--")) throw new Error("Missing value after " + name);
  return args[index + 1];
}
async function main() {
  if (!args.length || args.includes("--help")) return usage();
  const allowed = new Set(["--tokens", "--prefix", "--out", "--mapping", "--check", "--force"]);
  for (let i = 0; i < args.length; i++) {
    if (!allowed.has(args[i])) throw new Error("Unknown option: " + args[i]);
    if (!["--check", "--force"].includes(args[i])) i++;
  }
  const check = args.includes("--check"), force = args.includes("--force");
  if (check && force) throw new Error("--force and --check cannot be used together");
  const source = JSON.parse(await readFile(resolve(option("--tokens", true)), "utf8"));
  const mappingPath = option("--mapping");
  const mapping = mappingPath ? JSON.parse(await readFile(resolve(mappingPath), "utf8")) : {};
  const prefix = option("--prefix", true), out = resolve(option("--out", true));
  const files = generateCustomSystem({ source, mapping, prefix });
  const existing = [], stale = [];
  for (const [name, content] of Object.entries(files)) {
    try {
      const old = await readFile(join(out, name), "utf8");
      existing.push(name);
      if (old !== content) stale.push(name);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      stale.push(name);
    }
  }
  if (check) {
    if (stale.length) throw new Error("Missing or stale files: " + stale.join(", "));
    console.log("Verified design system: " + prefix);
    return;
  }
  if (existing.length && !force) throw new Error("Existing files cannot be overwritten without --force: " + existing.join(", "));
  await mkdir(out, { recursive: true });
  for (const [name, content] of Object.entries(files)) await writeFile(join(out, name), content, "utf8");
  console.log("Generated " + Object.keys(files).length + " files for: " + prefix);
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
