import test from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, readFile, stat, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { spawnSync } from "node:child_process"

const repository = process.cwd()
const sourceSkill = join(repository, ".agents", "skills", "universal-foundation-css", "SKILL.md")
const installer = join(repository, "scripts", "install-skill.mjs")

test("skill has valid minimal frontmatter", async () => {
  const doc = await readFile(sourceSkill, "utf8")
  const match = doc.match(/^---\n([\s\S]*?)\n---\n/)
  assert.ok(match, "SKILL.md requires YAML frontmatter")
  assert.match(match[1], /^name: universal-foundation-css$/m)
  assert.match(match[1], /^description: .+/m)
  assert.match(match[1], /^license: Apache-2\.0$/m)
  assert.ok(doc.includes("## Workflow"))
  assert.ok(doc.includes("## Safety and scope"))
})

test("installer copies to all three hosts and never overwrites existing customization", async () => {
  const project = await mkdtemp(join(tmpdir(), "uf-css-skill-"))
  try {
    const run = () => spawnSync(process.execPath, [installer, "--target", "all", "--project", project], {
      encoding: "utf8",
      cwd: repository,
    })
    const first = run()
    assert.equal(first.status, 0, first.stderr)
    const destinations = [".agents/skills", ".claude/skills", ".github/skills"]
    for (const folder of destinations) {
      const path = join(project, folder, "universal-foundation-css", "SKILL.md")
      assert.ok((await stat(path)).size > 10)
    }
    const codex = join(project, ".agents/skills/universal-foundation-css/SKILL.md")
    await writeFile(codex, "Local custom skill\n")
    const second = run()
    assert.equal(second.status, 0, second.stderr)
    assert.match(second.stdout, /Skipped existing:/)
    assert.equal(await readFile(codex, "utf8"), "Local custom skill\n")
  } finally {
    await rm(project, { recursive: true, force: true })
  }
})
