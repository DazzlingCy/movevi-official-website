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
 getBoundingClientRect(){return {width:400};}
 closest(){return null;}
 pause(){this.paused=true;}
 play(){this.playCalls++;if(this.rejectPlay)return Promise.reject({name:'NotAllowedError'});this.paused=false;return Promise.resolve();}
 setPointerCapture(id){this.capture=id;}
 hasPointerCapture(id){return this.capture===id;}
 releasePointerCapture(){this.capture=null;}
}
const flush=()=>new Promise(r=>setImmediate(r));
function setup({reduced=false,saveData=false,reject=false,noControls=false,mixed=false}={}){
 const doc=new Node(),root=new Node(),section=new Node(),deck=new Node(),viewport=new Node(),count=new Node(),prev=new Node(),next=new Node(),preference=new Node(),connection=new Node();
 const cards=Array.from({length:mixed?8:3},()=>new Node()),videos=cards.map((_,i)=>mixed&&i>=4?null:new Node()),selects=cards.map(()=>new Node()),toggles=cards.map(()=>new Node()),choices=cards.map(()=>new Node());
 cards.forEach((c,i)=>{c.dataset.cityMedia=String(i);c.attrs['aria-label']=['纽约','巴黎','伦敦'][i];c.querySelector=q=>({'video':videos[i],'.destination-video-toggle':noControls?null:toggles[i],'.destination-select':selects[i]}[q]);});
 deck.querySelector=q=>({'.destination-viewport':viewport,'#destination-count':noControls?null:count,'[data-city-prev]':noControls?null:prev,'[data-city-next]':noControls?null:next}[q]);
 deck.querySelectorAll=q=>q==='[data-city-card]'?cards:choices;section.querySelector=()=>deck;
 doc.querySelector=()=>section;doc.documentElement=root;doc.hidden=false;preference.matches=reduced;connection.saveData=saveData;videos[0].rejectPlay=reject;
 let intersection,mutation,timerId=0,clock=0; const timers=new Map();
 vm.runInNewContext(code,{document:doc,navigator:{connection},window:{MOVEVI_MEDIA:{0:{src:'nyc.mp4'},1:{src:'paris.mp4'},2:{src:'london.mp4'}}},matchMedia:()=>preference,Date,requestAnimationFrame:fn=>{timers.set(++timerId,fn);return timerId;},cancelAnimationFrame:id=>timers.delete(id),getComputedStyle:()=>({getPropertyValue:()=>'16'}),IntersectionObserver:class{constructor(cb){intersection=cb;}observe(){}},MutationObserver:class{constructor(cb){mutation=cb;}observe(){}}});
 return {timers,tick(n=1){for(let i=0;i<n;i++){clock+=20;const entry=[...timers.entries()][0];if(entry){timers.delete(entry[0]);entry[1](clock);}}},doc,root,section,deck,viewport,count,prev,next,cards,videos,selects,toggles,choices,visible:on=>intersection([{isIntersecting:on}]),reduce(on){root.classList.toggle('reduce-motion',on);mutation();}};
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

const minimal=setup({noControls:true});minimal.visible(true);await flush();minimal.choices[1].fire('click');await flush();assert(minimal.videos[0].paused&&!minimal.videos[1].paused);minimal.deck.fire('keydown',{key:'ArrowRight',preventDefault(){}});await flush();assert(!minimal.videos[2].paused);minimal.reduce(true);assert(minimal.videos.every(v=>v.paused));

const mixed=setup({mixed:true,noControls:true});mixed.visible(true);await flush();
const auto=setup();assert.equal(auto.timers.size,0);auto.visible(true);assert.equal(auto.timers.size,1);auto.tick(142);await flush();assert.equal(auto.count.textContent,'02 / 03','Visible deck advances automatically');
auto.section.fire('pointerenter',{pointerType:'mouse'});assert.equal(auto.timers.size,0);assert(auto.videos.every(v=>v.paused),'Hover pauses rotation and video');
const frozen=auto.viewport.attrs['--stream-offset'];auto.tick(40);assert.equal(auto.viewport.attrs['--stream-offset'],frozen,'Hover freezes the exact position');
auto.section.fire('pointerleave');await flush();assert.equal(auto.timers.size,1);assert(!auto.videos[1].paused,'Leaving hover resumes current video');
auto.tick();assert.equal(auto.viewport.attrs['--stream-offset'],frozen,'Resume does not jump');auto.tick();assert.notEqual(auto.viewport.attrs['--stream-offset'],frozen,'Resume continues immediately');
auto.doc.hidden=true;auto.doc.fire('visibilitychange');assert.equal(auto.timers.size,0);auto.doc.hidden=false;auto.doc.fire('visibilitychange');assert.equal(auto.timers.size,1);
auto.visible(false);assert.equal(auto.timers.size,0);auto.visible(true);auto.reduce(true);assert.equal(auto.timers.size,0);
mixed.choices[6].fire('click');await flush();assert(mixed.videos.filter(Boolean).every(v=>v.paused),'Photo cities pause all videos');assert(mixed.cards[6].classes.has('is-active'));assert(mixed.cards[2].inert,'Distant cards leave the focus order');
mixed.deck.fire('keydown',{key:'ArrowRight',preventDefault(){}});mixed.deck.fire('keydown',{key:'ArrowRight',preventDefault(){}});await flush();assert(mixed.cards[0].classes.has('is-active'),'Eight-city deck wraps');assert(!mixed.videos[0].paused,'Video resumes after leaving photo cities');
const seamless=setup({mixed:true});seamless.visible(true);seamless.tick(139);
const position=()=>Number(seamless.cards[1].attrs['--slot'])*416-parseFloat(seamless.viewport.attrs['--stream-offset']);
let previous=position();for(let i=0;i<6;i++){seamless.tick();const next=position();assert(Math.abs((previous-next)-416/140)<.01,'Constant velocity through the card boundary');previous=next;}
assert.equal(seamless.count.textContent,'02 / 08');assert.equal(seamless.timers.size,1,'Only one animation frame remains queued');
