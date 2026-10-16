/* Native-scroll handoff: the solution visual becomes the leftmost global-routes card. */
(() => {
 'use strict';
 const root=document.documentElement,solution=document.querySelector('#solution'),system=document.querySelector('#system');
 const source=solution?.querySelector('.voyage-window'),target=system?.querySelector('[data-system-route]');
 if(!source||!target)return;
 const desktop=matchMedia('(min-width:901px) and (min-height:650px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const bridge=document.createElement('div');bridge.className='system-image-bridge';bridge.hidden=true;bridge.setAttribute('aria-hidden','true');
 const origin=source.querySelector('.voyage-run-image').cloneNode(),destination=target.querySelector('img').cloneNode();
 origin.className='system-origin-image';destination.className='system-destination-image';origin.alt='';destination.alt='';destination.loading='eager';
 bridge.append(origin,destination);document.body.append(bridge);
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},range=(p,a,b)=>ease((p-a)/(b-a)),mix=(a,b,t)=>a+(b-a)*t;
 let enabled=false,frame=0,leaving=false;
 function clear(){bridge.hidden=true;source.classList.remove('system-in-transit');target.classList.remove('system-in-transit');}
 function render(){
  frame=0;if(!enabled||document.hidden||leaving)return;
  const s=system.getBoundingClientRect(),p=clamp(1-s.top/innerHeight);
  solution.style.setProperty('--system-exit',range(p,0,.65).toFixed(4));
  system.style.setProperty('--system-heading',range(p,.1,.55).toFixed(4));
  system.style.setProperty('--system-card-one',range(p,.32,.7).toFixed(4));
  system.style.setProperty('--system-card-two',range(p,.48,.83).toFixed(4));
  system.style.setProperty('--system-card-three',range(p,.62,.95).toFixed(4));
  system.style.setProperty('--system-card-four',range(p,.72,.98).toFixed(4));
  if(p<=.001||p>=.999){clear();return;}
  const from=source.getBoundingClientRect(),to=target.getBoundingClientRect(),sticky=solution.querySelector('.voyage-sticky').getBoundingClientRect();
  const t=ease(p),sourceTop=from.top-sticky.top,targetTop=to.top-s.top;
  Object.assign(bridge.style,{left:`${mix(from.left,to.left,t)}px`,top:`${mix(sourceTop,targetTop,t)}px`,width:`${mix(from.width,to.width,t)}px`,height:`${mix(from.height,to.height,t)}px`,borderRadius:`${mix(30,parseFloat(getComputedStyle(target).borderRadius)||28,t)}px`});
  bridge.style.setProperty('--system-border',`${mix(6,0,t)}px`);
  bridge.style.setProperty('--system-image-mix',range(p,.22,.82).toFixed(4));
  bridge.hidden=false;source.classList.add('system-in-transit');target.classList.add('system-in-transit');
 }
 function schedule(){if(enabled&&!document.hidden&&!leaving&&!frame)frame=requestAnimationFrame(render);}
 function sync(){
  enabled=desktop.matches&&!reduced.matches&&!root.classList.contains('reduce-motion');root.classList.toggle('system-flow',enabled);
  if(!enabled){if(frame)cancelAnimationFrame(frame);frame=0;clear();solution.style.removeProperty('--system-exit');['--system-heading','--system-card-one','--system-card-two','--system-card-three','--system-card-four'].forEach(key=>system.style.removeProperty(key));}else schedule();
 }
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',sync,{passive:true});
 desktop.addEventListener('change',sync);reduced.addEventListener('change',sync);
 let wasReduced=root.classList.contains('reduce-motion');
 new MutationObserver(()=>{const next=root.classList.contains('reduce-motion');if(next!==wasReduced){wasReduced=next;sync();}}).observe(root,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else schedule();});
 addEventListener('pagehide',()=>{leaving=true;clear();if(frame)cancelAnimationFrame(frame);frame=0;});
 addEventListener('pageshow',()=>{leaving=false;sync();});
 sync();
})();
