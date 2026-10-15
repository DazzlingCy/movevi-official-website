import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
class Node{
 constructor(){this.vars={};this.classes=new Set();this.children=[];this.events={};this.classList={contains:k=>this.classes.has(k),add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};this.style={setProperty:(k,v)=>this.vars[k]=v,removeProperty:k=>delete this.vars[k]};}
 append(...nodes){this.children.push(...nodes)}setAttribute(){}cloneNode(){return new Node()}
 addEventListener(k,f){(this.events[k]??=[]).push(f)}fire(k){for(const f of this.events[k]||[])f()}
}
for(const problemMode of [false,true]){
const problem=new Node();
const doc=new Node(),root=new Node(),body=new Node(),win=new Node(),hero=new Node(),brand=new Node(),source=new Node(),target=new Node(),wall=new Node(),desktop=new Node(),reduced=new Node();
doc.documentElement=root;doc.body=body;doc.hidden=false;desktop.matches=true;reduced.matches=false;
let y=0,id=0;const frames=new Map();
doc.querySelector=s=>s==='#vision'?hero:brand;doc.createElement=()=>new Node();hero.querySelector=()=>source;brand.querySelector=s=>s==='.problem-scene'?(problemMode?problem:null):target;problem.querySelector=()=>target;source.querySelector=()=>new Node();target.querySelector=s=>s==='.city-photo-wall'?(problemMode?null:wall):s==='figcaption'&&problemMode?null:new Node();
hero.getBoundingClientRect=()=>({top:-y});brand.getBoundingClientRect=()=>({top:900-y});source.getBoundingClientRect=()=>({top:100-y,left:700,width:230,height:140});target.getBoundingClientRect=()=>({top:984-y,left:600,width:600,height:788});
vm.runInNewContext(await readFile('dist/opening-transition.js','utf8'),{document:doc,innerHeight:900,matchMedia:s=>s.includes('prefers')?reduced:desktop,getComputedStyle:()=>({borderRadius:'28px'}),addEventListener:(...a)=>win.addEventListener(...a),requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:i=>frames.delete(i),MutationObserver:class{observe(){}}});
const flush=()=>{for(const[i,f]of [...frames]){frames.delete(i);f()}};const scroll=v=>{y=v;win.fire('scroll');flush()};flush();
const bridge=body.children[0];assert.equal(bridge.children.length,problemMode?3:4,'Bridge includes original photo, photo wall and two captions');assert(bridge.hidden);
scroll(450);assert(!bridge.hidden);assert(source.classes.has('opening-in-transit'));assert(target.classes.has('opening-in-transit'));assert(Number(bridge.vars['--wall-open'])>0&&Number(bridge.vars['--wall-open'])<1);assert.equal(bridge.vars['--wall-surface'],'1.0000','Photos are opaque before the spread finishes');const midpoint={...bridge.vars};
scroll(900);assert(bridge.hidden);assert(!target.classes.has('opening-in-transit'));assert.equal(target.vars['--wall-exit'],'0.0000');scroll(1200);assert(Number(target.vars['--wall-exit'])>0);scroll(450);assert.deepEqual(bridge.vars,midpoint,'Reverse scroll restores the exact wall composition');
reduced.matches=true;reduced.fire('change');assert(bridge.hidden);assert.equal(target.vars['--wall-exit'],undefined);reduced.matches=false;desktop.matches=false;desktop.fire('change');assert(bridge.hidden);assert(!root.classes.has('opening-flow'));
desktop.matches=true;desktop.fire('change');flush();doc.hidden=true;doc.fire('visibilitychange');scroll(300);assert.equal(frames.size,0);doc.hidden=false;doc.fire('visibilitychange');flush();win.fire('pagehide');assert(bridge.hidden);win.fire('pageshow');flush();assert(!bridge.hidden);
console.log('Passed: single photo to opaque mosaic, reversible spread, settled scene, exit, reduced motion, mobile and lifecycle.');

}