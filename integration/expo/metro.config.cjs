const path=require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config=getDefaultConfig(__dirname);
// The fixture imports the canonical generated adapter from this repository.
config.watchFolders=[path.resolve(__dirname,"../..")];
config.resolver.nodeModulesPaths=[path.resolve(__dirname,"node_modules")];
module.exports=config;
