import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const code=await readFile('dist/voyage.js','utf8');
class Node{
 constructor(){this.events={};this.classes=new Set();this.vars={};this.dataset={};this.children=[];
  this.classList={contains:k=>this.classes.has(k),add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k)};
  this.style={setProperty:(k,v)=>this.vars[k]=v,getPropertyValue:k=>this.vars[k]||'',removeProperty:k=>delete this.vars[k]};}
 addEventListener(k,f){(this.events[k]??=[]).push(f);}
 dispatchEvent(e){for(const f of this.events[e.type]||[])f(e);}
 fire(k){this.dispatchEvent({type:k});}
 append(n){this.children.push(n);}
 setAttribute(){}
 removeAttribute(k){if(k==='style')this.vars={};}
}
function setup({desktop=true,reduced=false,top=0,oneScreen=false,merged=false}={}){
 const root=new Node(),doc=new Node(),win=new Node(),screen=new Node(),pref=new Node(),hero=new Node(),solution=new Node(),stage=new Node(),windowNode=new Node(),source=new Node(),atlas=new Node(),body=new Node();
 const stops=[new Node(),new Node(),new Node()];
 const wall=new Node();if(merged)solution.classes.add('solution-merged');
 let box={top,height:2160},io,mutation,id=0;
 const frames=new Map(),media=[];
 if(oneScreen)body.classes.add("screens-v40");
 doc.documentElement=root;doc.body=body;doc.hidden=false;screen.matches=desktop;pref.matches=reduced;
 hero.getBoundingClientRect=()=>({top:-900,height:900});solution.getBoundingClientRect=()=>box;
 stage.getBoundingClientRect=()=>({width:1160,height:500});
 windowNode.getBoundingClientRect=()=>({top:330+Math.max(0,box.top),left:330,width:760,height:420});
 source.getBoundingClientRect=()=>({top:box.top-170,left:900,width:260,height:160});
 atlas.getBoundingClientRect=()=>({top:11000});
 solution.querySelector=()=>stage;solution.querySelectorAll=()=>stops;stage.querySelector=q=>q==='.solution-city-wall'?wall:windowNode;
 const nodes={'#vision':hero,'#solution':solution,'#curiosity .intro-city-small':source,'#world':atlas};
 doc.querySelector=q=>nodes[q];doc.querySelectorAll=()=>[];doc.createElement=()=>new Node();
 doc.addEventListener('movevi:portal-visibility',e=>media.push(e.detail.occluded));
 vm.runInNewContext(code,{document:doc,innerHeight:900,matchMedia:q=>q.includes('prefers')?pref:screen,
  addEventListener:(...a)=>win.addEventListener(...a),requestAnimationFrame:f=>{frames.set(++id,f);return id;},cancelAnimationFrame:id=>frames.delete(id),
  CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}},
  IntersectionObserver:class{constructor(f){io=f;}observe(){}},MutationObserver:class{constructor(f){mutation=f;}observe(){}}});
 const flush=()=>{for(const [id,f] of [...frames]){frames.delete(id);f();}};
 const visible=on=>{io([hero,solution,atlas].map(target=>({target,isIntersecting:on})));flush();};
 return{root,doc,win,screen,pref,solution,stage,source,wall,windowNode,ghost:body.children[0],media,frames,flush,visible,scroll:top=>{box.top=top;win.fire('scroll');flush();}};
}
{
 const s=setup();s.visible(true);assert.equal(s.solution.dataset.voyagePhase,'city');
 s.scroll(-756);assert.equal(s.solution.dataset.voyagePhase,'route');assert.equal(s.stage.vars['--route-opacity'],'1.0000');assert.equal(s.media.at(-1),true,'Covered city video pauses');
 s.scroll(-1190);assert.equal(s.solution.dataset.voyagePhase,'hardware');assert.equal(s.stage.vars['--hardware-opacity'],'1.0000');
 s.scroll(-250);assert.equal(s.solution.dataset.voyagePhase,'city');assert.equal(s.media.at(-1),false,'Reversing restores city playback eligibility');
 s.scroll(250);assert.equal(s.ghost.hidden,false);assert(s.source.classes.has('voyage-in-transit'));assert(s.windowNode.classes.has('voyage-in-transit'));
 assert.equal(s.solution.vars['--handoff-copy'],'0.0000','Traveling city cannot obscure visible heading');
 s.scroll(0);assert.equal(s.ghost.hidden,true);assert(!s.windowNode.classes.has('voyage-in-transit'));
 assert.equal(s.solution.vars['--handoff-copy'],'1.0000','Heading is readable once city lands');
 s.visible(false);const previous=s.solution.dataset.voyagePhase;s.scroll(-1000);assert.equal(s.solution.dataset.voyagePhase,previous,'Offscreen is idle');
 s.visible(true);assert.equal(s.solution.dataset.voyagePhase,'hardware','Restored position reconciles');
 s.doc.hidden=true;s.scroll(0);assert.equal(s.frames.size,0);assert.equal(s.solution.dataset.voyagePhase,'hardware');
 s.doc.hidden=false;s.doc.fire('visibilitychange');s.flush();assert.equal(s.solution.dataset.voyagePhase,'city');
 s.scroll(300);s.pref.matches=true;s.pref.fire('change');assert(!s.solution.classes.has('is-voyage'));assert.equal(s.ghost.hidden,true);assert(!s.source.classes.has('voyage-in-transit'));assert.equal(s.stage.vars['--window-width'],undefined);
 s.pref.matches=false;s.pref.fire('change');s.flush();assert(s.solution.classes.has('is-voyage'));
 s.win.fire('pagehide');s.scroll(-1000);assert.equal(s.frames.size,0);s.win.fire('pageshow');s.flush();assert.equal(s.solution.dataset.voyagePhase,'hardware');
}
for(const options of [{desktop:false},{reduced:true}]){const s=setup(options);s.visible(true);assert(!s.solution.classes.has('is-voyage'));assert.equal(s.frames.size,0);assert.equal(s.ghost.hidden,true);}
console.log('Passed: reversible city/App/hardware timeline, cross-section handoff, covered-video signal, offscreen/background idle, restored scroll and static fallbacks.');

{
 const s=setup({merged:true});s.visible(true);
 assert.equal(s.solution.dataset.voyagePhase,'wall');assert.equal(s.media.at(-1),true);
 s.scroll(-200);assert(+s.stage.vars['--wall-mix']>0&&+s.stage.vars['--wall-mix']<1);
 s.scroll(-400);assert.equal(s.solution.dataset.voyagePhase,'city');assert(s.wall.inert);assert.equal(s.media.at(-1),false);
 s.scroll(-900);assert.equal(s.solution.dataset.voyagePhase,'route');
 s.scroll(-1190);assert.equal(s.solution.dataset.voyagePhase,'hardware');
 s.scroll(0);assert.equal(s.solution.dataset.voyagePhase,'wall');assert.equal(s.wall.inert,false);
 s.scroll(-400);s.pref.matches=true;s.pref.fire('change');assert.equal(s.wall.inert,false);assert.equal(s.stage.vars['--wall-mix'],undefined);
}

{const s=setup({oneScreen:true});s.visible(true);assert(s.solution.classes.has('is-voyage'),'Viewport-sized scenes still enable the scroll story');assert.equal(s.solution.dataset.voyagePhase,'city');s.scroll(-756);assert.equal(s.solution.dataset.voyagePhase,'route');assert.equal(s.stage.vars['--route-opacity'],'1.0000');s.scroll(-1190);assert.equal(s.solution.dataset.voyagePhase,'hardware');s.scroll(0);assert.equal(s.solution.dataset.voyagePhase,'city');assert.equal(s.stage.vars['--hardware-opacity'],'0.0000');}
