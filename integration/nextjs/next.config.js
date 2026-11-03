// An optional independent Next.js + StyleX consumer, not a UF-CSS dependency.
const withStyleX = require("@stylexswc/nextjs-plugin");
module.exports = withStyleX({})({
  output:"export",
  reactStrictMode:true,
  transpilePackages:["@kingbattash/universal-foundation-css"],
  poweredByHeader:false
});
