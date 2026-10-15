import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');const pathname=decodeURIComponent(url.pathname);let file=path.resolve(root,'.'+pathname);
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 const body=await readFile(file),headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
 const range=req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
 if(range){const start=range[1]?Number(range[1]):Math.max(0,body.length-Number(range[2]));const end=range[1]?(range[2]?Math.min(Number(range[2]),body.length-1):body.length-1):body.length-1;
  if(start>=body.length||end<start){res.writeHead(416,{'Content-Range':`bytes */${body.length}`}).end();return;}
  res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${body.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:body.subarray(start,end+1));return;
 }
 res.writeHead(200,{...headers,'Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);
}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('页面未找到');}}).listen(port,'127.0.0.1',()=>console.log(`MOVEVI Local: http://127.0.0.1:${port}`));
