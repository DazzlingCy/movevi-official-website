import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
class Node {
 constructor(){this.vars={};this.events={};this.children=[];this.hidden=false;this.classes=new Set();this.classList={contains:k=>this.classes.has(k),add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};this.style={setProperty:(k,v)=>this.vars[k]=v,removeProperty:k=>delete this.vars[k]};}
 addEventListener(k,f){(this.events[k]??=[]).push(f)}fire(k){for(const f of this.events[k]||[])f()}
 append(...nodes){this.children.push(...nodes)}cloneNode(){const n=new Node(),tracks=[new Node(),new Node()];n.querySelectorAll=()=>tracks;return n}setAttribute(){}
}
const root=new Node(),question=new Node(),solution=new Node(),source=new Node(),target=new Node(),wall=new Node(),doc=new Node(),win=new Node(),desktop=new Node(),reduced=new Node();
desktop.matches=true;reduced.matches=false;doc.documentElement=root;doc.body=new Node();doc.hidden=false;
let top=900,id=0;const frames=new Map();
question.querySelector=()=>source;solution.querySelector=()=>target;source.querySelector=()=>new Node();target.querySelector=s=>s==='.city-photo-wall'?wall:new Node();target.querySelectorAll=()=>[new Node(),new Node()];
question.getBoundingClientRect=()=>({top:top-900});solution.getBoundingClientRect=()=>({top});source.getBoundingClientRect=()=>({top:250+top-900,left:760,width:580,height:490});target.getBoundingClientRect=()=>({top:320+Math.max(0,top),left:120,width:1220,height:450});
doc.querySelector=s=>s==='#brand'?question:solution;doc.createElement=()=>new Node();
vm.runInNewContext(await readFile('dist/question-transition.js','utf8'),{document:doc,innerHeight:900,matchMedia:s=>s.includes('prefers')?reduced:desktop,getComputedStyle:()=>({transform:'matrix(1, 0, 0, 1, -42, 0)'}),addEventListener:(...a)=>win.addEventListener(...a),MutationObserver:class{observe(){}},requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:i=>frames.delete(i)});
const flush=()=>{for(const [i,f] of [...frames]){frames.delete(i);f()}};
const scroll=t=>{top=t;win.fire('scroll');flush()};flush();const bridge=doc.body.children[0];
assert(bridge.hidden);scroll(450);assert(!bridge.hidden);assert(source.classes.has('question-in-transit'));assert(target.classes.has('question-in-transit'));
assert.equal(bridge.style.top,'285px');assert.equal(bridge.style.width,'900px');assert.equal(bridge.children[0].querySelectorAll()[0].style.transform,'matrix(1, 0, 0, 1, -42, 0)','The cloned wall preserves the visible track phase');
assert(Number(bridge.vars['--question-mosaic'])>0&&Number(bridge.vars['--question-mosaic'])<1);const middle={...bridge.style};
scroll(0);assert(bridge.hidden);assert(!target.classes.has('question-in-transit'));assert(!solution.classes.has('question-arriving'));
scroll(450);assert.deepEqual(bridge.style,middle,'Reverse scroll must retrace the same geometry');
scroll(899.9);assert(bridge.hidden,'Fractional boundary leaves no ghost');
scroll(450);reduced.matches=true;reduced.fire('change');assert(bridge.hidden);assert(!target.classes.has('question-in-transit'));assert.equal(question.vars['--question-leave'],undefined);
reduced.matches=false;reduced.fire('change');flush();assert(!bridge.hidden);
desktop.matches=false;desktop.fire('change');assert(bridge.hidden);assert(!solution.classes.has('question-arriving'));
desktop.matches=true;desktop.fire('change');flush();doc.hidden=true;doc.fire('visibilitychange');scroll(0);assert.equal(frames.size,0);doc.hidden=false;doc.fire('visibilitychange');flush();assert(bridge.hidden);
win.fire('pagehide');scroll(450);assert(bridge.hidden);win.fire('pageshow');flush();assert(!bridge.hidden);
console.log('Passed: question/photo-wall shared geometry, reverse scroll, exact handoff, mobile/reduced motion and page lifecycle.');
