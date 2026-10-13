import * as THREE from './assets/vendor/three/three.module.js';

const stage=document.querySelector('.hero-earth-stage');
const canvas=document.querySelector('#hero-earth-canvas');
const hero=document.querySelector('.hero-earth');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const connection=navigator.connection;
const root=document.documentElement;
let renderer,scene,camera,earth,sphere,raycaster,ready=false,visible=false,lost=false,failed=false;
let frame=0,previous=0,pointer=0,targetPointer=0,drag=null;
const limit=()=>reduced.matches||root.classList.contains('reduce-motion')||connection?.saveData;
const running=()=>ready&&visible&&!document.hidden&&!drag&&!limit()&&!lost&&!failed;

function cancel(){if(frame)cancelAnimationFrame(frame);frame=0;previous=0;}
function draw(){if(ready&&!lost&&!document.hidden){camera.position.x=pointer;camera.lookAt(0,0,0);renderer.render(scene,camera);}}
function tick(time){
 frame=0;if(!running())return;
 if(!previous)previous=time;
 const dt=time-previous;
 if(dt>=1000/60){earth.rotation.y+=Math.min(dt,50)*.00005;pointer+=(targetPointer-pointer)*.06;previous=time;draw();}
 frame=requestAnimationFrame(tick);
}
function sync(){
 cancel();
 stage.dataset.earthState=failed?'fallback':lost?'context-lost':drag?'dragging':running()?'playing':'paused';
 canvas.tabIndex=ready&&!failed&&!lost?0:-1;
 if(visible)draw();
 if(running())frame=requestAnimationFrame(tick);
}
function fallback(){failed=true;ready=false;cancel();renderer?.dispose();stage.classList.remove('is-ready');sync();}
function resize(){
 if(!renderer)return;
 const box=canvas.getBoundingClientRect();
 if(!box.width||!box.height)return;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(box.width,box.height,false);
 camera.aspect=box.width/box.height;camera.updateProjectionMatrix();if(visible)draw();
}
function location(lat,lon,r=1.014){
 const a=THREE.MathUtils.degToRad(lat),b=THREE.MathUtils.degToRad(lon);
 return new THREE.Vector3(r*Math.cos(a)*Math.cos(b),r*Math.sin(a),-r*Math.cos(a)*Math.sin(b));
}
async function boot(){
 try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,.1,30);camera.position.set(0,0,3.6);
  scene.add(new THREE.AmbientLight(0xc8ddff,.9));
  const keyLight=new THREE.DirectionalLight(0xf4f8ff,1.7);keyLight.position.set(-3,3,5);scene.add(keyLight);
  const fillLight=new THREE.DirectionalLight(0x5598ed,.55);fillLight.position.set(3,-1,1);scene.add(fillLight);
  earth=new THREE.Group();earth.rotation.set(.13,Math.PI, -.12);scene.add(earth);
  const map=await new THREE.TextureLoader().loadAsync(connection?.saveData?'assets/globe/earth-night.jpg':'assets/globe/earth-night-hd.jpg');
  map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  sphere=new THREE.Mesh(new THREE.SphereGeometry(1,128,96),new THREE.MeshPhongMaterial({map,color:0xe7efff,emissiveMap:map,emissive:0xb5ceff,emissiveIntensity:.22,specular:0x142338,shininess:14}));earth.add(sphere);raycaster=new THREE.Raycaster();
  const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.008,96,64),new THREE.ShaderMaterial({
   transparent:true,depthWrite:false,side:THREE.FrontSide,
   vertexShader:'varying vec3 n;varying vec3 eye;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
   fragmentShader:'varying vec3 n;varying vec3 eye;void main(){float rim=pow(1.-max(dot(normalize(n),normalize(eye)),0.),3.);gl_FragColor=vec4(.30,.57,.95,rim*.32);}'
  }));scene.add(atmosphere);
  // A narrow outer shell supplies a blue limb without washing out the ocean.
  const outerAtmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.024,96,64),new THREE.ShaderMaterial({
   transparent:true,depthWrite:false,side:THREE.BackSide,
   vertexShader:'varying vec3 n;varying vec3 eye;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
   fragmentShader:'varying vec3 n;varying vec3 eye;void main(){float edge=pow(1.-abs(dot(normalize(n),normalize(eye))),3.);gl_FragColor=vec4(.34,.61,1.,edge*.22);}'
  }));scene.add(outerAtmosphere);
  // Geographic points express exploration, not an inventory of live MOVEVI routes.
  const cities=[[31.23,121.47],[35.68,139.65],[1.35,103.82],[48.86,2.35],[51.5,-.12],[40.71,-74.01],[34.05,-118.24],[-33.87,151.21],[-33.92,18.42],[-23.55,-46.63],[25.2,55.27]];
  const dotGeometry=new THREE.SphereGeometry(.0055,10,8),dotMaterial=new THREE.MeshBasicMaterial({color:0xcce9ff});
  for(const [lat,lon] of cities){
   const p=location(lat,lon);const dot=new THREE.Mesh(dotGeometry,dotMaterial);dot.position.copy(p);earth.add(dot);
   const ring=new THREE.Mesh(new THREE.RingGeometry(.011,.013,32),new THREE.MeshBasicMaterial({color:0x66b4ff,side:THREE.DoubleSide,transparent:true,opacity:.55}));
   ring.position.copy(p.clone().multiplyScalar(1.001));ring.lookAt(p.clone().multiplyScalar(2));earth.add(ring);
  }
  ready=true;resize();draw();stage.classList.add('is-ready');sync();
 }catch(error){console.warn('Earth background unavailable; displaying the geographic fallback.');fallback();}
}

function hit(event){
 if(!ready||lost||failed)return false;
 const box=canvas.getBoundingClientRect();
 raycaster.setFromCamera(new THREE.Vector2((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1),camera);
 return raycaster.intersectObject(sphere).length>0;
}
function requestDraw(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;draw();});}
function release(){
 if(!drag)return;
 const id=drag.id;drag=null;canvas.classList.remove('is-dragging');
 if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
 sync();
}
function reset(){if(!ready||lost)return;earth.rotation.set(.13,Math.PI,-.12);pointer=targetPointer=0;sync();}
canvas.addEventListener('pointerdown',event=>{
 if(event.pointerType==='touch'||event.button!==0||!hit(event))return;
 event.preventDefault();drag={id:event.pointerId,x:event.clientX,y:event.clientY,lon:earth.rotation.y,lat:earth.rotation.x};
 canvas.setPointerCapture(event.pointerId);canvas.classList.add('is-dragging');sync();
});
canvas.addEventListener('pointermove',event=>{
 if(drag&&event.pointerId===drag.id){
  earth.rotation.y=drag.lon+(event.clientX-drag.x)*.006;
  earth.rotation.x=Math.max(-1.15,Math.min(1.15,drag.lat+(event.clientY-drag.y)*.004));requestDraw();
 }else canvas.classList.toggle('is-hovered',event.pointerType!=='touch'&&hit(event));
});
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
canvas.addEventListener('pointerleave',()=>canvas.classList.remove('is-hovered'));
canvas.addEventListener('dblclick',event=>{if(hit(event))reset();});
canvas.addEventListener('keydown',event=>{
 if(!ready||lost||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
 event.preventDefault();if(event.key==='Home'){reset();return;}
 earth.rotation.y+=event.key==='ArrowLeft'?-.16:event.key==='ArrowRight'?.16:0;
 earth.rotation.x=Math.max(-1.15,Math.min(1.15,earth.rotation.x+(event.key==='ArrowUp'?-.12:event.key==='ArrowDown'?.12:0)));sync();
});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.03}).observe(hero);
new ResizeObserver(resize).observe(canvas);
new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
reduced.addEventListener('change',sync);connection?.addEventListener?.('change',sync);
document.addEventListener('visibilitychange',()=>{if(document.hidden)release();sync();});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;release();cancel();stage.classList.remove('is-ready');sync();});
canvas.addEventListener('webglcontextrestored',()=>{lost=false;if(ready){stage.classList.add('is-ready');resize();sync();}});
window.addEventListener('pagehide',()=>{cancel();});
window.addEventListener('pageshow',sync);
boot();
