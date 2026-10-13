/* Staggered native-scroll reveal. Static content is fully readable without JS. */
(() => {
 'use strict';
 const section=document.querySelector('#brand');
 if(!section)return;
 const desktop=matchMedia('(min-width:901px) and (min-height:650px)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.documentElement;
 const groups=[
  ['.intro-label',0,.16],['#brand-title',.08,.32],['.intro-city-main',.2,.53],
  ['.intro-description',.35,.58],['.intro-city-small',.48,.72],
  ['.intro-bottom',.55,.8],['.intro-ambition',.65,.9]
 ].map(([selector,start,end])=>({node:section.querySelector(selector),start,end})).filter(group=>group.node);
 let enabled=false,visible=false,frame=0,focusReveal=false;
 const clamp=value=>Math.min(1,Math.max(0,value));
 function render(){
  frame=0;if(!enabled||document.hidden)return;
  const progress=clamp((innerHeight*.35-section.getBoundingClientRect().top)/(innerHeight*1.05));
  section.style.setProperty('--brand-progress',progress.toFixed(4));
  for(const {node,start,end} of groups){
   const raw=focusReveal?1:clamp((progress-start)/(end-start));
   const value=raw*raw*(3-2*raw);
   node.style.setProperty('--brand-reveal',value.toFixed(4));
   node.classList.toggle('brand-reveal-hidden',value<.15);
  }
 }
 function schedule(){if(enabled&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(render);}
 function sync(){
  const next=desktop.matches&&!reduced.matches&&!root.classList.contains('reduce-motion');
  if(next===enabled)return;
  enabled=next;section.classList.toggle('is-scroll-brand',enabled);
  if(frame)cancelAnimationFrame(frame);frame=0;
  if(enabled)render();else{section.style.removeProperty('--brand-progress');groups.forEach(({node})=>{node.style.removeProperty('--brand-reveal');node.classList.remove('brand-reveal-hidden');});}
 }
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:0}).observe(section);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{sync();schedule();});
 addEventListener('pageshow',()=>{sync();render();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else schedule();});
 // Keyboard navigation reveals the whole scene before a link receives focus.
 section.addEventListener('focusin',()=>{focusReveal=true;render();});
 section.addEventListener('focusout',event=>{if(!section.contains(event.relatedTarget)){focusReveal=false;schedule();}});
 desktop.addEventListener('change',sync);reduced.addEventListener('change',sync);
 sync();
})();
