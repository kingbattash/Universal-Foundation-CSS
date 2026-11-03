/** Pure check-run evaluator for main-branch prerelease preflight. */
export const REQUIRED_CI_CHECKS=[
  "verify","web-adapters","packed-frameworks","nextjs-consumer","expo-adapter","browser-quality",
];
export function evaluateCI(checkRuns, required=REQUIRED_CI_CHECKS){
  if(!Array.isArray(checkRuns))throw new TypeError("Expected GitHub check_runs array");
  const byName=new Map();
  // GitHub check run IDs are monotonically assigned; use the newest for a
  // given check name, never an old success that masks a newer failing run.
  for(const check of checkRuns){
    if(!check||typeof check.name!=="string"||!Number.isFinite(check.id))continue;
    const old=byName.get(check.name);
    if(!old||check.id>old.id)byName.set(check.name,check);
  }
  const results=required.map(name=>{
    const check=byName.get(name);
    return {name,status:check?.status??"missing",conclusion:check?.conclusion??null,
      passed:check?.status==="completed"&&check?.conclusion==="success"};
  });
  return {ok:results.every(x=>x.passed),results};
}
