/* The Paris invitation opens into the world; native scroll remains in control. */
(() => {
 'use strict';
 const root=document.documentElement,question=document.querySelector('#brand'),solution=document.querySelector('#solution');
 const source=question?.querySelector('.problem-discover'),target=solution?.querySelector('.solution-city-wall');
 if(!source||!target)return;
 const desktop=matchMedia('(min-width:901px) and (min-height:650px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const bridge=document.createElement('figure');bridge.className='question-city-bridge';bridge.hidden=true;bridge.setAttribute('aria-hidden','true');
 const image=source.querySelector('img').cloneNode();image.className='question-origin-image';image.alt='';
 const wall=target.querySelector('.city-photo-wall').cloneNode(true);
 const originCaption=source.querySelector('.problem-card-copy').cloneNode(true);originCaption.className='question-origin-copy';
 const caption=target.querySelector('figcaption').cloneNode(true);
 bridge.append(wall,image,originCaption,caption);document.body.append(bridge);
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},range=(p,a,b)=>ease((p-a)/(b-a)),mix=(a,b,t)=>a+(b-a)*t;
 let enabled=false,frame=0,leaving=false;
 function clear(){
  bridge.hidden=true;source.classList.remove('question-in-transit');target.classList.remove('question-in-transit');solution.classList.remove('question-arriving');
 }
 function freezeTracks(){
  // Copy the paused phase, so the mosaic neither jumps nor restarts on landing.
  const tracks=target.querySelectorAll('.city-wall-track');
  wall.querySelectorAll('.city-wall-track').forEach((track,i)=>{
   track.style.animation='none';track.style.transform=getComputedStyle(tracks[i]).transform;
  });
 }
 function render(){
  frame=0;if(!enabled||document.hidden||leaving)return;
  const s=solution.getBoundingClientRect(),p=clamp(1-s.top/innerHeight);
  question.style.setProperty('--question-leave',range(p,.02,.5).toFixed(4));
  if(p<=.001||p>=.999){clear();return;}
  if(bridge.hidden){target.classList.add('question-in-transit');freezeTracks();}
  solution.classList.add('question-arriving');
  // Untransformed section coordinates keep forward and reverse travel identical.
  const from=source.getBoundingClientRect(),q=question.getBoundingClientRect(),to=target.getBoundingClientRect();
  const t=ease(p),y0=from.top-q.top,y1=to.top-Math.max(0,s.top);
  Object.assign(bridge.style,{left:`${mix(from.left,to.left,t)}px`,top:`${mix(y0,y1,t)}px`,width:`${mix(from.width,to.width,t)}px`,height:`${mix(from.height,to.height,t)}px`,borderRadius:`${mix(26,28,t)}px`});
  bridge.style.setProperty('--question-mosaic',range(p,.18,.8).toFixed(4));
  bridge.style.setProperty('--question-origin',(1-range(p,.06,.36)).toFixed(4));
  bridge.style.setProperty('--question-caption',range(p,.65,.97).toFixed(4));
  solution.style.setProperty('--question-title',range(p,.4,.9).toFixed(4));
  solution.style.setProperty('--question-offset',`${Math.max(0,s.top)}px`);
  bridge.hidden=false;source.classList.add('question-in-transit');
 }
 function schedule(){if(enabled&&!document.hidden&&!leaving&&!frame)frame=requestAnimationFrame(render);}
 function sync(){
  enabled=desktop.matches&&!reduced.matches&&!root.classList.contains('reduce-motion');root.classList.toggle('question-flow',enabled);
  if(!enabled){if(frame)cancelAnimationFrame(frame);frame=0;clear();question.style.removeProperty('--question-leave');solution.style.removeProperty('--question-title');solution.style.removeProperty('--question-offset');}else schedule();
 }
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',sync,{passive:true});
 desktop.addEventListener('change',sync);reduced.addEventListener('change',sync);
 let wasReduced=root.classList.contains('reduce-motion');
 new MutationObserver(()=>{const next=root.classList.contains('reduce-motion');if(next!==wasReduced){wasReduced=next;sync();}}).observe(root,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else schedule();});
 addEventListener('pagehide',()=>{leaving=true;clear();if(frame)cancelAnimationFrame(frame);frame=0;});
 addEventListener('pageshow',()=>{leaving=false;sync();});sync();
})();
