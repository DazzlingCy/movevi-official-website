/* Scroll-driven shared image; never captures wheel or changes scroll position. */
(() => {
 'use strict';
 const root=document.documentElement,hero=document.querySelector('#vision'),brand=document.querySelector('#brand');
 const problem=brand?.querySelector('.problem-scene');
 const source=hero?.querySelector('[data-opening-source]'),target=problem?problem.querySelector('.problem-discover'):brand?.querySelector('.intro-city-main');
 if(!source||!target)return;
 const desktop=matchMedia('(min-width:901px) and (min-height:650px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const bridge=document.createElement('figure');bridge.className='opening-city-bridge';bridge.hidden=true;bridge.setAttribute('aria-hidden','true');
 const originCaption=source.querySelector('figcaption').cloneNode(true);originCaption.className='opening-origin-caption';
 const originImage=source.querySelector('img').cloneNode();originImage.className='opening-source-image';originImage.alt='';
 const wall=target.querySelector('.city-photo-wall');
 bridge.append(originImage);if(wall)bridge.append(wall.cloneNode(true));
 const destinationCaption=(target.querySelector('figcaption')||target.querySelector('.problem-card-copy')).cloneNode(true);
 if(problem)destinationCaption.className='opening-destination-caption';
 bridge.append(originCaption,destinationCaption);document.body.append(bridge);
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,t)=>a+(b-a)*t;
 let enabled=false,frame=0,leaving=false;
 function clear(){bridge.hidden=true;source.classList.remove('opening-in-transit');target.classList.remove('opening-in-transit');}
 function render(){
  frame=0;if(!enabled||document.hidden||leaving)return;
  const h=hero.getBoundingClientRect(),b=brand.getBoundingClientRect();
  const distance=b.top-h.top,p=clamp(-h.top/Math.max(1,distance)),t=ease(p);
  hero.style.setProperty('--opening-fade',ease(p/.8).toFixed(4));
  if(problem)brand.style.setProperty('--question-entry',ease((p-.25)/.6).toFixed(4));
  target.style.setProperty('--wall-exit',ease(-b.top/(innerHeight*.9)).toFixed(4));
  if(p<=.001||p>=.999){clear();return;}
  const from=source.getBoundingClientRect(),to=target.getBoundingClientRect();
  // Project the destination into its final pinned position, so it does not dip
  // below the viewport and then snap back up as the following section arrives.
  const y0=from.top-h.top,y1=to.top-Math.max(0,b.top);
  const r0=parseFloat(getComputedStyle(source).borderRadius)||18,r1=parseFloat(getComputedStyle(target).borderRadius)||28;
  Object.assign(bridge.style,{left:`${mix(from.left,to.left,t)}px`,top:`${mix(y0,y1,t)}px`,width:`${mix(from.width,to.width,t)}px`,height:`${mix(from.height,to.height,t)}px`,borderRadius:`${mix(r0,r1,t)}px`});
  bridge.style.setProperty('--bridge-caption',ease((p-.62)/.38).toFixed(4));
  bridge.style.setProperty('--bridge-origin',(1-ease(p/.3)).toFixed(4));
  bridge.style.setProperty('--wall-open',ease((p-.18)/.72).toFixed(4));
  bridge.style.setProperty('--wall-surface',ease((p-.18)/.25).toFixed(4));
  bridge.hidden=false;source.classList.add('opening-in-transit');target.classList.add('opening-in-transit');
 }
 function schedule(){if(enabled&&!document.hidden&&!leaving&&!frame)frame=requestAnimationFrame(render);}
 function sync(){
  enabled=desktop.matches&&!reduced.matches&&!root.classList.contains('reduce-motion');root.classList.toggle('opening-flow',enabled);
  if(!enabled){if(frame)cancelAnimationFrame(frame);frame=0;clear();hero.style.removeProperty('--opening-fade');target.style.removeProperty('--wall-exit');brand.style.removeProperty('--question-entry');}else schedule();
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
