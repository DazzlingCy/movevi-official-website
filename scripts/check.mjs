import {readFile,access} from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const html=await readFile('dist/index.html','utf8');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'Exactly one h1');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length,'Unique IDs');
for(const link of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(link[1]),`Missing anchor ${link[1]}`);
for(const file of new Set([...html.matchAll(/(?:src|href)="(assets\/[^"#]+|[a-z-]+\.(?:css|js))"/g)].map(x=>x[1])))await access(`dist/${file}`);
assert(!/lorem ipsum|待填|TODO|href="javascript:/i.test(html),'No unfinished placeholders');
const dataContext={window:{}};
vm.runInNewContext(await readFile('dist/products-data.js','utf8'),dataContext);
const products=dataContext.window.MOVEVI_PRODUCTS;
assert.equal(new Set(products.map(p=>p.id)).size,products.length,'Unique product identifiers');
for(const product of products){
  assert(product.name&&product.specs.length&&product.highlights.length,'Complete product details');
  assert.equal(new Set(product.specs.map(s=>s.label)).size,product.specs.length,'Unique parameter labels');
  for(const photo of product.gallery)await access(`dist/${photo.src}`);
  await access(`dist/${product.image}`);
  for(const spec of product.specs)assert(spec.value&&spec.source,'Source-backed parameter values');
}
console.log(`Passed: local assets, anchors, unique IDs, page semantics, ${products.length} products and all gallery assets.`);
