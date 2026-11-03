import {defineConfig} from "@playwright/test";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
export default defineConfig({
  testDir:"./tests",
  fullyParallel:false,
  workers:1,
  retries:process.env.CI?1:0,
  timeout:45_000,
  expect:{timeout:10_000},
  reporter:[["list"],["html",{outputFolder:"playwright-report",open:"never"}]],
  outputDir:"test-results",
  use:{
    baseURL:"http://127.0.0.1:4391",
    browserName:"chromium",
    headless:true,
    trace:"retain-on-failure",
    screenshot:"only-on-failure",
    actionTimeout:10_000,
  },
  webServer:{
    command:"node server.mjs",
    url:"http://127.0.0.1:4391/__health",
    reuseExistingServer:!process.env.CI,
    timeout:20_000,
    cwd:resolve(root,"integration/browser"),
  },
});
