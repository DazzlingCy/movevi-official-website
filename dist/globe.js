/* Native WebGL globe: no framework, external requests, or idle animation loop. */
(() => {
  'use strict';
  const canvas=document.querySelector('#world-globe');
  if(!canvas)return;
  const disc=document.querySelector('#globe-disc'),panel=document.querySelector('.globe-panel');
  const markers=document.querySelector('#globe-markers'),help=document.querySelector('#globe-help');
  const coordinates=document.querySelector('#globe-coordinates');
  const cities={
    tokyo:{lat:35.6762,lon:139.6503},paris:{lat:48.8566,lon:2.3522},
    'new-york':{lat:40.7128,lon:-74.006},sydney:{lat:-33.8688,lon:151.2093}
  };
  const markerButtons=[...markers.querySelectorAll('[data-globe-city]')];
  const rad=Math.PI/180,clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduce-motion');
  let lon=128,lat=25,selected='tokyo',visible=false,renderer=null,loaded=false,frame=0,tween=null,drag=null;
  let mapImage;
  function locationText(city){return `${Math.abs(city.lat).toFixed(2)}° ${city.lat<0?'S':'N'} / ${Math.abs(city.lon).toFixed(2)}° ${city.lon<0?'W':'E'}`;}
  function placeMarkers(){
    for(const button of markerButtons){
      const city=cities[button.dataset.globeCity],a=city.lat*rad,b=(city.lon-lon)*rad,c=lat*rad;
      const x=Math.cos(a)*Math.sin(b),y=Math.cos(c)*Math.sin(a)-Math.sin(c)*Math.cos(a)*Math.cos(b);
      const z=Math.sin(c)*Math.sin(a)+Math.cos(c)*Math.cos(a)*Math.cos(b);
      button.hidden=z<.14;
      button.style.left=`${50+x*47}%`;button.style.top=`${50-y*47}%`;
      button.setAttribute('aria-pressed',String(button.dataset.globeCity===selected));
    }
  }
  function render(){if(renderer){renderer.draw(lon*rad,lat*rad);placeMarkers();}}
  function cancel(){if(frame)cancelAnimationFrame(frame);frame=0;}
  function finish(){cancel();if(tween){lon=tween.toLon;lat=tween.toLat;tween=null;}if(visible&&!document.hidden)render();}
  function tick(time){
    frame=0;if(!visible||document.hidden||!tween)return;
    const p=clamp((time-tween.start)/850,0,1),e=1-Math.pow(1-p,3);
    lon=tween.fromLon+(tween.toLon-tween.fromLon)*e;lat=tween.fromLat+(tween.toLat-tween.fromLat)*e;
    render();if(p<1)frame=requestAnimationFrame(tick);else tween=null;
  }
  function focusCity(key){
    const city=cities[key];if(!city)return;
    selected=key;coordinates.textContent=locationText(city);
    cancel();const delta=((city.lon-lon+540)%360+360)%360-180;
    tween={fromLon:lon,fromLat:lat,toLon:lon+delta,toLat:city.lat*.65,start:performance.now()};
    if(reduce()||!renderer||!visible||document.hidden)finish();else frame=requestAnimationFrame(tick);
  }
  function fail(){renderer=null;canvas.hidden=true;markers.hidden=true;disc.classList.remove('is-rendered');help.textContent='点选下方城市，发现另一种日常。';finish();}
  function makeRenderer(gl,image){
    const vertex='attribute vec2 a; varying vec2 uv; void main(){uv=a;gl_Position=vec4(a,0.0,1.0);}';
    const fragment=`precision mediump float;
      varying vec2 uv; uniform sampler2D earth; uniform vec2 center;
      void main(){
        vec2 p=uv/.94; float r=dot(p,p); if(r>1.0)discard;
        float z=sqrt(1.0-r),lo=center.x,la=center.y;
        vec3 right=vec3(cos(lo),0.,-sin(lo));
        vec3 up=vec3(-sin(la)*sin(lo),cos(la),-sin(la)*cos(lo));
        vec3 front=vec3(cos(la)*sin(lo),sin(la),cos(la)*cos(lo));
        vec3 w=right*p.x+up*p.y+front*z;
        vec2 st=vec2(atan(w.x,w.z)/6.2831853+.5,.5-asin(clamp(w.y,-1.,1.))/3.14159265);
        vec3 color=pow(texture2D(earth,st).rgb,vec3(.76));
        color=(color*.94+vec3(.018,.030,.047))*(.32+.68*z);
        color+=vec3(.26,.32,.43)*pow(1.-z,4.)*.48;
        gl_FragColor=vec4(color,1.);
      }`;
    function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Globe shader unavailable');return s;}
    const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment),program=gl.createProgram();
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Globe renderer unavailable');gl.useProgram(program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
    const center=gl.getUniformLocation(program,'center');
    return {draw(longitude,latitude){
      const size=Math.min(900,Math.round(disc.clientWidth*Math.min(devicePixelRatio||1,1.5)));
      if(canvas.width!==size){canvas.width=size;canvas.height=size;}
      gl.viewport(0,0,size,size);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(center,longitude,latitude);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }};
  }
  async function boot(){
    try{
      const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
      if(!gl)return fail();
      if(!mapImage){mapImage=new Image();mapImage.src='assets/globe/earth-night.jpg';await mapImage.decode();}
      renderer=makeRenderer(gl,mapImage);canvas.hidden=false;markers.hidden=false;render();disc.classList.add('is-rendered');
      help.textContent='拖动地球 · 点选城市 · 发现下一站';
    }catch{fail();}
  }
  const observer=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible){if(!loaded){loaded=true;boot();}else render();}else finish();
  },{threshold:0});observer.observe(panel);
  new ResizeObserver(()=>{if(visible&&!document.hidden)render();}).observe(disc);
  new MutationObserver(()=>{if(reduce())finish();}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();else if(visible)render();});
  document.addEventListener('movevi:destination',event=>focusCity(event.detail.key));
  markerButtons.forEach(button=>button.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('movevi:select-city',{detail:{key:button.dataset.globeCity}}))));
  canvas.addEventListener('keydown',event=>{
    if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
    event.preventDefault();finish();lon+=event.key==='ArrowRight'?18:-18;render();
  });
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;finish();drag={id:event.pointerId,x:event.clientX,y:event.clientY,lon};
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(event.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){drag=null;return;}
    lon=drag.lon-dx/Math.max(1,disc.clientWidth)*180;render();
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{drag=null;});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fail();});
  canvas.addEventListener('webglcontextrestored',()=>boot());
})();
