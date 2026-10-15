import http from 'node:http';
import path from 'node:path';
import {readFile,stat} from 'node:fs/promises';
const staticRoot=path.resolve('out');
const previewPort=Number(process.argv[2]||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon'};
const server=http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let target=path.resolve(staticRoot,'.'+pathname);
    if(target!==staticRoot&&!target.startsWith(staticRoot+path.sep)){res.writeHead(403);res.end();return;}
    try{if((await stat(target)).isDirectory())target=path.join(target,'index.html');}catch{}
    let bytes;let status=200;
    try{bytes=await readFile(target);}catch{target=path.join(staticRoot,'404.html');bytes=await readFile(target);status=404;}
    res.writeHead(status,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':target.includes(path.join('_next','static'))?'public,max-age=31536000,immutable':'no-cache'});
    res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(400);res.end('Invalid request');}
});
server.listen(previewPort,'127.0.0.1',()=>console.log(`HORISONY production preview: http://127.0.0.1:${previewPort}`));
