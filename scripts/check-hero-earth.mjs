import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=(await readFile('dist/hero-earth.js','utf8')).replace(/^import .*;\s*/,'');
class Element{
 constructor(){this.events={};this.attrs={};this.dataset={};this.classes=new Set();this.classList={contains:x=>this.classes.has(x),add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),toggle:(x,v)=>v?this.classes.add(x):this.classes.delete(x)};}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
 fire(k,event={}){for(const fn of this.events[k]||[])fn(event);}
 setAttribute(k,v){this.attrs[k]=v;}
 getBoundingClientRect(){return {left:0,top:0,width:1000,height:800};}
 setPointerCapture(id){this.capture=id;}
 hasPointerCapture(id){return this.capture===id;}
 releasePointerCapture(){this.capture=null;}
}
async function setup({gpuFailure=false,textureFailure=false,saveData=false}={}){
 const stage=new Element(),canvas=new Element(),button=new Element(),hero=new Element(),root=new Element(),doc=new Element(),win=new Element(),media=new Element(),connection=new Element();
 connection.saveData=saveData;doc.documentElement=root;doc.hidden=false;media.matches=false;
 const nodes={'.hero-earth-stage':stage,'#hero-earth-canvas':canvas,'.hero-earth':hero};doc.querySelector=x=>nodes[x];
 let observer,mutation,renders=0,disposed=false,textureURL,group,hit=true;const frames=new Map();let next=0;
 class Vec{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}set(){return this;}copy(){return this;}clone(){return new Vec();}multiplyScalar(){return this;}}
 class BufferGeometry{setFromPoints(points){assert.equal(points.length,49);for(const p of points){assert(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z));const radius=Math.hypot(p.x,p.y,p.z);assert(radius>=1.013&&radius<=1.105,'City arcs stay just above the surface');}return this;}}
 class Obj{constructor(){this.position=new Vec();this.rotation={x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}};}add(){}lookAt(){}updateProjectionMatrix(){}}
 class Group extends Obj{constructor(){super();group=this;}}
 class Raycaster{setFromCamera(){}intersectObject(){return hit?[{}]:[];}}
 class Renderer{constructor(){if(gpuFailure)throw Error('No GPU');this.capabilities={getMaxAnisotropy:()=>4};}setClearColor(){}setPixelRatio(){}setSize(){}render(){renders++;}dispose(){disposed=true;}}
 class Loader{async loadAsync(url){textureURL=url;if(textureFailure)throw Error('Missing texture');return {};}}
 const THREE={WebGLRenderer:Renderer,Scene:Obj,PerspectiveCamera:Obj,Group,Raycaster,Vector2:Vec,TextureLoader:Loader,Mesh:Obj,Vector3:Vec,MathUtils:{degToRad:n=>n*Math.PI/180},SphereGeometry:Obj,MeshBasicMaterial:Obj,MeshPhongMaterial:Obj,AmbientLight:Obj,DirectionalLight:Obj,ShaderMaterial:Obj,RingGeometry:Obj,LineBasicMaterial:Obj,Line:Obj,BufferGeometry};
 const context={THREE,document:doc,window:win,navigator:{connection},matchMedia:()=>media,devicePixelRatio:2,innerWidth:1440,console:{warn(){}},requestAnimationFrame:fn=>{frames.set(++next,fn);return next;},cancelAnimationFrame:id=>frames.delete(id),IntersectionObserver:class{constructor(fn){observer=fn;}observe(){}},MutationObserver:class{constructor(fn){mutation=fn;}observe(){}},ResizeObserver:class{observe(){}}};
 vm.runInNewContext(source,context);await new Promise(r=>setImmediate(r));
 return {stage,canvas,button,root,doc,win,media,frames,get rotation(){return group.rotation;},hit(value){hit=value;},get renders(){return renders;},get disposed(){return disposed;},get textureURL(){return textureURL;},visible(value){observer([{isIntersecting:value}]);},reduce(value){value?root.classes.add('reduce-motion'):root.classes.delete('reduce-motion');mutation();},tick(time){const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn(time));}};
}
const app=await setup();
assert.equal(app.frames.size,0,'No animation before intersection');
app.visible(true);assert.equal(app.frames.size,1);app.tick(100);app.tick(140);assert(app.renders>1);
const beforeTurn=app.rotation.y;app.tick(180);assert(app.rotation.y>beforeTurn,'Earth keeps rotating without a play control');
app.visible(false);app.visible(true);assert.equal(app.frames.size,1,'Returning always resumes rotation');
app.doc.hidden=true;app.doc.fire('visibilitychange');assert.equal(app.frames.size,0,'Hidden tab stops animation');
app.doc.hidden=false;app.doc.fire('visibilitychange');assert.equal(app.frames.size,1);
app.visible(false);assert.equal(app.frames.size,0,'Offscreen stops animation');app.visible(true);
app.reduce(true);assert.equal(app.frames.size,0);app.reduce(false);assert.equal(app.frames.size,1);
app.canvas.fire('webglcontextlost',{preventDefault(){}});assert.equal(app.frames.size,0);assert(!app.stage.classes.has('is-ready'));
app.canvas.fire('webglcontextrestored');assert.equal(app.frames.size,1);assert(app.stage.classes.has('is-ready'));
app.win.fire('pagehide');assert.equal(app.frames.size,0);app.win.fire('pageshow');assert.equal(app.frames.size,1);
const data=await setup({saveData:true});data.visible(true);assert.equal(data.frames.size,0);assert.equal(data.textureURL,'assets/globe/earth-night.jpg');
for(const options of [{gpuFailure:true},{textureFailure:true}]){const fail=await setup(options);fail.visible(true);assert.equal(fail.stage.dataset.earthState,'fallback');assert.equal(fail.frames.size,0);}
const interactive=await setup();interactive.visible(true);interactive.reduce(true);
const pointer={pointerId:1,pointerType:'mouse',button:0,clientX:400,clientY:300,preventDefault(){}};
interactive.hit(false);interactive.canvas.fire('pointerdown',pointer);assert.equal(interactive.canvas.capture,undefined,'Empty canvas does not capture');
interactive.hit(true);interactive.canvas.fire('pointerdown',pointer);assert.equal(interactive.stage.dataset.earthState,'dragging');
interactive.canvas.fire('pointermove',{...pointer,clientX:600,clientY:800});interactive.tick(100);
assert(interactive.rotation.y>Math.PI);assert.equal(interactive.rotation.x,1.15,'Latitude bounded against flipping');
interactive.canvas.fire('pointerup',pointer);assert.equal(interactive.frames.size,0);assert.equal(interactive.stage.dataset.earthState,'paused');
interactive.reduce(false);assert.equal(interactive.frames.size,1,'Rotation resumes when reduced motion is lifted');
interactive.canvas.fire('pointerdown',pointer);assert.equal(interactive.frames.size,0,'Dragging temporarily owns rotation');
interactive.canvas.fire('pointerup',pointer);assert.equal(interactive.frames.size,1,'Release automatically resumes rotation');
interactive.canvas.fire('pointerdown',pointer);interactive.canvas.fire('pointercancel',pointer);assert.equal(interactive.frames.size,1,'Cancelled drag resumes rotation');
interactive.canvas.fire('dblclick',pointer);assert.equal(interactive.rotation.y,Math.PI);assert.equal(interactive.frames.size,1,'Reset keeps rotation running');
interactive.canvas.fire('keydown',{key:'ArrowLeft',preventDefault(){}});assert(interactive.rotation.y<Math.PI);
interactive.canvas.fire('keydown',{key:'Home',preventDefault(){}});assert.equal(interactive.rotation.x,.13);assert.equal(interactive.frames.size,1);
const start=interactive.rotation.y;interactive.tick(200);interactive.tick(240);assert(interactive.rotation.y>start,'Keyboard and reset cannot leave the globe paused');
console.log('Passed: Three.js lifecycle, dragging/hit testing, keyboard rotation/reset, bounded latitude, automatic rotation after drag/reset, reduced motion and recovery.');
