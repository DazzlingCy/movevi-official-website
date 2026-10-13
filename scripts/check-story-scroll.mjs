import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const code=await readFile('dist/story-scroll.js','utf8');
class Node {
 constructor(){this.events={};this.classes=new Set();this.classList={contains:k=>this.classes.has(k),toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k)};this.vars={};this.style={setProperty:(k,v)=>this.vars[k]=v,removeProperty:k=>delete this.vars[k]};}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
 dispatchEvent(e){for(const fn of this.events[e.type]||[])fn(e);}
 fire(k){this.dispatchEvent({type:k});}
}
function setup({reduced=false,desktop=true,top=0}={}){
 const section=new Node(),motivation=new Node(),root=new Node(),doc=new Node(),win=new Node(),screen=new Node(),preference=new Node();
 screen.matches=desktop;preference.matches=reduced;doc.documentElement=root;doc.hidden=false;
 let box={top,height:1710},observer,mutation,id=0;const frames=new Map(),phases=[];
 section.getBoundingClientRect=()=>box;doc.querySelector=q=>q==='#story'?section:motivation;
 motivation.addEventListener('movevi:story-phase',e=>phases.push(e.detail.index));
 vm.runInNewContext(code,{document:doc,matchMedia:q=>q.includes('prefers')?preference:screen,innerHeight:900,
 addEventListener:(...args)=>win.addEventListener(...args),requestAnimationFrame:cb=>{frames.set(++id,cb);return id;},cancelAnimationFrame:k=>frames.delete(k),
 CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}},
 IntersectionObserver:class{constructor(cb){observer=cb;}observe(){}},MutationObserver:class{constructor(cb){mutation=cb;}observe(){}}});
 const flush=()=>{for(const [id,fn] of [...frames]){frames.delete(id);fn();}};
 return {section,root,doc,win,screen,preference,phases,frames,mutation,flush,visible:on=>{observer([{isIntersecting:on}]);flush();},scroll:top=>{box.top=top;win.fire('scroll');flush();}};
}
{
 const s=setup();assert.deepEqual(s.phases,[0]);s.visible(true);s.scroll(-300);assert.deepEqual(s.phases,[0]);s.scroll(-400);assert.deepEqual(s.phases,[0,1]);s.scroll(-600);assert.deepEqual(s.phases,[0,1],'No repeated panel reset while staying in a phase');s.scroll(-200);assert.deepEqual(s.phases,[0,1,0]);
 s.visible(false);s.scroll(-700);assert.equal(s.phases.at(-1),0,'Offscreen stays idle');s.visible(true);assert.equal(s.phases.at(-1),1,'Re-entering reconciles the scroll position');
 s.doc.hidden=true;s.scroll(0);assert.equal(s.phases.at(-1),1);s.doc.hidden=false;s.doc.fire('visibilitychange');s.flush();assert.equal(s.phases.at(-1),0);
 s.preference.matches=true;s.preference.fire('change');assert(!s.section.classes.has('is-scroll-story'));assert.equal(s.section.vars['--story-progress'],undefined);
 s.preference.matches=false;s.preference.fire('change');assert(s.section.classes.has('is-scroll-story'));
}
for(const options of [{reduced:true},{desktop:false}]){const s=setup(options);assert.equal(s.phases.length,0);assert(!s.section.classes.has('is-scroll-story'));}
{const s=setup({top:-700});assert.deepEqual(s.phases,[1],'Restored deep scroll immediately selects exploration');}
console.log('Passed: story scroll thresholds, reverse scrolling, no repeated resets, offscreen/background idle, restored positions and reduced-motion fallback.');
