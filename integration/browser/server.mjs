#!/usr/bin/env node
/** Loopback-only static fixture server; never serves outside repo root. */
import http from "node:http";
import {readFile, realpath, stat} from "node:fs/promises";
import {dirname,extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const realRoot=await realpath(root);
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const host="127.0.0.1",port=4391;
const server=http.createServer(async(req,res)=>{
  try{
    if(req.method!=="GET"&&req.method!=="HEAD") {res.writeHead(405).end();return;}
    const pathname=new URL(req.url??"/","http://127.0.0.1").pathname;
    if(pathname==="/__health"){res.writeHead(200,{"content-type":"text/plain"}).end("ok");return;}
    const decoded=decodeURIComponent(pathname);
    if(decoded.includes("\0")||decoded.includes("\\")){res.writeHead(400).end("bad path");return;}
    const target=resolve(root,"."+decoded);
    if(target!==root && !target.startsWith(root+sep)){res.writeHead(403).end("denied");return;}
    const full=await realpath(target);
    if(full!==realRoot && !full.startsWith(realRoot+sep)){res.writeHead(403).end("denied");return;}
    if(!(await stat(full)).isFile()){res.writeHead(404).end("not a file");return;}
    const bytes=await readFile(full);
    res.writeHead(200,{"content-type":types[extname(full)]??"application/octet-stream",
      "cache-control":"no-store","x-content-type-options":"nosniff"});
    res.end(req.method==="HEAD"?undefined:bytes);
  }catch(error){
    const status=error?.code==="ENOENT"?404:400;
    res.writeHead(status).end("not found");
  }
});
server.listen(port,host,()=>console.log("UF-CSS browser fixtures on http://"+host+":"+port));
