import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=(await readFile('dist/hero-earth.js','utf8')).replace(/^import .*;\s*/,'');
class Element{
 constructor(){this.events={};this.attrs={};this.dataset={};this.classes=new Set();this.classList={contains:x=>this.classes.has(x),add:x=>this.classes.add(x),remove:x=>this.classes.delete(x)};}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
 fire(k,event={}){for(const fn of this.events[k]||[])fn(event);}
 setAttribute(k,v){this.attrs[k]=v;}
 getBoundingClientRect(){return {width:1000,height:800};}
}
async function setup({gpuFailure=false,textureFailure=false,saveData=false}={}){
 const stage=new Element(),canvas=new Element(),button=new Element(),hero=new Element(),root=new Element(),doc=new Element(),win=new Element(),media=new Element(),connection=new Element();
 connection.saveData=saveData;doc.documentElement=root;doc.hidden=false;media.matches=false;
 const nodes={'.hero-earth-stage':stage,'#hero-earth-canvas':canvas,'#earth-toggle':button,'.hero-earth':hero};doc.querySelector=x=>nodes[x];
 let observer,mutation,renders=0,disposed=false,textureURL;const frames=new Map();let next=0;
 class Vec{set(){return this;}copy(){return this;}clone(){return new Vec();}multiplyScalar(){return this;}}
 class Obj{constructor(){this.position=new Vec();this.rotation={set(){},y:0};}add(){}lookAt(){}updateProjectionMatrix(){}}
 class Renderer{constructor(){if(gpuFailure)throw Error('No GPU');this.capabilities={getMaxAnisotropy:()=>4};}setClearColor(){}setPixelRatio(){}setSize(){}render(){renders++;}dispose(){disposed=true;}}
 class Loader{async loadAsync(url){textureURL=url;if(textureFailure)throw Error('Missing texture');return {};}}
 const THREE={WebGLRenderer:Renderer,Scene:Obj,PerspectiveCamera:Obj,Group:Obj,TextureLoader:Loader,Mesh:Obj,Vector3:Vec,MathUtils:{degToRad:n=>n*Math.PI/180},SphereGeometry:Obj,MeshBasicMaterial:Obj,ShaderMaterial:Obj,RingGeometry:Obj};
 const context={THREE,document:doc,window:win,navigator:{connection},matchMedia:()=>media,devicePixelRatio:2,innerWidth:1440,console:{warn(){}},requestAnimationFrame:fn=>{frames.set(++next,fn);return next;},cancelAnimationFrame:id=>frames.delete(id),IntersectionObserver:class{constructor(fn){observer=fn;}observe(){}},MutationObserver:class{constructor(fn){mutation=fn;}observe(){}},ResizeObserver:class{observe(){}}};
 vm.runInNewContext(source,context);await new Promise(r=>setImmediate(r));
 return {stage,canvas,button,root,doc,win,media,frames,get renders(){return renders;},get disposed(){return disposed;},get textureURL(){return textureURL;},visible(value){observer([{isIntersecting:value}]);},reduce(value){value?root.classes.add('reduce-motion'):root.classes.delete('reduce-motion');mutation();},tick(time){const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn(time));}};
}
const app=await setup();
assert.equal(app.frames.size,0,'No animation before intersection');
app.visible(true);assert.equal(app.frames.size,1);app.tick(100);app.tick(140);assert(app.renders>1);
app.button.fire('click');assert.equal(app.frames.size,0);assert.equal(app.button.attrs['aria-pressed'],'true');
app.visible(false);app.visible(true);assert.equal(app.frames.size,0,'Manual pause persists after returning');
app.button.fire('click');assert.equal(app.frames.size,1);
app.doc.hidden=true;app.doc.fire('visibilitychange');assert.equal(app.frames.size,0,'Hidden tab stops animation');
app.doc.hidden=false;app.doc.fire('visibilitychange');assert.equal(app.frames.size,1);
app.visible(false);assert.equal(app.frames.size,0,'Offscreen stops animation');app.visible(true);
app.reduce(true);assert.equal(app.frames.size,0);assert(app.button.disabled);app.reduce(false);assert.equal(app.frames.size,1);
app.canvas.fire('webglcontextlost',{preventDefault(){}});assert.equal(app.frames.size,0);assert(!app.stage.classes.has('is-ready'));
app.canvas.fire('webglcontextrestored');assert.equal(app.frames.size,1);assert(app.stage.classes.has('is-ready'));
app.win.fire('pagehide');assert.equal(app.frames.size,0);app.win.fire('pageshow');assert.equal(app.frames.size,1);
const data=await setup({saveData:true});data.visible(true);assert.equal(data.frames.size,0);assert.equal(data.textureURL,'assets/globe/earth-night.jpg');
for(const options of [{gpuFailure:true},{textureFailure:true}]){const fail=await setup(options);fail.visible(true);assert.equal(fail.stage.dataset.earthState,'fallback');assert.equal(fail.frames.size,0);assert(fail.button.hidden);}
console.log('Passed: Three.js hero lifecycle, manual pause, offscreen/background, reduced motion, save-data, context restoration and GPU/texture fallbacks.');
