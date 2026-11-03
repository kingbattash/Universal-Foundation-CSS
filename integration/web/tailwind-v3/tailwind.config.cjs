const path = require("node:path");
module.exports = {
  presets: [require("../../../adapters/tailwind-v3/preset.generated.cjs")],
  content: [path.join(__dirname,"fixture.html")],
};
