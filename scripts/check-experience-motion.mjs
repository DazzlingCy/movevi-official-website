import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
class Node{
 constructor(){this.vars={};this.events={};this.classes=new Set();this.classList={contains:k=>this.classes.has(k),toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};this.style={setProperty:(k,v)=>this.vars[k]=v,removeProperty:k=>delete this.vars[k]};}
 addEventListener(k,f){(this.events[k]??=[]).push(f)}fire(k){for(const f of this.events[k]||[])f()}
}
const scene=new Node(),principles=new Node(),root=new Node(),doc=new Node(),win=new Node(),desktop=new Node(),reduced=new Node();
desktop.matches=true;reduced.matches=false;doc.hidden=false;doc.documentElement=root;
const nodes=Array.from({length:5},()=>new Node()),selectors=['.comparison-heading','.comparison-watch','.comparison-movevi','.comparison-reasons','.comparison-note'];
let top=900,id=0;const frames=new Map();
scene.querySelector=s=>nodes[selectors.indexOf(s)];scene.getBoundingClientRect=()=>({top});doc.querySelector=s=>s==='#experience'?scene:principles;
nodes.forEach((node,i)=>node.getBoundingClientRect=()=>({top:top+i*150+(parseFloat(node.vars['--experience-y'])||0),height:130}));
vm.runInNewContext(await readFile('dist/experience-motion.js','utf8'),{document:doc,innerHeight:900,matchMedia:s=>s.includes('prefers')?reduced:desktop,addEventListener:(...a)=>win.addEventListener(...a),requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:i=>frames.delete(i),MutationObserver:class{observe(){}}});
const flush=()=>{for(const[i,f]of [...frames]){frames.delete(i);f()}};
const scroll=t=>{top=t;win.fire('scroll');flush()};
flush();assert.equal(nodes[0].vars['--experience-opacity'],'0.0000');
assert.equal(principles.vars['--comparison-handoff'],'0.0000','Concept cards remain intact before leaving their screen');
scroll(450);assert(parseFloat(nodes[1].vars['--experience-x'])<0);assert(parseFloat(nodes[2].vars['--experience-x'])>0);const entering=nodes.map(n=>({...n.vars}));
const handoff={...principles.vars};assert(Number(handoff['--comparison-handoff'])>0&&Number(handoff['--comparison-handoff'])<1,'Source cards close while comparison enters');
scroll(0);nodes.forEach(n=>{assert.equal(n.vars['--experience-opacity'],'1.0000');assert.equal(n.vars['--experience-y'],'0.00px')});
assert.equal(principles.vars['--comparison-handoff'],'1.0000');
scroll(-450);assert(parseFloat(nodes[1].vars['--experience-opacity'])<1);assert(parseFloat(nodes[1].vars['--experience-x'])>0);assert(parseFloat(nodes[2].vars['--experience-x'])<0);
scroll(450);assert.deepEqual(nodes.map(n=>n.vars),entering,'Reverse scroll restores the exact entrance state');
assert.deepEqual(principles.vars,handoff,'Source and destination reverse together');
desktop.matches=false;desktop.fire('change');scroll(0);const mobile=nodes.map(n=>({...n.vars}));scroll(0);assert.deepEqual(nodes.map(n=>n.vars),mobile,'Mobile geometry does not drift from its own transform');nodes.forEach(n=>assert.equal(n.vars['--experience-x'],'0.00px'));
reduced.matches=true;reduced.fire('change');assert(!scene.classes.has('experience-scroll-motion'));nodes.forEach(n=>assert.deepEqual(n.vars,{}));
assert(!principles.classes.has('comparison-handoff'));assert.deepEqual(principles.vars,{});
reduced.matches=false;reduced.fire('change');flush();doc.hidden=true;doc.fire('visibilitychange');scroll(200);assert.equal(frames.size,0);doc.hidden=false;doc.fire('visibilitychange');flush();
win.fire('pagehide');scroll(0);assert.equal(frames.size,0);win.fire('pageshow');flush();assert(scene.classes.has('experience-scroll-motion'));
console.log('Passed: staggered entrance, readable settled scene, inward exit, reverse scroll, mobile stability, reduced motion and background lifecycle.');
