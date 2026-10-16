import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
class Node {
 constructor(){this.vars={};this.events={};this.children=[];this.hidden=false;this.classes=new Set();this.classList={contains:k=>this.classes.has(k),add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};this.style={setProperty:(k,v)=>this.vars[k]=v,removeProperty:k=>delete this.vars[k]};}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn)}
 fire(k){for(const fn of this.events[k]||[])fn()}
 append(...nodes){this.children.push(...nodes)}
 cloneNode(){return new Node()}
 setAttribute(){}
}
const code=await readFile('dist/system-transition.js','utf8');
const root=new Node(),solution=new Node(),system=new Node(),source=new Node(),target=new Node(),doc=new Node(),win=new Node(),desktop=new Node(),reduced=new Node();
desktop.matches=true;reduced.matches=false;doc.documentElement=root;doc.body=new Node();doc.hidden=false;
let top=900;const frames=new Map();let id=0;
source.querySelector=target.querySelector=()=>new Node();
solution.querySelector=s=>s==='.voyage-window'?source:{getBoundingClientRect:()=>({top:top-900})};system.querySelector=s=>{assert.equal(s,'[data-system-route]','Handoff must target the leftmost global-routes image');return target};
doc.querySelector=s=>s==='#solution'?solution:system;doc.createElement=()=>new Node();
system.getBoundingClientRect=()=>({top});source.getBoundingClientRect=()=>({left:900,top:300+top-900,width:240,height:520});target.getBoundingClientRect=()=>({left:120,top:top+240,width:480,height:430});
vm.runInNewContext(code,{document:doc,matchMedia:s=>s.includes('prefers')?reduced:desktop,innerHeight:900,getComputedStyle:()=>({borderRadius:'28px'}),addEventListener:(...args)=>win.addEventListener(...args),MutationObserver:class{observe(){}},requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:id=>frames.delete(id)});
const flush=()=>{for(const [id,fn]of [...frames]){frames.delete(id);fn()}};
const scroll=value=>{top=value;win.fire('scroll');flush()};
flush();const bridge=doc.body.children[0];assert(bridge.hidden,'Before departure the real App remains visible');
scroll(450);assert(!bridge.hidden);assert(source.classes.has('system-in-transit'));assert(target.classes.has('system-in-transit'));
assert.equal(bridge.style.top,'270px','The image remains inside the viewport, independent of departing sticky offset');
assert.equal(bridge.style.left,'510px','The image travels left toward global routes');assert.equal(bridge.style.width,'360px');const midpoint={...bridge.style};
scroll(0);assert(bridge.hidden);assert(!source.classes.has('system-in-transit'));assert(!target.classes.has('system-in-transit'));assert.equal(system.vars['--system-card-three'],'1.0000');assert.equal(system.vars['--system-card-four'],'1.0000','AI card finishes its staggered entrance');
scroll(.03125);assert(bridge.hidden,'Fractional anchor rounding must still complete the handoff');
scroll(450);assert.equal(bridge.style.top,midpoint.top);assert.equal(bridge.style.width,midpoint.width,'Reverse travel reproduces the same geometry');
reduced.matches=true;reduced.fire('change');assert(bridge.hidden);assert(!root.classes.has('system-flow'));assert.equal(system.vars['--system-card-three'],undefined);assert.equal(system.vars['--system-card-four'],undefined);
reduced.matches=false;reduced.fire('change');flush();assert(!bridge.hidden);
desktop.matches=false;desktop.fire('change');assert(bridge.hidden);assert(!root.classes.has('system-flow'));
desktop.matches=true;desktop.fire('change');flush();doc.hidden=true;doc.fire('visibilitychange');scroll(0);assert.equal(frames.size,0,'No animation frames while hidden');doc.hidden=false;doc.fire('visibilitychange');flush();assert(bridge.hidden);
win.fire('pagehide');scroll(450);assert(bridge.hidden);win.fire('pageshow');flush();assert(!bridge.hidden);
console.log('Passed: solution/system forward and reverse geometry, completed card handoff, reduced motion, mobile fallback, background idle and page restoration.');
