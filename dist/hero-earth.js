import * as THREE from './assets/vendor/three/three.module.js';

const stage=document.querySelector('.hero-earth-stage');
const canvas=document.querySelector('#hero-earth-canvas');
const button=document.querySelector('#earth-toggle');
const hero=document.querySelector('.hero-earth');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const connection=navigator.connection;
const root=document.documentElement;
let renderer,scene,camera,earth,ready=false,visible=false,lost=false,failed=false;
let frame=0,previous=0,paused=false,pointer=0,targetPointer=0;
const limit=()=>reduced.matches||root.classList.contains('reduce-motion')||connection?.saveData;
const running=()=>ready&&visible&&!document.hidden&&!paused&&!limit()&&!lost&&!failed;

function cancel(){if(frame)cancelAnimationFrame(frame);frame=0;previous=0;}
function draw(){if(ready&&!lost&&!document.hidden){camera.position.x=pointer;camera.lookAt(0,0,0);renderer.render(scene,camera);}}
function tick(time){
 frame=0;if(!running())return;
 if(!previous)previous=time;
 const dt=time-previous;
 if(dt>=1000/30){earth.rotation.y+=Math.min(dt,70)*.000045;pointer+=(targetPointer-pointer)*.06;previous=time;draw();}
 frame=requestAnimationFrame(tick);
}
function sync(){
 cancel();
 const stopped=limit();button.hidden=!ready||failed;button.disabled=!!stopped;
 button.textContent=stopped?'静态地球':paused?'播放地球 ▷':'暂停地球 Ⅱ';
 button.setAttribute('aria-label',stopped?'地球动画已按动态偏好关闭':paused?'播放地球动画':'暂停地球动画');
 button.setAttribute('aria-pressed',String(paused||!!stopped));
 stage.dataset.earthState=failed?'fallback':lost?'context-lost':running()?'playing':'paused';
 if(visible)draw();
 if(running())frame=requestAnimationFrame(tick);
}
function fallback(){failed=true;ready=false;cancel();renderer?.dispose();stage.classList.remove('is-ready');sync();}
function resize(){
 if(!renderer)return;
 const box=canvas.getBoundingClientRect();
 if(!box.width||!box.height)return;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(box.width,box.height,false);
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
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,.1,30);camera.position.set(0,0,3.45);
  earth=new THREE.Group();earth.rotation.set(.13,Math.PI, -.12);scene.add(earth);
  const map=await new THREE.TextureLoader().loadAsync(connection?.saveData?'assets/globe/earth-night.jpg':'assets/globe/earth-night-hd.jpg');
  map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),new THREE.MeshBasicMaterial({map,color:0xf3faff}));earth.add(sphere);
  const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.012,64,48),new THREE.ShaderMaterial({
   transparent:true,depthWrite:false,side:THREE.FrontSide,
   vertexShader:'varying vec3 n;varying vec3 eye;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
   fragmentShader:'varying vec3 n;varying vec3 eye;void main(){float rim=pow(1.-max(dot(normalize(n),normalize(eye)),0.),3.);gl_FragColor=vec4(.32,.58,.77,rim*.5);}'
  }));scene.add(atmosphere);
  // Geographic points express exploration, not an inventory of live MOVEVI routes.
  const cities=[[31.23,121.47],[35.68,139.65],[1.35,103.82],[48.86,2.35],[51.5,-.12],[40.71,-74.01],[34.05,-118.24],[-33.87,151.21],[-33.92,18.42],[-23.55,-46.63],[25.2,55.27]];
  const dotGeometry=new THREE.SphereGeometry(.009,10,8),dotMaterial=new THREE.MeshBasicMaterial({color:0xff9472});
  for(const [lat,lon] of cities){
   const p=location(lat,lon);const dot=new THREE.Mesh(dotGeometry,dotMaterial);dot.position.copy(p);earth.add(dot);
   const ring=new THREE.Mesh(new THREE.RingGeometry(.016,.018,32),new THREE.MeshBasicMaterial({color:0xffb293,side:THREE.DoubleSide,transparent:true,opacity:.68}));
   ring.position.copy(p.clone().multiplyScalar(1.001));ring.lookAt(p.clone().multiplyScalar(2));earth.add(ring);
  }
  ready=true;resize();draw();stage.classList.add('is-ready');sync();
 }catch(error){console.warn('Earth background unavailable; displaying the geographic fallback.');fallback();}
}

button.addEventListener('click',()=>{if(limit())return;paused=!paused;sync();});
hero.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'&&running())targetPointer=(event.clientX/innerWidth-.5)*.13;},{passive:true});
hero.addEventListener('pointerleave',()=>{targetPointer=0;});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.03}).observe(hero);
new ResizeObserver(resize).observe(canvas);
new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
reduced.addEventListener('change',sync);connection?.addEventListener?.('change',sync);
document.addEventListener('visibilitychange',sync);
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancel();stage.classList.remove('is-ready');sync();});
canvas.addEventListener('webglcontextrestored',()=>{lost=false;if(ready){stage.classList.add('is-ready');resize();sync();}});
window.addEventListener('pagehide',()=>{cancel();});
window.addEventListener('pageshow',sync);
boot();
