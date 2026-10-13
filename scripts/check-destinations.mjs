import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const code=await readFile('dist/destinations.js','utf8');
class Node{
 constructor(){this.events={};this.attrs={};this.dataset={};this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x),toggle:(x,on)=>on?this.classes.add(x):this.classes.delete(x)};this.style={setProperty:(k,v)=>this.attrs[k]=v,removeProperty:k=>delete this.attrs[k]};this.paused=true;this.playCalls=0;}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
 fire(k,event={}){for(const fn of this.events[k]||[])fn(event);}
 setAttribute(k,v){this.attrs[k]=v;}
 getAttribute(k){return k==='src'?this.src:this.attrs[k];}
 closest(){return null;}
 pause(){this.paused=true;}
 play(){this.playCalls++;if(this.rejectPlay)return Promise.reject({name:'NotAllowedError'});this.paused=false;return Promise.resolve();}
 setPointerCapture(id){this.capture=id;}
 hasPointerCapture(id){return this.capture===id;}
 releasePointerCapture(){this.capture=null;}
}
const flush=()=>new Promise(r=>setImmediate(r));
function setup({reduced=false,saveData=false,reject=false}={}){
 const doc=new Node(),root=new Node(),section=new Node(),deck=new Node(),viewport=new Node(),count=new Node(),prev=new Node(),next=new Node(),preference=new Node(),connection=new Node();
 const cards=[new Node(),new Node(),new Node()],videos=cards.map(()=>new Node()),selects=cards.map(()=>new Node()),toggles=cards.map(()=>new Node()),choices=cards.map(()=>new Node());
 cards.forEach((c,i)=>{c.dataset.cityMedia=String(i);c.attrs['aria-label']=['纽约','巴黎','伦敦'][i];c.querySelector=q=>({'video':videos[i],'.destination-video-toggle':toggles[i],'.destination-select':selects[i]}[q]);});
 deck.querySelector=q=>({'.destination-viewport':viewport,'#destination-count':count,'[data-city-prev]':prev,'[data-city-next]':next}[q]);
 deck.querySelectorAll=q=>q==='[data-city-card]'?cards:choices;section.querySelector=()=>deck;
 doc.querySelector=()=>section;doc.documentElement=root;doc.hidden=false;preference.matches=reduced;connection.saveData=saveData;videos[0].rejectPlay=reject;
 let intersection,mutation;
 vm.runInNewContext(code,{document:doc,navigator:{connection},window:{MOVEVI_MEDIA:{0:{src:'nyc.mp4'},1:{src:'paris.mp4'},2:{src:'london.mp4'}}},matchMedia:()=>preference,Date,IntersectionObserver:class{constructor(cb){intersection=cb;}observe(){}},MutationObserver:class{constructor(cb){mutation=cb;}observe(){}}});
 return {doc,root,section,deck,viewport,count,prev,next,cards,videos,selects,toggles,choices,visible:on=>intersection([{isIntersecting:on}]),reduce(on){root.classList.toggle('reduce-motion',on);mutation();}};
}
const s=setup();assert(s.videos.every(v=>!v.src));s.visible(true);await flush();assert(!s.videos[0].paused);assert(!s.videos[1].src);
s.next.fire('click');await flush();assert(s.videos[0].paused&&!s.videos[1].paused);assert.equal(s.count.textContent,'02 / 03');
const down={pointerId:1,button:0,clientX:800,clientY:400,target:new Node()};
s.viewport.fire('pointerdown',down);s.viewport.fire('pointermove',{...down,clientX:500});s.viewport.fire('pointerup',down);await flush();assert.equal(s.count.textContent,'03 / 03');assert.equal(s.videos.filter(v=>!v.paused).length,1);
s.next.fire('click');await flush();assert.equal(s.count.textContent,'01 / 03','Selection wraps');
s.viewport.fire('pointerdown',down);s.viewport.fire('pointermove',{...down,clientX:500});s.viewport.fire('pointercancel',down);assert.equal(s.count.textContent,'01 / 03','Cancelled drag does not select');
s.viewport.fire('pointerdown',down);s.viewport.fire('pointermove',{...down,clientY:500});s.viewport.fire('pointerup',down);assert.equal(s.count.textContent,'01 / 03','Vertical page scrolling preserved');
s.toggles[0].fire('click');s.next.fire('click');await flush();assert(s.videos.every(v=>v.paused),'Manual pause persists across selection');s.toggles[1].fire('click');await flush();assert(!s.videos[1].paused);
s.doc.hidden=true;s.doc.fire('visibilitychange');assert(s.videos.every(v=>v.paused));s.doc.hidden=false;s.doc.fire('visibilitychange');await flush();assert(!s.videos[1].paused);
s.visible(false);assert(s.videos.every(v=>v.paused));s.visible(true);s.reduce(true);assert(s.videos.every(v=>v.paused));s.prev.fire('click');assert.equal(s.count.textContent,'01 / 03');s.reduce(false);await flush();assert(!s.videos[0].paused);
for(const options of [{reduced:true},{saveData:true}]){const q=setup(options);q.visible(true);await flush();assert(q.videos.every(v=>!v.src));q.next.fire('click');assert.equal(q.count.textContent,'02 / 03');if(options.saveData){q.toggles[1].fire('click');await flush();assert(!q.videos[1].paused);}}
const blocked=setup({reject:true});blocked.visible(true);await flush();assert(blocked.videos[0].paused);assert(!blocked.videos[0].classes.has('is-playing'));const calls=blocked.videos[0].playCalls;blocked.visible(false);blocked.visible(true);await flush();assert.equal(blocked.videos[0].playCalls,calls);blocked.videos[0].rejectPlay=false;blocked.toggles[0].fire('click');await flush();assert(!blocked.videos[0].paused);
console.log('Passed: city cards, active-only media, dragging/cancellation, vertical scroll, wraparound, pause persistence, background/offscreen, reduced motion, save-data and autoplay recovery.');
