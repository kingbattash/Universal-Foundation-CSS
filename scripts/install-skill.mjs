#!/usr/bin/env node
/**
 * Copies the portable Agent Skill into another project. No dependencies,
 * network calls, destructive overwrites or hidden execution.
 */
import { cp, mkdir, stat } from "node:fs/promises"
import { resolve, join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const skill = "universal-foundation-css"
const source = join(sourceRoot, ".agents", "skills", skill)
const locations = {
  codex: ".agents/skills",
  claude: ".claude/skills",
  copilot: ".github/skills",
}
const args = process.argv.slice(2)
if (args.includes("--help") || args.length === 0) {
  process.stdout.write("Usage: node scripts/install-skill.mjs --target codex|claude|copilot|all --project PATH\n")
  process.exit(0)
}
function option(name) {
  const i = args.indexOf(name)
  if (i === -1 || !args[i+1] || args[i+1].startsWith("--")) {
    throw new Error(`Missing value for ${name}`)
  }
  return args[i+1]
}
try {
  const target = option("--target")
  const project = resolve(option("--project"))
  if (target !== "all" && !(target in locations)) throw new Error("Unknown target. Use codex, claude, copilot or all")
  const targets = target === "all" ? Object.keys(locations) : [target]
  await stat(source)
  for (const key of targets) {
    const dest = join(project, locations[key], skill)
    try { await stat(dest); process.stdout.write(`Skipped existing: ${dest}\n`); continue }
    catch (err) { if (err.code !== "ENOENT") throw err }
    await mkdir(dirname(dest), {recursive:true})
    await cp(source, dest, {recursive:true, errorOnExist:true, force:false})
    process.stdout.write(`Installed for ${key}: ${dest}\n`)
  }
} catch(error) {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
}
