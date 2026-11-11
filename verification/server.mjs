import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname, '..');
createServer(async (req, res) => {
 try {
  const url = new URL(req.url, 'http://127.0.0.1:4313');
  if (req.method === 'POST' && url.pathname === '/verification/report') {
   let data='';for await (const chunk of req){data+=chunk;if(data.length>2000000)throw new Error('Report too large')}
   await writeFile(resolve(import.meta.dirname,'results.json'),JSON.stringify(JSON.parse(data),null,2));res.end('saved');return;
  }
  const path=resolve(root,'.'+decodeURIComponent(url.pathname === '/' ? '/verification/index.html':url.pathname));
  if(!path.startsWith(root+sep)) {res.writeHead(403);res.end();return}
  const content=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(path)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(content);
 } catch(error){res.writeHead(404);res.end(error.message)}
}).listen(4313,'127.0.0.1',()=>console.log('CKEditor verification at http://127.0.0.1:4313/'));
