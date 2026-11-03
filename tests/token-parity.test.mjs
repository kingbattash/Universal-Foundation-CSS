import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildStarterOutputs } from "../scripts/lib/tokens/starter-renderer.mjs";
import { generateCustomSystem } from "../scripts/lib/custom-tokens.mjs";

const origin=JSON.parse(await readFile(new URL("../tokens/source.tokens.json",import.meta.url),"utf8"));
const parseGenerated=content=>JSON.parse(content.split("export const generatedTokens = ")[1].split(" as const")[0]);

test("canonical starter value mutation propagates through all relevant platform adapters",()=>{
  const source=structuredClone(origin);
  source.core.color.accent.$value={colorSpace:"srgb",components:[17/255,34/255,51/255],hex:"#112233"};
  source.semantic.action.$value="{core.color.accent}";
  source.core.space["4"].$value.value=19;
  source.core.density.compact.$value.value=13;
  source.core.type.h3Min.$value.value=26;
  const files=buildStarterOutputs(source);
  const ts=parseGenerated(files["src/tokens/generated.ts"]);
  const css=files["src/css/tokens.generated.css"];
  assert.equal(ts.light.action,"#112233");
  assert.equal(ts.spacePx["4"],19);
  assert.equal(ts.density.compact,13);
  assert.equal(ts.type.h3Min,26);
  assert.match(css,/--uf-action: #112233;/);
  assert.match(css,/--uf-space-4: 19px;/);
  assert.match(css,/--uf-density-compact: 13px;/);
  assert.match(css,/--uf-type-h3-min: 26px;/);
  assert.match(files["adapters/bootstrap/bootstrap.generated.css"],/--bs-primary-rgb: 17, 34, 51;/);
  assert.match(files["adapters/tailwind-v3/preset.generated.cjs"],/--uf-action/);
  assert.match(files["adapters/tailwind-v4/theme.generated.css"],/--color-uf-action: var\(--uf-action\);/);
  assert.match(files["adapters/stylex/tokens.generated.stylex.ts"],/"action": "#112233"/);
  assert.match(files["adapters/stylex/tokens.generated.stylex.ts"],/"space4": "19px"/);
  assert.match(files["adapters/react-native/tokens.generated.ts"],/"action": "#112233"/);
  assert.match(files["adapters/react-native/tokens.generated.ts"],/"4": 19/);
});
test("starter adapter outputs are byte-for-byte deterministic and checked into git",async()=>{
  const first=buildStarterOutputs(origin);
  const second=buildStarterOutputs(structuredClone(origin));
  assert.deepEqual(first,second);
  for(const [file,content] of Object.entries(first)) {
    const committed=await readFile(new URL("../"+file,import.meta.url),"utf8");
    assert.equal(committed,content,"Stale generated output: "+file);
  }
});
test("a completely independent design system does not inherit starter palette, scale or token roles",()=>{
  const files=generateCustomSystem({prefix:"custom",source:{myRules:{a:{$type:"number",$value:5}}}});
  assert.match(files["tokens.css"],/--custom-my-rules-a: 5/);
  assert.doesNotMatch(files["tokens.css"],/--uf-action|--uf-space|--uf-density/);
  assert.doesNotMatch(files["native.ts"],/"palette"|"typography"/);
  assert.doesNotMatch(files["tailwind-v4.css"],/--color/);
});
