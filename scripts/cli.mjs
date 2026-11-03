#!/usr/bin/env node
const command = process.argv[2];
if (!command || ["--help", "-h", "help"].includes(command)) {
  console.log("UF-CSS is a design-system creation toolkit, not a prescribed design system.");
  console.log("  uf-css init [--config FILE --out DIR --dry-run|--yes]");
  console.log("  uf-css generate --tokens FILE --prefix NAME --out DIR [--mapping FILE]");
} else if (command === "init" || command === "generate") {
  process.argv.splice(2, 1);
  if (command === "init") await import("./init-project.mjs");
  else await import("./generate-custom-system.mjs");
} else {
  console.error("Unknown uf-css command: " + command + ". Use uf-css --help.");
  process.exitCode = 1;
}
