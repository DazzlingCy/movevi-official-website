import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const code=await readFile('dist/carousel.js','utf8');
class Node {
  constructor(){this.events={};this.attrs={};this.dataset={};this.classes=new Set();this.classList={contains:x=>this.classes.has(x),add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),toggle:(x,on)=>on?this.classes.add(x):this.classes.delete(x)};this.paused=true;this.playCalls=0;}
  addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
  fire(name,event={}){for(const fn of this.events[name]||[])fn(event);}
  setAttribute(name,value){this.attrs[name]=value;}
  focus(){}
  contains(node){return !!node?.inside;}
  pause(){this.paused=true;}
  play(){this.playCalls++;if(this.rejectPlay)return Promise.reject({name:'NotAllowedError'});this.paused=false;return Promise.resolve();}
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function setup({reduced=false,saveData=false,reject=false,mobile=false}={}){
 const section=new Node(),root=new Node(),doc=new Node(),toggle=new Node(),controls=new Node(),country=new Node(),name=new Node(),status=new Node();
 const slides=[new Node(),new Node()],videos=[new Node(),new Node()],buttons=[new Node(),new Node()];videos[0].rejectPlay=reject;
 slides.forEach((slide,i)=>slide.querySelector=()=>videos[i]);
 section.querySelectorAll=q=>q.includes('data-cta-slide')?slides:buttons;
 section.querySelector=q=>({'#cta-carousel-toggle':toggle,'.cta-carousel-controls':controls,'#cta-city-country':country,'#cta-city-name':name,'#cta-carousel-status':status}[q]);
 doc.documentElement=root;doc.hidden=false;doc.querySelector=()=>section;
 const preference=new Node();preference.matches=reduced;const viewport=new Node();viewport.matches=mobile;
 const connection=new Node();connection.saveData=saveData;let visibility,mutation;
 const timers=new Map();let nextTimer=0;
 const context={document:doc,navigator:{connection},window:{MOVEVI_MEDIA:{nycRun:{src:'nyc.mp4',mobile:'nyc-small.mp4'},parisRun:{src:'paris.mp4',mobile:'paris-small.mp4'}}},matchMedia:q=>q.includes('prefers')?preference:viewport,
 IntersectionObserver:class{constructor(cb){visibility=cb;}observe(){}},MutationObserver:class{constructor(cb){mutation=cb;}observe(){}},
 setTimeout:(fn,delay)=>{assert.equal(delay,8000);timers.set(++nextTimer,fn);return nextTimer;},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(code,context);
 return {videos,slides,buttons,toggle,controls,doc,root,name,timers,visible:on=>visibility([{isIntersecting:on}]),preference,changePreference:on=>{root.classList.toggle('reduce-motion',on);mutation();},tick:()=>{const fn=timers.values().next().value;assert(fn,'A live carousel must schedule its next city');fn();}};
}
{
 const s=setup();assert.equal(s.videos[0].src,undefined);assert.equal(s.timers.size,0,'Offscreen carousel stays idle');s.visible(true);await flush();assert.equal(s.videos[0].paused,false);assert.equal(s.videos[1].src,undefined,'Only active city loads');s.tick();await flush();assert.equal(s.videos[0].paused,true);assert.equal(s.videos[1].paused,false);assert.match(s.name.textContent,/巴黎/);
 s.controls.fire('pointerenter',{pointerType:'mouse'});assert.equal(s.timers.size,0);s.controls.fire('pointerleave');assert.equal(s.timers.size,1);
 s.doc.hidden=true;s.doc.fire('visibilitychange');assert(s.videos.every(v=>v.paused));assert.equal(s.timers.size,0);s.doc.hidden=false;s.doc.fire('visibilitychange');await flush();assert.equal(s.videos[1].paused,false);
 s.toggle.fire('click');s.visible(false);s.visible(true);await flush();assert(s.videos.every(v=>v.paused),'Manual pause persists after scrolling');assert.equal(s.timers.size,0);s.buttons[0].fire('click');assert.match(s.name.textContent,/纽约/);assert.equal(s.videos[0].paused,true,'Manual city switching respects pause');s.toggle.fire('click');await flush();assert.equal(s.videos[0].paused,false);
 s.changePreference(true);assert(s.videos.every(v=>v.paused));assert.equal(s.timers.size,0);assert.equal(s.toggle.disabled,true);s.buttons[1].fire('click');assert.match(s.name.textContent,/巴黎/);s.changePreference(false);await flush();assert.equal(s.videos[1].paused,false);s.visible(false);assert.equal(s.timers.size,0);
}
for(const option of [{reduced:true},{saveData:true}]){
 const s=setup(option);s.visible(true);await flush();assert.equal(s.videos[0].src,undefined,'Reduced motion or data saving skips auto download');assert.equal(s.timers.size,0);s.buttons[1].fire('click');assert.match(s.name.textContent,/巴黎/);if(option.saveData){s.toggle.fire('click');await flush();assert.equal(s.videos[1].paused,false,'Explicit playback works with data saving');}
}
{
 const s=setup({reject:true,mobile:true});s.visible(true);await flush();assert.equal(s.videos[0].src,'nyc-small.mp4');assert.equal(s.videos[0].paused,true);assert(!s.videos[0].classes.has('is-playing'),'Failed autoplay leaves a visible poster');const calls=s.videos[0].playCalls;s.visible(false);s.visible(true);await flush();assert.equal(s.videos[0].playCalls,calls,'No autoplay retry loop');s.toggle.fire('click');s.videos[0].rejectPlay=false;s.toggle.fire('click');await flush();assert.equal(s.videos[0].paused,false);
}
console.log('Passed: carousel rotation, active-only loading, manual pause, city selection, hover, offscreen/background idle, reduced motion, save-data, mobile sources and blocked autoplay/retry.');
