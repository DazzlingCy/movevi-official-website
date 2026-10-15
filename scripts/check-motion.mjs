import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const code=await readFile('dist/motion.js','utf8');
class Element {
  constructor(){this.events={};this.attrs={};this.classes=new Set();this.classList={add:(x)=>this.classes.add(x),remove:(x)=>this.classes.delete(x),contains:(x)=>this.classes.has(x),toggle:(x,v)=>v?this.classes.add(x):this.classes.delete(x)};this.style={setProperty(){}};this.paused=true;this.ended=false;this.playCalls=0;this.offsetHeight=1600;}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
  fire(type,event={}){for(const fn of this.events[type]||[])fn(event);}
  setAttribute(key,value){this.attrs[key]=value;}
  removeAttribute(key){delete this.attrs[key];if(key==='src')this.src='';}
  closest(){return this;}
  getBoundingClientRect(){return {top:0};}
  pause(){this.paused=true;this.fire('pause');}
  load(){}
  play(){this.playCalls++;if(this.rejectPlay)return Promise.reject(new Error('Autoplay blocked'));this.paused=false;this.fire('playing');return Promise.resolve();}
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function setup({saveData=false,reduced=false,reject=false,noControls=false,savedReduced=false}={}){
  const hero=new Element(),world=new Element(),heroButton=new Element(),worldButton=new Element(),toggle=new Element(),root=new Element(),scene=new Element(),section=new Element();
  hero.id='hero-video';hero.dataset={media:'paris'};world.id='world-video';world.dataset={media:'tokyo'};hero.rejectPlay=reject;
  const portal=new Element();portal.id='portal-video';portal.dataset={media:'tokyo'};
  const doc=new Element();doc.documentElement=root;doc.hidden=false;
  const map={'#motion-toggle':toggle,'#hero-video':hero,'#world-video':world,'[data-video-toggle="hero-video"]':heroButton,'[data-video-toggle="world-video"]':worldButton,'.portal-scene':scene,'.portal-section':section};
  doc.querySelector=s=>noControls&&(s==='#motion-toggle'||s.startsWith('[data-video-toggle'))?null:map[s];doc.querySelectorAll=s=>s==='video[data-media]'?[hero,world,portal]:[];
  const observers=[];class IO{constructor(cb){this.cb=cb;observers.push(this);}observe(target){this.target=target;}unobserve(){}}
  const preferences=new Element();preferences.matches=reduced;
  const context={document:doc,window:{MOVEVI_MEDIA:{paris:{src:'paris.mp4',mobile:'paris-mobile.mp4',poster:'paris.webp',label:'巴黎'},tokyo:{src:'tokyo.mp4',mobile:'tokyo-mobile.mp4',poster:'tokyo.webp',label:'东京'}}},navigator:{connection:{saveData}},matchMedia:q=>q.includes('prefers-reduced-motion')?preferences:{matches:q.includes('min-width'),addEventListener(){}},localStorage:{getItem(){return savedReduced?'true':null;},setItem(){}},IntersectionObserver:IO,addEventListener(){},requestAnimationFrame:fn=>{fn();return 1;},innerHeight:900};
  vm.runInNewContext(code,context);
  const visible=(target,value)=>observers.find(o=>o.target===target).cb([{isIntersecting:value,target}]);
  return {hero,world,portal,heroButton,worldButton,toggle,root,doc,visible,preferences};
}
{
  const s=setup();assert.equal(s.hero.src,undefined,'Offscreen media must not load');s.visible(s.hero,true);await flush();assert.equal(s.hero.paused,false);assert.equal(s.hero.src,'paris.mp4');
  s.visible(s.hero,false);await flush();assert.equal(s.hero.paused,true,'Offscreen media pauses');s.visible(s.hero,true);await flush();s.heroButton.fire('click');assert.equal(s.hero.paused,true);s.visible(s.hero,false);s.visible(s.hero,true);await flush();assert.equal(s.hero.paused,true,'Manual pause persists across scrolling');s.heroButton.fire('click');await flush();assert.equal(s.hero.paused,false);
  s.doc.hidden=true;s.doc.fire('visibilitychange');await flush();assert.equal(s.hero.paused,true,'Background tab pauses');s.doc.hidden=false;s.doc.fire('visibilitychange');await flush();assert.equal(s.hero.paused,false);
  s.visible(s.world,true);await flush();s.doc.fire('movevi:destination',{detail:{key:'new-york'}});await flush();assert.equal(s.world.paused,true);assert.equal(s.world.src,'');assert.equal(s.worldButton.hidden,true);s.doc.fire('movevi:destination',{detail:{key:'paris'}});await flush();assert.equal(s.world.src,'paris.mp4');assert.equal(s.worldButton.hidden,false);
  s.toggle.fire('click');await flush();assert(s.root.classList.contains('reduce-motion'));assert.equal(s.hero.paused,true);assert.equal(s.world.paused,true);s.toggle.fire('click');await flush();assert.equal(s.hero.paused,false);
}
{
  const s=setup({reject:true});s.visible(s.hero,true);await flush();assert.equal(s.hero.paused,true);assert(!s.hero.classes.has('is-playing'),'Blocked playback leaves poster visible');assert.match(s.heroButton.textContent,/播放/);const calls=s.hero.playCalls;s.visible(s.hero,false);s.visible(s.hero,true);await flush();assert.equal(s.hero.playCalls,calls,'No automatic retry loop');s.hero.rejectPlay=false;s.heroButton.fire('click');await flush();assert.equal(s.hero.paused,false,'Explicit retry works');
}
for(const options of [{saveData:true},{reduced:true}]){
 const s=setup(options);s.visible(s.hero,true);await flush();assert.equal(s.hero.src,undefined,'Reduced motion/data mode avoids auto download');assert.equal(s.hero.paused,true);if(options.reduced)assert.equal(s.heroButton.disabled,true);else{s.heroButton.fire('click');await flush();assert.equal(s.hero.paused,false,'Data-saving user can explicitly play');}
}
{
 const s=setup();s.visible(s.portal,true);await flush();assert.equal(s.portal.paused,false);
 s.doc.fire('movevi:portal-visibility',{detail:{occluded:true}});await flush();assert.equal(s.portal.paused,true,'App-covered video pauses');
 s.doc.fire('movevi:portal-visibility',{detail:{occluded:false}});await flush();assert.equal(s.portal.paused,false,'Reverse scrolling uncovers and resumes visible video');
 s.visible(s.portal,false);s.doc.fire('movevi:portal-visibility',{detail:{occluded:false}});await flush();assert.equal(s.portal.paused,true,'Uncover event cannot play offscreen video');
}
const mediaContext={window:{}};vm.runInNewContext(await readFile('dist/media-config.js','utf8'),mediaContext);
for(const media of Object.values(mediaContext.window.MOVEVI_MEDIA)){assert((await stat(`dist/${media.src}`)).size<3e6);assert((await stat(`dist/${media.mobile}`)).size<1.5e6);await stat(`dist/${media.poster}`);}
console.log('Passed: video lifecycle, manual pause, hidden tab, city switching, blocked autoplay/retry, reduced motion, save-data, media budgets.');

const minimal=setup({noControls:true,savedReduced:true});minimal.visible(minimal.hero,true);await flush();assert(!minimal.hero.paused);minimal.preferences.matches=true;minimal.preferences.fire('change');await flush();assert(minimal.hero.paused);
