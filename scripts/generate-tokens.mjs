#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildStarterOutputs } from "./lib/tokens/starter-renderer.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(await readFile(resolve(root, "tokens/source.tokens.json"), "utf8"));
const generated = buildStarterOutputs(source);
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
