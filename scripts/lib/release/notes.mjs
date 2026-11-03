import {isPrereleaseVersion} from "./manifest.mjs";

/** Release notes cannot be generated from a green test status alone. */
export function validateReleaseNotes(version,changelog,notes){
  const errors=[];
  if(!isPrereleaseVersion(version))return ["Candidate must be a SemVer prerelease"];
  if(typeof changelog!=="string"||typeof notes!=="string")
    return ["Release changelog and version-specific notes must both exist"];
  const escaped=version.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const dated=new RegExp("^## \\["+escaped+"\\] - (\\d{4}-\\d{2}-\\d{2})\\s*$","m");
  const m=changelog.match(dated);
  if(!m)errors.push("CHANGELOG.md needs a dated exact-version heading: ## ["+version+"] - YYYY-MM-DD");
  const heading="# UF-CSS "+version;
  if(!notes.split(/\r?\n/).some(line=>line.trim()===heading))
    errors.push("Version-specific notes need heading: "+heading);
  const sections=["Changes","Compatibility","Breaking changes","Verification","Remaining limitations"];
  for(let i=0;i<sections.length;i++){
    const title="## "+sections[i];
    const start=notes.indexOf(title);
    if(start<0){errors.push("Missing release notes section: "+title);continue;}
    const bodyStart=start+title.length;
    const end=notes.indexOf("\n## ",bodyStart);
    const body=notes.slice(bodyStart,end<0?undefined:end).trim();
    if(!body||/^(?:TODO|TBD|<.*>|\[fill.*\])$/i.test(body))
      errors.push("Release notes section is empty or placeholder: "+title);
  }
  if(/\b(?:TODO|TBD|<approved-version>|<verified-main-sha>)\b/i.test(notes))
    errors.push("Release notes still contain unresolved placeholders");
  return errors;
}
