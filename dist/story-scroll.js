/* Native scroll advances the two reasons; no wheel interception or forced snap. */
(() => {
 'use strict';
 const section=document.querySelector('#story'),motivation=document.querySelector('#motivation');
 if(!section||!motivation)return;
 const desktop=matchMedia('(min-width:901px) and (min-height:650px)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.documentElement;
 let enabled=false,visible=false,frame=0,last=-1;
 function render(){
  frame=0;if(!enabled||document.hidden)return;
  const box=section.getBoundingClientRect();
  const progress=Math.min(1,Math.max(0,-box.top/Math.max(1,box.height-innerHeight)));
  section.style.setProperty('--story-progress',progress.toFixed(4));
  const next=progress>=.45?1:0;
  if(next!==last){last=next;motivation.dispatchEvent(new CustomEvent('movevi:story-phase',{detail:{index:next}}));}
 }
 function schedule(){if(enabled&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(render);}
 function sync(){
  const next=desktop.matches&&!reduced.matches&&!root.classList.contains('reduce-motion');
  if(next===enabled)return;
  enabled=next;section.classList.toggle('is-scroll-story',enabled);
  if(frame)cancelAnimationFrame(frame);frame=0;last=-1;
  if(enabled)render();else section.style.removeProperty('--story-progress');
 }
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:0}).observe(section);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{sync();schedule();});
 addEventListener('pageshow',()=>{sync();render();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else schedule();});
 desktop.addEventListener('change',sync);reduced.addEventListener('change',sync);
 sync();
})();
