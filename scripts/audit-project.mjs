#!/usr/bin/env node
import {resolve} from "node:path";
import {auditProject} from "./lib/audit/project.mjs";

function usage(){
  console.log("UF-CSS inspect-only project audit. No file writes, installs or project scripts.");
  console.log("Usage: uf-css audit --project DIRECTORY [--format text|json]");
  console.log("The directory must be explicit; reports print to stdout only.");
}
function parse(args){
  const options={};
  for(let i=0;i<args.length;i++){
    const key=args[i];
    if(key==="--help"||key==="-h"){if(args.length!==1)throw new Error("--help cannot be mixed with arguments");return {help:true};}
    if(!["--project","--format"].includes(key))throw new Error("Unsupported audit option: "+key);
    if(options[key])throw new Error("Duplicate option: "+key);
    if(!args[i+1]||args[i+1].startsWith("--"))throw new Error("Missing value for "+key);
    options[key]=args[++i];
  }
  if(!options["--project"])throw new Error("--project DIRECTORY is required; audit has no implicit target");
  if(options["--format"]&&!["text","json"].includes(options["--format"]))throw new Error("Format must be text or json");
  return {project:resolve(options["--project"]),format:options["--format"]??"text"};
}
export function formatAuditText(data){
  const lines=[
    "UF-CSS inspect-only project audit — no files changed",
    "Project: "+data.project,
    "Coverage: "+data.coverage.readFiles+" files read of "+data.coverage.candidateFiles+" candidates"+
      (data.coverage.truncated?" (PARTIAL)":""),"",
    "Detected stacks (detection is not installation):",
    ...data.frameworks.map(f=>"  - "+f.id+" ("+f.version+"; "+f.confidence+" confidence)"+
      " — "+f.evidence.path+" ["+f.evidence.signal+"]"),
    "Compatible optional adapters:",
    ...(data.adapterChoices.length?data.adapterChoices.map(a=>"  - "+a.adapter+" (approval required)"):["  - none confirmed; keep existing implementation"]),
    "Token ownership:",
    "  - "+data.design.tokenNames.length+" distinct custom properties seen",
    "  - "+data.design.duplicates.length+" cross-file duplicated properties (review context)",
    "Potential findings ("+data.findings.length+"):",
    ...(data.findings.length?data.findings.map(f=>"  - ["+f.severity+"] "+f.id+": "+f.message+
      (f.evidence.length?" ("+f.evidence.map(e=>e.path+(e.line?":"+e.line:"")).join(", ")+")":"")):["  - No static findings"]),
    "Next steps:",...data.nextSteps.map((n,i)=>"  "+(i+1)+". "+n),
    "Limits:",...data.limitations.map(n=>"  - "+n),
  ];
  return lines.join("\n")+"\n";
}
async function main(){
  const config=parse(process.argv.slice(2));
  if(config.help){usage();return;}
  const result=await auditProject(config.project);
  process.stdout.write(config.format==="json"?JSON.stringify(result,null,2)+"\n":formatAuditText(result));
}
main().catch(error=>{console.error("UF-CSS audit: "+error.message);process.exitCode=1;});
