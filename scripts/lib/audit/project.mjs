/**
 * Inspect-only, bounded project discovery. No execution, network, imports from
 * the target, following symlinks, generated output or filesystem mutations.
 */
import {lstat,readdir,readFile} from "node:fs/promises";
import {basename,dirname,extname,join,relative,resolve,sep} from "node:path";

const ignoredDirs=new Set([".git",".next",".nuxt",".expo",".turbo",".cache",".output",".vercel",
  ".svelte-kit",".astro",".angular",".idea",".vscode","node_modules","vendor","dist",
  "build","out","coverage","playwright-report","test-results","generated",".gradle",
  "android","ios","Pods","__pycache__"]);
const ignoredNames=new Set(["package-lock.json","pnpm-lock.yaml","yarn.lock","bun.lock",
  "bun.lockb","composer.lock","Cargo.lock",".npmrc","credentials.json",
  "secrets.json","id_rsa","id_ed25519"]);
const nameIsPrivate=(name)=>/^\.env(?:\.|$)|^\.git|^\.ssh$|\.pem$|\.key$|\.p12$|\.pfx$|\.mobileprovision$|^google-services\.json$/i.test(name);
const sourceExts=new Set([".css",".scss",".sass",".less",".html",".htm",".js",".jsx",".ts",".tsx",".vue",".svelte",".json",".mjs",".cjs"]);
const maxDepth=7,maxPaths=2500,maxReadFiles=450,maxFileBytes=125000,maxTotalBytes=4_000_000;
const slash=(p)=>p.split(sep).join("/");
const relativePath=(root,p)=>slash(relative(root,p));
const lineNo=(text,index)=>1+(text.slice(0,index).match(/\n/g)?.length??0);
const finding=(id,severity,message,evidence=[],recommendation="")=>({id,severity,message,evidence,recommendation});
function frameworkVersion(version){
  if(typeof version!=="string")return null;
  // Unresolved workspace, git and local versions cannot be identified safely.
  const match=version.match(/^(?:[~^>= ]*)(\d+)(?:\.|$)/);
  return match?Number(match[1]):null;
}
function recommendationFor(id){
  return ({
    "tailwind-v3":"tailwind-v3",
    "tailwind-v4":"tailwind-v4",
    "bootstrap":"bootstrap",
    "stylex":"stylex",
    "react-native":"react-native",
    "vanilla-css":"css",
  })[id]??null;
}

/** Returns data only. Treat every finding as an indication, never a runtime proof. */
export async function auditProject(inputPath){
  const root=resolve(inputPath);
  const stat=await lstat(root);
  if(!stat.isDirectory()||stat.isSymbolicLink())throw new Error("Project must be an existing, non-symlink directory");
  // A symlink in an ancestor can escape the explicit audit scope even when
  // the final directory itself is not a link.
  for(let current=root;;){
    const link=await lstat(current);
    if(link.isSymbolicLink())throw new Error("Refusing a project path with a symbolic-link ancestor: "+current);
    const parent=dirname(current);
    if(parent===current)break;
    current=parent;
  }
  const packages=[],sources=[],warnings=[],files=[],skipped=[];
  let paths=0,readFiles=0,totalBytes=0,truncated=false;
  const stack=[{directory:root,depth:0}];
  while(stack.length){
    const {directory,depth}=stack.pop();
    let entries;
    try{entries=await readdir(directory,{withFileTypes:true});}
    catch(error){warnings.push(finding("unreadable-directory","warning","Could not inspect folder",[{path:relativePath(root,directory)}],"Review permissions."));continue;}
    entries.sort((a,b)=>a.name.localeCompare(b.name,"en"));
    // Reverse push so traversal is stable in ascending path order.
    for(const entry of [...entries].reverse()){
      const name=entry.name;
      if(nameIsPrivate(name)||ignoredNames.has(name))continue;
      const absolute=join(directory,name);
      if(entry.isSymbolicLink()){skipped.push(relativePath(root,absolute));continue;}
      if(entry.isDirectory()){
        if(!ignoredDirs.has(name)&&!name.startsWith(".")&&depth<maxDepth)stack.push({directory:absolute,depth:depth+1});
        else if(depth>=maxDepth)truncated=true;
        continue;
      }
      if(!entry.isFile())continue;
      const ext=extname(name).toLowerCase();
      if(name!=="package.json"&&!sourceExts.has(ext))continue;
      paths++;
      if(paths>maxPaths){truncated=true;break;}
      const path=relativePath(root,absolute);
      files.push(path);
      if(readFiles>=maxReadFiles || totalBytes>=maxTotalBytes){truncated=true;continue;}
      const fileStat=await lstat(absolute);
      if(!fileStat.isFile()||fileStat.size>maxFileBytes){if(fileStat.size>maxFileBytes)truncated=true;continue;}
      const content=await readFile(absolute,"utf8");
      const bytes=Buffer.byteLength(content);
      if(bytes+totalBytes>maxTotalBytes){truncated=true;continue;}
      totalBytes+=bytes;readFiles++;
      if(name==="package.json"){
        try{
          const manifest=JSON.parse(content);
          const dependencies={...manifest.dependencies,...manifest.devDependencies,...manifest.peerDependencies};
          packages.push({path,dependencies});
        }catch{
          warnings.push(finding("invalid-manifest","warning","Cannot parse package manifest",
            [{path}],"Review the package.json syntax before adapting frameworks."));
        }
      }
      if([".css",".scss",".sass",".less",".html",".htm",".js",".jsx",".ts",".tsx",".vue",".svelte",".mjs",".cjs"].includes(ext)){
        sources.push({path,content,ext});
      }
    }
    if(paths>maxPaths)break;
  }
  files.sort();
  sources.sort((a,b)=>a.path.localeCompare(b.path,"en"));
  packages.sort((a,b)=>a.path.localeCompare(b.path,"en"));

  const findings=[...warnings];
  const frameworks=[];
  const seenFrameworks=new Set();
  const addFramework=(id,version,evidence,confidence="high")=>{
    const key=id+"|"+evidence.path;
    if(seenFrameworks.has(key))return;
    seenFrameworks.add(key);
    frameworks.push({id,version:version??"unknown",confidence,evidence,adapter:confidence==="high"?recommendationFor(id):null});
  };
  for(const pkg of packages){
    const deps=pkg.dependencies;
    for(const [name,ver] of Object.entries(deps)){
      const major=frameworkVersion(ver);
      if(name==="tailwindcss"){
        if(major===3||major===4)addFramework("tailwind-v"+major,ver,{path:pkg.path,signal:"tailwindcss dependency"});
        else addFramework("tailwind-unknown",ver,{path:pkg.path,signal:"tailwindcss dependency; version not understood"},"medium");
      }else if(name==="bootstrap"){
        addFramework(major===5?"bootstrap":"bootstrap-unknown",ver,{path:pkg.path,signal:"bootstrap dependency"},major===5?"high":"medium");
      }else if(name==="@stylexjs/stylex"){
        addFramework("stylex",ver,{path:pkg.path,signal:"@stylexjs/stylex dependency"},
          major===null?"medium":"high");
      }else if(name==="expo"){
        addFramework("expo",ver,{path:pkg.path,signal:"Expo dependency"});
      }else if(name==="react-native"){
        addFramework("react-native",ver,{path:pkg.path,signal:"React Native dependency"},
          major===null?"medium":"high");
      }else if(name==="next"){
        addFramework("nextjs",ver,{path:pkg.path,signal:"Next.js dependency"});
      }
    }
  }
  const contains=(re)=>sources.find(s=>re.test(s.content));
  for(const [id,re,signal] of [
    ["tailwind-v4",/@import\s+["']tailwindcss(?:\/[^"']*)?["']|@theme\s*\{/m,"Tailwind v4 CSS syntax"],
    ["tailwind-v3",/@tailwind\s+(?:base|components|utilities)\s*;/m,"Tailwind v3 directives"],
    ["bootstrap",/@import\s+["'][^"']*bootstrap[^"']*["']|class(?:Name)?=["'][^"']*\b(?:container-fluid|navbar|btn-primary)\b/m,"Bootstrap stylesheet or class"],
    ["stylex",/from\s+["']@stylexjs\/stylex["']|require\(["']@stylexjs\/stylex["']\)/m,"StyleX import"],
  ]){
    const source=contains(re);
    if(source&&!frameworks.some(f=>f.id===id))
      addFramework(id,"unverified",{path:source.path,signal},"medium");
  }
  if(sources.some(s=>[".css",".scss",".sass",".less",".html",".htm"].includes(s.ext)))
    addFramework("vanilla-css","native",{path:sources.find(s=>[".css",".scss",".sass",".less",".html",".htm"].includes(s.ext)).path,signal:"CSS or HTML source"});
  if(!frameworks.length)frameworks.push({id:"unknown",version:"unknown",confidence:"low",
    evidence:{path:".",signal:"No supported framework indicators in inspected files"},adapter:null});

  // Compare duplicated token definitions across DISTINCT files. A theme may
  // legitimately redefine one property in a dark selector within the same file.
  const tokenDefinitions=new Map();
  for(const source of sources.filter(s=>[".css",".scss",".sass",".less"].includes(s.ext))){
    const re=/(--[a-zA-Z_][\w-]*)\s*:\s*([^;\n}]+)/g;
    for(const match of source.content.matchAll(re)){
      const name=match[1],value=match[2].trim().replace(/\s+/g," ");
      if(value.length>160)continue;
      const definition={path:source.path,line:lineNo(source.content,match.index),value};
      const existing=tokenDefinitions.get(name)??[];
      if(existing.length<20)existing.push(definition);
      tokenDefinitions.set(name,existing);
    }
  }
  const duplicates=[];
  for(const [name,definitions] of tokenDefinitions){
    const paths=new Set(definitions.map(d=>d.path));
    if(paths.size<2)continue;
    const values=new Set(definitions.map(d=>d.value));
    const conflict=values.size>1;
    const evidence=definitions.slice(0,5).map(({path,line})=>({path,line}));
    duplicates.push({name,files:[...paths].sort(),conflict,evidence});
    findings.push(finding(conflict?"token-conflict":"token-duplication",
      conflict?"warning":"info",conflict?"Token is defined with different values across files":"Token is defined in multiple files",
      evidence,"Identify canonical token ownership; don't remove intentional theme overrides automatically."));
  }

  const review={navigation:[],interaction:[],states:[],imports:[]};
  for(const src of sources){
    const isCss=[".css",".scss",".sass",".less"].includes(src.ext);
    if(isCss){
      const imports=[...src.content.matchAll(/@import\s+[^;\n]+;/g)];
      const firstRule=src.content.search(/(?:^|\n)\s*[^@\s/*][^{}\n]*\{/m);
      for(const match of imports){
        if(firstRule>=0&&match.index>firstRule){
          const ev={path:src.path,line:lineNo(src.content,match.index)};
          review.imports.push(ev);
          findings.push(finding("import-order-review","info","Possible stylesheet import after a CSS rule",
            [ev],"Review import order in the project's actual CSS processor; Sass may differ."));
          break;
        }
      }
      if(/\b(?:order\s*:\s*-?\d+|grid-auto-flow\s*:\s*dense)\b/.test(src.content)){
        review.navigation.push({path:src.path,signal:"CSS visual reordering"});
      }
    }else if([".html",".htm",".tsx",".jsx",".vue",".svelte"].includes(src.ext)){
      if(/<nav\b/i.test(src.content))review.navigation.push({path:src.path,signal:"navigation markup present"});
      const clickable=/<(?:div|span)\b[^>]{0,400}\bonClick\s*=|<(?:div|span)\b[^>]{0,400}\bon:click\s*=/gi;
      for(const m of src.content.matchAll(clickable)){
        const ev={path:src.path,line:lineNo(src.content,m.index)};
        review.interaction.push(ev);
        findings.push(finding("nonsemantic-click-handler","warning","Clickable noninteractive element may lack keyboard semantics",
          [ev],"Prefer native button or link, or verify full keyboard/role support manually."));
        if(review.interaction.length>=20)break;
      }
      if(/\b(?:isLoading|loading|pending|isPending|aria-busy)\b/i.test(src.content)&&
         /\b(?:error|invalid|failed|rejected)\b/i.test(src.content)) review.states.push({path:src.path,signal:"loading and error text found"});
    }
  }
  const adapterChoices=[...new Map(frameworks.filter(f=>f.adapter).map(f=>[f.adapter,{adapter:f.adapter,basis:f.id,
    confirmation:"Requires user approval; no packages or styles applied by audit"}])).values()];
  if(frameworks.some(f=>f.id.endsWith("-unknown")||f.id==="unknown")){
    findings.push(finding("unsupported-stack","info","Framework version or stack needs manual review",
      [],"Keep the existing stack and use creator-owned CSS/token mapping if an adapter is not verified."));
  }
  if(truncated)findings.push(finding("partial-audit","warning","Audit input budget or depth limit reached",
    [],"Results may omit files. Limit scope to a smaller package and rerun."));
  if(skipped.length)findings.push(finding("symlink-skipped","info","Symlink entries were skipped, not followed",
    skipped.slice(0,5).map(path=>({path})),"Inspect linked workspaces separately if needed."));
  findings.sort((a,b)=>a.id.localeCompare(b.id)||JSON.stringify(a.evidence).localeCompare(JSON.stringify(b.evidence)));
  frameworks.sort((a,b)=>a.id.localeCompare(b.id)||a.evidence.path.localeCompare(b.evidence.path));
  duplicates.sort((a,b)=>a.name.localeCompare(b.name));
  return {
    schemaVersion:1,kind:"uf-css-inspect-only-audit",
    project:basename(root),readonly:true,
    coverage:{candidateFiles:files.length,readFiles,bytesRead:totalBytes,truncated,
      skippedSymlinks:skipped.length,maxDepth,maxReadFiles,maxTotalBytes},
    frameworks,adapterChoices,
    design:{tokenNames:[...tokenDefinitions.keys()].sort(),duplicates,
      possibleTokenFiles:files.filter(p=>/token|theme|design-system|style/i.test(p)).slice(0,60),
      componentDirectories:[...new Set(files.filter(p=>/(?:^|\/)components\//.test(p)).map(p=>p.split("/").slice(0,-1).join("/")))].sort().slice(0,30)},
    review,findings,
    nextSteps:[
      "Review findings and confirm actual user tasks, semantics and intended visual identity.",
      "Choose or reject any suggested compatible adapter; existing stack stays unchanged.",
      "Only after explicit approval: preview user-authored config via uf-css init --dry-run.",
      "Use --yes only after reviewing exact output paths; all migrations and installs require separate approval.",
    ],
    limitations:[
      "Static heuristics do not prove accessibility, keyboard behavior or runtime correctness.",
      "No source changes, package installs, scripts, network requests, external reads or output files were performed.",
      "Ignored generated/vendor/private paths, ignored symlinks and bounded input size may omit relevant files.",
    ],
  };
}
