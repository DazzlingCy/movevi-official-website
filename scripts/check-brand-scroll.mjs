import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const code=await readFile('dist/brand-scroll.js','utf8');
class Node {
 constructor(){this.events={};this.classes=new Set();this.classList={contains:k=>this.classes.has(k),remove:k=>this.classes.delete(k),toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k)};this.vars={};this.style={setProperty:(k,v)=>this.vars[k]=v,removeProperty:k=>delete this.vars[k]};}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
 fire(k,event={}){for(const fn of this.events[k]||[])fn(event);}
 contains(node){return !!node?.inside;}
}
function setup({reduced=false,desktop=true,top=0,oneScreen=false,photoWall=false,problem=false}={}){
 const section=new Node(),root=new Node(),doc=new Node(),win=new Node(),screen=new Node(),preference=new Node();
 doc.body=new Node();if(oneScreen)doc.body.classes.add("screens-v40");
 screen.matches=desktop;preference.matches=reduced;doc.documentElement=root;doc.hidden=false;doc.querySelector=()=>section;
 const nodes=Object.fromEntries(['.problem-scene','.intro-layout','.intro-label','#brand-title','.intro-city-main','.intro-description','.intro-city-small','.intro-bottom','.intro-ambition'].map(key=>[key,new Node()]));
 section.querySelector=key=>key==='.problem-scene'&&!problem?null:key==='.city-wall-scene'&&photoWall?new Node():nodes[key];section.getBoundingClientRect=()=>({top});
 let observer,id=0;const frames=new Map();
 vm.runInNewContext(code,{document:doc,matchMedia:q=>q.includes('prefers')?preference:screen,innerHeight:900,addEventListener:(...args)=>win.addEventListener(...args),
 requestAnimationFrame:cb=>{frames.set(++id,cb);return id;},cancelAnimationFrame:k=>frames.delete(k),
 IntersectionObserver:class{constructor(cb){observer=cb;}observe(){}},MutationObserver:class{constructor(){}observe(){}}});
 const flush=()=>{for(const [id,fn]of [...frames]){frames.delete(id);fn();}};
 return {section,nodes,doc,win,preference,flush,visible:on=>{observer([{isIntersecting:on}]);flush();},scroll:y=>{top=y;win.fire('scroll');flush();},value:key=>Number(nodes[key].vars['--brand-reveal']),frames};
}
{
 const s=setup();s.visible(true);assert.equal(s.value('#brand-title'),1);assert(s.value('.intro-city-main')>0&&s.value('.intro-city-main')<1);assert.equal(s.value('.intro-ambition'),0);
 s.scroll(-270);assert.equal(s.value('.intro-city-main'),1);assert(s.value('.intro-description')>s.value('.intro-city-small'));assert(s.value('.intro-city-small')>s.value('.intro-ambition'));
 s.scroll(-600);assert(Object.keys(s.nodes).filter(k=>!['.problem-scene','.intro-layout'].includes(k)).every(k=>s.value(k)===1),'Completed scroll reveals every item');
 s.scroll(0);assert.equal(s.value('.intro-ambition'),0,'Reverse scroll restores the sequence');
 s.section.fire('focusin');assert(Object.keys(s.nodes).filter(k=>!['.problem-scene','.intro-layout'].includes(k)).every(k=>s.value(k)===1),'Keyboard entry reveals hidden links');s.scroll(0);assert.equal(s.value('.intro-ambition'),1);s.section.fire('focusout',{relatedTarget:null});s.flush();assert.equal(s.value('.intro-ambition'),0);
 s.visible(false);s.scroll(-600);assert.equal(s.value('.intro-ambition'),0);s.visible(true);assert.equal(s.value('.intro-ambition'),1);
 s.doc.hidden=true;s.scroll(0);assert.equal(s.value('.intro-ambition'),1);s.doc.hidden=false;s.doc.fire('visibilitychange');s.flush();assert.equal(s.value('.intro-ambition'),0);
 s.preference.matches=true;s.preference.fire('change');assert(!s.section.classes.has('is-scroll-brand'));assert(Object.values(s.nodes).every(n=>n.vars['--brand-reveal']===undefined&&!n.classes.has('brand-reveal-hidden')));
}
for(const options of [{reduced:true},{desktop:false}]){const s=setup(options);assert(!s.section.classes.has('is-scroll-brand'));assert(Object.values(s.nodes).every(n=>n.vars['--brand-reveal']===undefined));}
console.log('Passed: ordered brand reveals, complete/reverse scroll, keyboard access, offscreen/background idle and reduced-motion/static fallback.');
{
 const s=setup({photoWall:true,problem:true});s.visible(true);
 assert.equal(s.section.vars['--question-out'],'0.0000');assert.equal(s.section.vars['--curiosity-in'],'0.0000');assert(s.nodes['.intro-layout'].inert);
 s.scroll(-585);assert(Number(s.section.vars['--question-out'])>0);assert(Number(s.section.vars['--curiosity-in'])>0&&Number(s.section.vars['--curiosity-in'])<1);
 s.scroll(-1215);assert.equal(s.section.vars['--curiosity-in'],'1.0000');assert.equal(s.value('#brand-title'),1);assert(!s.nodes['.intro-layout'].inert);assert(s.nodes['.problem-scene'].inert);
 s.scroll(0);assert.equal(s.section.vars['--curiosity-in'],'0.0000');assert(!s.nodes['.problem-scene'].inert);
 s.preference.matches=true;s.preference.fire('change');assert(!s.nodes['.problem-scene'].inert&&!s.nodes['.intro-layout'].inert);assert.equal(s.section.vars['--curiosity-in'],undefined);
}
{const s=setup({photoWall:true});s.visible(true);assert(Object.keys(s.nodes).filter(k=>!['.problem-scene','.intro-layout'].includes(k)).every(k=>s.value(k)===1),'Photo-wall scene is fully readable at its anchor');s.scroll(500);assert(s.value('.intro-description')<1);s.scroll(0);assert.equal(s.value('.intro-description'),1);}

{const s=setup({oneScreen:true});s.visible(true);assert.equal(s.value('#brand-title'),1);assert(s.value('.intro-city-main')<1,'City reveal continues after the scene reaches the viewport');assert.equal(s.value('.intro-ambition'),0);s.scroll(-600);assert(Object.keys(s.nodes).filter(k=>!['.problem-scene','.intro-layout'].includes(k)).every(k=>s.value(k)===1),'Scroll completes all content within the pinned scene');s.scroll(0);assert.equal(s.value('.intro-ambition'),0,'Reverse scrolling restores the earlier state');}
