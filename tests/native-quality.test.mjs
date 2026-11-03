import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const app=readFileSync(resolve("integration/expo/App.tsx"),"utf8");
const expo=JSON.parse(readFileSync(resolve("integration/expo/package.json"),"utf8"));

test("native fixture makes screen contents scrollable within platform safe areas",()=>{
  assert.match(app,/SafeAreaProvider/);
  assert.match(app,/<SafeAreaView/);
  assert.match(app,/edges=\{\["top","bottom","left","right"\]\}/);
  assert.match(app,/<ScrollView\b/);
  assert.match(app,/contentContainerStyle=\{\[styles\.scrollContent/);
  assert.match(app,/scrollContent:\{flexGrow:1/);
  assert.doesNotMatch(app,/container:\{flex:1,justifyContent:"center"/);
});
test("native fixture exposes font scaling, dynamic width and accessible metric context",()=>{
  assert.match(app,/useWindowDimensions/);
  assert.match(app,/flexDirection:narrow\?"column":"row"/);
  assert.match(app,/allowFontScaling/);
  assert.match(app,/maxFontSizeMultiplier=\{2\.5\}/);
  assert.match(app,/accessibilityRole="header"/);
  assert.match(app,/accessible accessibilityLabel=\{title\+": "\+value\}/);
  assert.match(app,/useColorScheme/);
  assert.match(app,/projectNativeTheme\.modes\.dark/);
});
test("native builds still target Expo Android, but do not claim device or iOS runtime coverage",()=>{
  assert.ok(expo.scripts["export:android"].includes("expo export --platform android"));
  assert.ok(expo.scripts.typecheck.includes("tsc --noEmit"));
  assert.ok(expo.dependencies["react-native-safe-area-context"]);
  assert.ok(!Object.values(expo.scripts).some(s=>s.includes("ios simulator")));
});
