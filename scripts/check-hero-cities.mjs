import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const code=await readFile('dist/hero-cities.js','utf8');
class Node {
 constructor(){this.events={};this.dataset={};this.attrs={};this.classes=new Set();this.classList={contains:x=>this.classes.has(x),add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),toggle:(x,on)=>on?this.classes.add(x):this.classes.delete(x)};this.paused=true;this.calls=0;}
 addEventListener(key,fn){(this.events[key]??=[]).push(fn);}
 fire(key){for(const fn of this.events[key]||[])fn();}
 setAttribute(key,value){this.attrs[key]=value;}
 getAttribute(key){return this[key]??this.attrs[key]??null;}
 pause(){this.paused=true;}
 play(){this.calls++;if(this.reject)return Promise.reject(new Error('autoplay blocked'));this.paused=false;return this.pending||Promise.resolve();}
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function setup(options={}){
 const stage=new Node(),doc=new Node(),root=new Node(),win=new Node(),preference=new Node(),desktop=new Node(),connection=new Node();
 preference.matches=!!options.reduced;desktop.matches=options.desktop!==false;connection.saveData=!!options.saveData;
 const slides=[new Node(),new Node()],videos=[new Node(),new Node()];
 slides.forEach((s,i)=>{s.dataset.heroCity=['paris','tokyo'][i];s.querySelector=()=>videos[i];});
 videos[0].reject=!!options.reject;
 let resolve;if(options.pending)videos[0].pending=new Promise(r=>resolve=r);
 stage.querySelectorAll=()=>slides;doc.querySelector=()=>stage;doc.documentElement=root;doc.hidden=false;
 win.MOVEVI_MEDIA={paris:{src:'paris.mp4',poster:'paris.webp'},tokyo:{src:'tokyo.mp4',poster:'tokyo.webp'}};
 let observer,mutation,next=0;const timers=new Map();
 vm.runInNewContext(code,{document:doc,window:win,navigator:{connection},matchMedia:q=>q.includes('prefers')?preference:desktop,
 IntersectionObserver:class{constructor(cb){observer=cb;}observe(){}},MutationObserver:class{constructor(cb){mutation=cb;}observe(){}},
 setTimeout:(cb,ms)=>{assert.equal(ms,12000);timers.set(++next,cb);return next;},clearTimeout:id=>timers.delete(id)});
 return {stage,slides,videos,doc,win,preference,desktop,connection,timers,resolve,visible:on=>observer([{isIntersecting:on}]),tick:()=>{const [id,cb]=timers.entries().next().value;timers.delete(id);cb();},mutation};
}
{
 const s=setup();assert(s.videos.every(v=>!v.src));s.visible(true);await flush();assert(!s.videos[0].paused);assert(!s.videos[1].src);assert.equal(s.timers.size,1);
 s.tick();await flush();assert(s.videos[0].paused);assert(!s.videos[1].paused);assert.equal(s.stage.dataset.city,'tokyo');
 s.visible(false);assert(s.videos.every(v=>v.paused));assert.equal(s.timers.size,0);
 s.visible(true);await flush();s.doc.hidden=true;s.doc.fire('visibilitychange');assert(s.videos.every(v=>v.paused));assert.equal(s.timers.size,0);
 s.doc.hidden=false;s.doc.fire('visibilitychange');await flush();assert(!s.videos[1].paused);
 s.win.fire('pagehide');assert(s.videos.every(v=>v.paused));assert.equal(s.timers.size,0);s.win.fire('pageshow');await flush();assert(!s.videos[1].paused);
 s.connection.saveData=true;s.connection.fire('change');assert(s.videos.every(v=>v.paused));assert.equal(s.timers.size,0);
}
for(const options of [{reduced:true},{saveData:true},{desktop:false}]){const s=setup(options);s.visible(true);await flush();assert(s.videos.every(v=>!v.src));assert.equal(s.timers.size,0);}
{
 const s=setup({reject:true});s.visible(true);await flush();assert.equal(s.stage.dataset.playback,'poster');assert(!s.videos[0].classes.has('is-playing'));s.visible(false);s.visible(true);await flush();assert.equal(s.videos[0].calls,1);s.tick();await flush();assert(!s.videos[1].paused);
}
{
 const s=setup({pending:true});s.visible(true);s.tick();await flush();s.resolve();await flush();assert(s.videos[0].paused,'A late play promise cannot revive the old city');assert(!s.videos[1].paused);
}
console.log('Passed: hero scenic rotation, active-only loading/playback, background/offscreen idle, bfcache restore, reduced motion/data-saving, blocked autoplay and late play resolution.');
