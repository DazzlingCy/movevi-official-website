import {readFile,access} from 'node:fs/promises';
import assert from 'node:assert/strict';
const html=await readFile('dist/index.html','utf8');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'Exactly one h1');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length,'Unique IDs');
for(const link of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(link[1]),`Missing anchor ${link[1]}`);
for(const file of new Set([...html.matchAll(/(?:src|href)="(assets\/[^"#]+|styles\.css|app\.js)"/g)].map(x=>x[1])))await access(`dist/${file}`);
assert(!/lorem ipsum|待填|TODO|href="javascript:/i.test(html),'No unfinished placeholders');
console.log('Passed: local assets, anchors, unique IDs, page semantics, content completeness.');
