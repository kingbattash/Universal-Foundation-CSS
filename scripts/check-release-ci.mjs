#!/usr/bin/env node
/**
 * Live release preflight, intentionally for trusted GitHub Actions only.
 * Fails closed unless all six required CI checks passed on this exact SHA.
 */
import {evaluateCI} from "./lib/release/checks.mjs";
const repo=process.env.GITHUB_REPOSITORY;
const sha=process.env.GITHUB_SHA;
const token=process.env.GITHUB_TOKEN;
if(repo!=="kingbattash/Universal-Foundation-CSS"||!token||
   !/^[0-9a-f]{40}$/i.test(sha??""))
  throw new Error("Live CI gate requires official repo, SHA and GitHub Actions token");
const url="https://api.github.com/repos/"+repo+"/commits/"+sha+"/check-runs?per_page=100";
const res=await fetch(url,{headers:{
  Accept:"application/vnd.github+json",
  Authorization:"Bearer "+token,
  "X-GitHub-Api-Version":"2022-11-28",
}});
if(!res.ok)throw new Error("Unable to read required check-runs (HTTP "+res.status+")");
const data=await res.json();
if(data.total_count>100)throw new Error("More than 100 check-runs; fail closed and inspect manually");
const evaluated=evaluateCI(data.check_runs);
for(const entry of evaluated.results)
  console.log(entry.name+": "+(entry.passed?"PASS":entry.status+"/"+entry.conclusion));
if(!evaluated.ok)throw new Error("Prerelease blocked: not all required checks passed on current commit");
console.log("PASS: all required pre-publish CI checks verified for "+sha);
