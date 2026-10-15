/* Reversible entrance and exit, driven by native scroll; no pinned spacer. */
(() => {
 'use strict';
 const scene=document.querySelector('#experience');if(!scene)return;
 const principles=document.querySelector('#system .system-principles');
 const root=document.documentElement,desktop=matchMedia('(min-width:901px) and (min-height:650px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const items=[['.comparison-heading',0,0],['.comparison-watch',.06,-1],['.comparison-movevi',.14,1],['.comparison-reasons',.22,0],['.comparison-note',.25,0]].map(([selector,delay,side])=>({node:scene.querySelector(selector),delay,side,y:0})).filter(item=>item.node);
 const smooth=(x)=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 let enabled=false,frame=0,leaving=false;
 function render(){
  frame=0;if(!enabled||document.hidden||leaving)return;
  const height=innerHeight,box=scene.getBoundingClientRect();
  // Share the same scroll boundary: the concept cards close as the comparison opens.
  if(principles){
   const progress=desktop.matches?smooth((1-box.top/height-.06)/.78):0;
   principles.style.setProperty('--comparison-handoff',progress.toFixed(4));
   principles.style.setProperty('--comparison-copy-exit',(desktop.matches?smooth((1-box.top/height)/.48):0).toFixed(4));
  }
  items.forEach(item=>{
   let enter,exit;
   if(desktop.matches){const arrival=1-box.top/height;enter=smooth((arrival-(.08+item.delay))/(.68-item.delay));exit=smooth((-box.top/height-.10-item.delay*.3)/.66);}
   else{const rect=item.node.getBoundingClientRect(),top=rect.top-item.y;enter=smooth((height-top)/(height*.35));exit=smooth((-top-rect.height*.55)/Math.max(100,rect.height*.45));}
   const distance=desktop.matches?46:18;
   item.y=(1-enter)*distance-exit*24;
   const x=desktop.matches?item.side*((1-enter)*54-exit*32):0;
   const scale=item.side?1-(1-enter)*.045-exit*.045:1;
   item.node.style.setProperty('--experience-opacity',(enter*(1-exit*.95)).toFixed(4));
   item.node.style.setProperty('--experience-x',`${x.toFixed(2)}px`);
   item.node.style.setProperty('--experience-y',`${item.y.toFixed(2)}px`);
   item.node.style.setProperty('--experience-scale',scale.toFixed(4));
  });
 }
 function schedule(){if(enabled&&!document.hidden&&!leaving&&!frame)frame=requestAnimationFrame(render);}
 function sync(){enabled=!reduced.matches&&!root.classList.contains('reduce-motion');scene.classList.toggle('experience-scroll-motion',enabled);principles?.classList.toggle('comparison-handoff',enabled&&desktop.matches);if(!enabled){if(frame)cancelAnimationFrame(frame);frame=0;principles?.style.removeProperty('--comparison-handoff');principles?.style.removeProperty('--comparison-copy-exit');items.forEach(item=>{['opacity','x','y','scale'].forEach(key=>item.node.style.removeProperty(`--experience-${key}`));item.y=0;});}else schedule();}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',sync,{passive:true});desktop.addEventListener('change',sync);reduced.addEventListener('change',sync);
 let previousReduced=root.classList.contains('reduce-motion');new MutationObserver(()=>{const next=root.classList.contains('reduce-motion');if(next!==previousReduced){previousReduced=next;sync();}}).observe(root,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else schedule();});
 addEventListener('pagehide',()=>{leaving=true;if(frame)cancelAnimationFrame(frame);frame=0;});addEventListener('pageshow',()=>{leaving=false;sync();});
 sync();
})();
