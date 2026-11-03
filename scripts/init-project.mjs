#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { collectWizard } from "./lib/init/wizard.mjs";
import { buildScaffold, writeScaffold } from "./lib/init/scaffold.mjs";

function help() {
  console.log("UF-CSS interactive design-system builder");
  console.log("Usage:");
  console.log("  node scripts/init-project.mjs                    # interactive wizard");
  console.log("  node scripts/init-project.mjs --config FILE --out DIR --dry-run");
  console.log("  node scripts/init-project.mjs --config FILE --out DIR --yes");
  console.log("Options: --config FILE, --out DIR, --dry-run, --yes, --force, --help");
  console.log("No directories or files are created before explicit confirmation.");
}
function parseArgs(args) {
  const opts = {};
  const choices = new Set(["--config", "--out", "--dry-run", "--yes", "--force", "--help"]);
  for (let i = 0; i < args.length; i++) {
    const option = args[i];
    if (!choices.has(option)) throw new Error("Unknown option: " + option);
    if (option === "--config" || option === "--out") {
      if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error("Expected value for " + option);
      if (opts[option]) throw new Error("Duplicate option: " + option);
      opts[option] = args[++i];
    } else {
      if (opts[option]) throw new Error("Duplicate option: " + option);
      opts[option] = true;
    }
  }
  if (opts["--yes"] && !opts["--config"]) throw new Error("--yes requires --config for safe automation");
  if (opts["--dry-run"] && opts["--force"]) throw new Error("Cannot combine --dry-run with --force");
  return opts;
}
function preview(out, { config, files, notes }) {
  console.log("\n=== Design system preview — nothing has been written ===");
  console.log("Project: " + config.name);
  console.log("Output: " + resolve(out));
  console.log("Frameworks: " + (config.frameworks.join(", ") || "none (config only)"));
  console.log("Colors: " + (Object.entries(config.design.colors).map(([r, c]) => r + "=" + c).join(", ") || "none"));
  console.log("Grids: " + (config.design.grids.layouts.map(g => g.id === "custom" ? g.name + " (" + g.columns + " columns)" : g.id).join(", ") || "none"));
  console.log("Guides: " + (config.design.grids.guides.join(", ") || "none"));
  console.log("Hierarchy: " + (config.design.hierarchy.join(", ") || "none"));
  for (const note of notes) console.log("Note: " + note);
  console.log("Planned files:");
  for (const file of Object.keys(files)) console.log("  " + file);
  console.log("=========================================================\n");
}
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts["--help"]) return help();
  let cli;
  try {
    let config, out;
    if (opts["--config"]) {
      config = JSON.parse(await readFile(resolve(opts["--config"]), "utf8"));
      out = opts["--out"];
      if (!out) throw new Error("--out is required with --config");
    } else {
      if (!process.stdin.isTTY) throw new Error("Interactive setup needs a terminal. For automation use --config FILE --out DIR --dry-run or --yes.");
      cli = createInterface({ input: process.stdin, output: process.stdout });
      const result = await collectWizard(message => cli.question(message));
      config = result.config;
      out = opts["--out"] || result.suggestedOut;
    }
    const plan = buildScaffold(config);
    preview(out, plan);
    if (opts["--dry-run"]) return;
    if (!opts["--yes"]) {
      if (!cli) {
        if (!process.stdin.isTTY) throw new Error("No files created. Use --yes with --config to approve non-interactive generation.");
        cli = createInterface({ input: process.stdin, output: process.stdout });
      }
      const reply = (await cli.question("Generate these files? Type yes to confirm: ")).trim().toLowerCase();
      if (reply !== "yes") {
        console.log("Cancelled. No folders or files created.");
        return;
      }
    }
    await writeScaffold(out, plan.files, { force: !!opts["--force"] });
    console.log("Created your own design system at " + resolve(out));
  } finally { cli?.close(); }
}
main().catch(error => { console.error("UF-CSS builder: " + error.message); process.exitCode = 1; });
