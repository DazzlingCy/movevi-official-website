import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Exercise lifecycle and user-facing outcomes; GPU rendering is checked in the browser.
const code=await readFile('dist/globe.js','utf8');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
class Element {
  constructor(){
    this.events={};this.attrs={};this.style={};this.hidden=false;this.classes=new Set();
    this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x)};
  }
  addEventListener(type,handler){(this.events[type]??=[]).push(handler);}
  dispatchEvent(event){for(const handler of this.events[event.type]||[])handler(event);return true;}
  fire(type,details={}){this.dispatchEvent({type,preventDefault(){},...details});}
  setAttribute(key,value){this.attrs[key]=value;}
}

function setup({webgl=true,decodeFailure=false,shaderFailure=false,reduced=false}={}){
  const canvas=new Element(),disc=new Element(),panel=new Element(),markers=new Element();
  const help=new Element(),coordinates=new Element(),root=new Element(),document=new Element();
  const buttons=['tokyo','paris','new-york','sydney'].map(key=>Object.assign(new Element(),{dataset:{globeCity:key}}));
  markers.querySelectorAll=()=>buttons;canvas.hidden=true;markers.hidden=true;
  disc.clientWidth=435;canvas.width=600;canvas.height=600;canvas.setPointerCapture=()=>{};
  document.documentElement=root;document.hidden=false;
  const elements={'#world-globe':canvas,'#globe-disc':disc,'.globe-panel':panel,'#globe-markers':markers,'#globe-help':help,'#globe-coordinates':coordinates};
  document.querySelector=selector=>elements[selector];

  const draws=[];let center,now=0,nextFrame=0,imageCount=0;
  const frames=new Map(),intersections=[],mutations=[];
  const gl={
    createShader:()=>({}),getShaderParameter:()=>!shaderFailure,createProgram:()=>({}),getProgramParameter:()=>true,
    createBuffer:()=>({}),createTexture:()=>({}),getAttribLocation:()=>0,getUniformLocation:()=>({}),
    uniform2f:(_location,longitude,latitude)=>{center={longitude,latitude};},
    drawArrays:()=>draws.push({...center})
  };
  for(const name of ['shaderSource','compileShader','attachShader','linkProgram','useProgram','deleteShader','bindBuffer','bufferData','enableVertexAttribArray','vertexAttribPointer','bindTexture','texParameteri','texImage2D','viewport','clearColor','clear'])gl[name]=()=>{};
  canvas.getContext=()=>webgl?gl:null;
  class Image {constructor(){imageCount++;}decode(){return decodeFailure?Promise.reject(Error('Texture unavailable')):Promise.resolve();}}
  class IntersectionObserver {constructor(callback){intersections.push(callback);}observe(){}}
  class MutationObserver {constructor(callback){mutations.push(callback);}observe(){}}
  class ResizeObserver {observe(){}}
  class CustomEvent {constructor(type,options){this.type=type;this.detail=options.detail;}}
  const context={document,Image,IntersectionObserver,MutationObserver,ResizeObserver,CustomEvent,devicePixelRatio:1,
    matchMedia:()=>({matches:reduced}),performance:{now:()=>now},
    requestAnimationFrame:callback=>{const id=++nextFrame;frames.set(id,callback);return id;},
    cancelAnimationFrame:id=>frames.delete(id)
  };
  vm.runInNewContext(code,context);
  return {
    canvas,disc,markers,help,coordinates,root,document,buttons,draws,frames,
    get imageCount(){return imageCount;},
    visible:value=>intersections.forEach(callback=>callback([{isIntersecting:value}])),
    select:key=>document.fire('movevi:destination',{detail:{key}}),
    background:value=>{document.hidden=value;document.fire('visibilitychange');},
    reduce:()=>{root.classList.add('reduce-motion');mutations.forEach(callback=>callback([]));},
    advance:milliseconds=>{now+=milliseconds;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback(now));}
  };
}

function assertFallback(s){
  assert.equal(s.canvas.hidden,true,'Failed WebGL must not cover the static globe');
  assert.equal(s.markers.hidden,true,'Unavailable interactive markers must stay out of tab order');
  assert.equal(s.disc.classList.contains('is-rendered'),false,'Static globe remains visible');
  assert.match(s.help.textContent,/点选下方城市/);
  assert.equal(s.frames.size,0,'Failures must not start an animation loop');
}

for(const failure of [{webgl:false},{decodeFailure:true},{shaderFailure:true}]){
  const s=setup(failure);s.visible(true);await flush();assertFallback(s);
  s.select('paris');assert.equal(s.coordinates.textContent,'48.86° N / 2.35° E','City information remains usable without WebGL');
  const requests=s.imageCount;s.visible(false);s.visible(true);await flush();
  assert.equal(s.imageCount,requests,'Scrolling does not cause a failed-texture request loop');
}

{
  const s=setup();assert.equal(s.imageCount,0,'Do not load the globe before its section is visible');
  s.visible(true);await flush();assert.equal(s.canvas.hidden,false);assert.equal(s.markers.hidden,false);
  assert.equal(s.frames.size,0,'A ready, idle globe must not continuously animate');
  let requested;
  s.document.addEventListener('movevi:select-city',event=>{requested=event.detail.key;});
  s.buttons[0].fire('click');assert.equal(requested,'tokyo','Markers select cities through the shared page event');

  const start=s.draws.at(-1).longitude*180/Math.PI;
  s.select('new-york');assert.equal(s.coordinates.textContent,'40.71° N / 74.01° W');assert.equal(s.frames.size,1);
  s.advance(400);const middle=s.draws.at(-1).longitude*180/Math.PI;
  assert(middle>start&&middle<start+180,'Crossing the date line takes the short eastward turn to New York');
  s.advance(1000);assert.equal(s.frames.size,0,'City transition terminates');
  const final=s.draws.at(-1).longitude*180/Math.PI;
  assert(Math.abs(((final+180)%360+360)%360-180-(-74.006))<.001,'Globe arrives at the selected longitude');
  assert.equal(s.buttons[2].attrs['aria-pressed'],'true');

  s.select('paris');s.advance(100);const draws=s.draws.length;
  s.visible(false);assert.equal(s.frames.size,0,'Leaving the viewport cancels an active transition');
  s.advance(1000);assert.equal(s.draws.length,draws,'No offscreen transition frames');
  s.visible(true);assert.equal(s.frames.size,0,'Re-entry shows the final view without an idle loop');

  s.select('sydney');s.advance(100);s.background(true);const backgroundDraws=s.draws.length;
  assert.equal(s.frames.size,0,'Background tabs cancel the active animation');
  s.advance(1000);assert.equal(s.draws.length,backgroundDraws);
  s.background(false);assert.equal(s.frames.size,0);
  assert.equal(s.coordinates.textContent,'33.87° S / 151.21° E');

  s.select('paris');s.advance(100);s.reduce();assert.equal(s.frames.size,0,'Changing to reduced motion ends the current transition');
  s.select('tokyo');assert.equal(s.frames.size,0,'Reduced motion city selection does not schedule animation');

  s.canvas.fire('webglcontextlost');assertFallback(s);
  s.canvas.fire('webglcontextrestored');await flush();assert.equal(s.canvas.hidden,false,'A restored WebGL context can recover');
  assert.equal(s.frames.size,0);assert.equal(s.imageCount,1,'Context restoration reuses the decoded texture');
}

{
  const s=setup({reduced:true});s.visible(true);await flush();s.select('sydney');
  assert.equal(s.frames.size,0,'System reduced motion is honored from the first interaction');
  assert.equal(s.coordinates.textContent,'33.87° S / 151.21° E');
}

console.log('Passed: globe lazy loading, WebGL/texture/shader fallbacks, city events and coordinates, shortest turn, idle/offscreen/background lifecycle, reduced motion, and context recovery.');
