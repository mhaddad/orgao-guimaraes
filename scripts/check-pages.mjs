import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const project=fileURLToPath(new URL('../',import.meta.url));
const dist=resolve(project,'dist'),base='/orgao-guimaraes/';
const html=await readFile(resolve(dist,'index.html'),'utf8');
const assets=[...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
 .map(match=>match[1]).filter(url=>url.includes('/assets/'));
assert.ok(assets.length>=2,'O HTML deve incluir JavaScript e CSS compilados.');
for(const asset of assets){
 assert.ok(asset.startsWith(base),`Caminho sem o prefixo do repositório: ${asset}`);
 assert.ok((await stat(resolve(dist,asset.slice(base.length)))).isFile());
}
const files=await readdir(resolve(dist,'assets'));
for(const file of files.filter(name=>name.endsWith('.css'))){
 const css=await readFile(resolve(dist,'assets',file),'utf8');
 const fonts=[...css.matchAll(/url\((?:["'])?([^\s)'"?]+\.ttf)(?:["'])?\)/g)].map(match=>match[1]);
 assert.equal(fonts.length,5,'As cinco fontes locais devem estar no CSS.');
 for(const font of fonts){assert.ok(font.startsWith(base));assert.ok((await stat(resolve(dist,font.slice(base.length)))).isFile());}
}
const score=JSON.parse(await readFile(resolve(dist,'music/bwv846.json'),'utf8'));
assert.equal(score.notes.length,533);
const javascript=(await Promise.all(files.filter(name=>name.endsWith('.js')).map(file=>readFile(resolve(dist,'assets',file),'utf8')))).join('\n');
assert.ok(javascript.includes(base),'O endereço-base deve constar da aplicação.');
assert.ok(!javascript.includes('fetch("/music/'),'A partitura não deve ser pedida na raiz do domínio.');
assert.ok(!(await readdir(dist)).includes('references'),'Fotografias de desenvolvimento não devem integrar a publicação.');
console.log('GitHub Pages: HTML, módulos, fontes e partitura verificados em '+base);
