import test from "node:test";
import assert from "node:assert/strict";
import { parseTokens } from "../scripts/lib/tokens/parse.mjs";
import { generateCustomSystem } from "../scripts/lib/custom-tokens.mjs";

const color = (components, hex) => ({colorSpace:"srgb",components, ...(hex ? {hex} : {})});
test("shared parser accepts numeric spacing names and typed group inheritance", () => {
  const tokens=parseTokens({space:{$type:"dimension","0":{$value:{value:0,unit:"px"}},"3":{$value:{value:12,unit:"px"}}},roles:{a:{$value:"{space.3}"}}});
  assert.deepEqual(tokens.get("space.0"),{type:"dimension",value:{value:0,unit:"px"}});
  assert.deepEqual(tokens.get("roles.a"),{type:"dimension",value:{value:12,unit:"px"}});
});
test("opaque sRGB color does not require a duplicate hex field", () => {
  const tokens=parseTokens({palette:{ink:{$type:"color",$value:color([0.2,0.4,0.6])}}});
  assert.equal(tokens.get("palette.ink").value,"#336699");
  assert.match(generateCustomSystem({prefix:"demo",source:{palette:{ink:{$type:"color",$value:color([0.2,0.4,0.6])}}}})["tokens.css"],/--demo-palette-ink: #336699/);
});
test("shared validator rejects bad metadata, token-child collisions, cycles and malformed references", () => {
  const invalid=[
    {wrong:{$type:"number",$value:1,$unknown:true}},
    {wrong:{$type:"number",$value:1, child:{$type:"number",$value:2}}},
    {wrong:{$type:"number",$value:1,$description:123}},
    {wrong:{$type:"color",$value:color([1,1,1],"#000000")}},
    {wrong:{$type:"number",$value:"{missing.target}"}},
    {a:{$type:"number",$value:"{b}"},b:{$value:"{a}"}},
    {wrong:{$type:"number",$value:1,$extends:"some-token"}},
  ];
  for (const input of invalid) assert.throws(()=>parseTokens(input));
});
test("DTCG-like optional metadata is validated while visual choices remain unconstrained", () => {
  const t=parseTokens({$description:"custom token set", $extensions:{"example.vendor":{v:1}},
    user:{$type:"fontWeight",heading:{$value:650,$deprecated:false},
      body:{$value:"normal",$description:"custom choice"}}});
  assert.equal(t.get("user.heading").value,650);
  assert.equal(t.get("user.body").value,"normal");
});
