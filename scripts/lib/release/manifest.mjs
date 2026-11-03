/**
 * Side-effect-free release manifest checks. This module never publishes,
 * creates tags, changes versions or modifies third-party projects.
 */
const VERSION=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
export const EXPECTED_PACKAGE="@kingbattash/universal-foundation-css";
export const EXPECTED_REPO="https://github.com/kingbattash/Universal-Foundation-CSS";
export const CLI_FILES=[
  "scripts/cli.mjs","scripts/init-project.mjs","scripts/audit-project.mjs",
  "scripts/generate-custom-system.mjs","scripts/generate-project-theme.mjs",
  "scripts/lib/audit/project.mjs","scripts/lib/init/config.mjs",
  "scripts/lib/init/scaffold.mjs","scripts/lib/init/wizard.mjs",
  "scripts/lib/project-theme.mjs","scripts/lib/theme-v2.mjs",
  "scripts/lib/custom-tokens.mjs","scripts/lib/tokens/parse.mjs",
  "scripts/lib/tokens/format.mjs","scripts/lib/tokens/custom-renderer.mjs",
  "scripts/lib/tokens/starter-renderer.mjs",
];
export function isPrereleaseVersion(version){
  if(typeof version!=="string")return false;
  const match=VERSION.exec(version);
  if(!match||!match[4])return false;
  return match[4].split(".").every(segment=>
    !/^\d+$/.test(segment)||segment==="0"||!segment.startsWith("0"));
}
export function validateManifest(pkg,{candidate,requirePrerelease=false}={}){
  const errors=[];
  const fail=message=>errors.push(message);
  if(!pkg||typeof pkg!=="object")return ["package.json must be an object"];
  if(pkg.name!==EXPECTED_PACKAGE)fail("Unexpected package name");
  if(typeof pkg.version!=="string"||!VERSION.test(pkg.version))fail("Invalid SemVer package version");
  if(candidate!==undefined&&pkg.version!==candidate)fail("Candidate version must exactly match package.json");
  if(requirePrerelease&&!isPrereleaseVersion(pkg.version))fail("Only an explicit SemVer prerelease may use the prerelease gate");
  if(pkg.license!=="Apache-2.0")fail("Apache-2.0 license declaration missing");
  if(pkg.type!=="module")fail("Expected ESM package type");
  if(pkg.publishConfig?.access!=="public")fail("Public scoped package access must be explicit");
  const repoUrl=String(pkg.repository?.url??"").replace(/^git\+/,"").replace(/\.git$/,"");
  if(repoUrl!==EXPECTED_REPO)fail("repository.url must match the official source repository");
  if(pkg.bin?.["uf-css"]!=="./scripts/cli.mjs")fail("uf-css CLI mapping missing");
  if(!pkg.exports?.["."]?.default||!pkg.exports?.["."]?.types)fail("Main JS/declaration exports missing");
  if(!pkg.sideEffects?.includes("**/*.css"))fail("CSS side effects must be preserved");
  if(pkg.peerDependenciesMeta?.["@stylexjs/stylex"]?.optional!==true)
    fail("StyleX peer must remain optional");
  if(!Array.isArray(pkg.files)||!pkg.files.includes("dist/src"))fail("Only published dist/src output should be included; do not ship dist/tests");
  return errors;
}
export function validatePackedFiles(pkg,packed){
  const errors=[];
  const files=new Set(packed.map(x=>typeof x==="string"?x:x.path).filter(Boolean).map(x=>x.replace(/^\.\//,"")));
  const required=new Set(["LICENSE","README.md","CHANGELOG.md","package.json","tokens/source.tokens.json",...CLI_FILES]);
  for(const raw of Object.values(pkg.exports??{})){
    const target=typeof raw==="string"?raw:raw?.default;
    const types=typeof raw==="object"?raw?.types:undefined;
    if(target)required.add(target.replace(/^\.\//,""));
    if(types)required.add(types.replace(/^\.\//,""));
  }
  for(const path of required)if(!files.has(path))errors.push("Required tarball file missing: "+path);
  for(const path of files){
    if(/^(?:tests\/|dist\/tests\/|integration\/|\.github\/|node_modules\/)/.test(path)||
       /(?:^|\/)(?:\.env(?:\.|$)|\.npmrc$|id_rsa$|id_ed25519$|[^/]+\.(?:pem|p12|pfx|key)$)/i.test(path))
      errors.push("Unexpected private/test artifact in tarball: "+path);
  }
  if(files.size===0)errors.push("Tarball file listing is empty");
  return errors;
}
