(() => {
 'use strict';
 const section=document.querySelector('.promo-finale');if(!section)return;
 const video=section.querySelector('video'),player=section.querySelector('.promo-player');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false,loaded=false,epoch=0;
 const shouldPlay=()=>visible&&!document.hidden&&!reduce.matches&&!document.documentElement.classList.contains('reduce-motion')&&!navigator.connection?.saveData;
 async function sync(){
  const ticket=++epoch;
  if(!shouldPlay()){video.pause();return;}
  if(!loaded){const source=video.querySelector('source');source.src=source.dataset.src;video.load();loaded=true;}
  video.muted=true;video.loop=true;
  try{await video.play();if(ticket!==epoch&&!shouldPlay())video.pause();}catch{/* Keep the poster when autoplay is unavailable. */}
 }
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.3;sync();},{threshold:[0,.3]}).observe(player);
 document.addEventListener('visibilitychange',sync);
 reduce.addEventListener('change',sync);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 navigator.connection?.addEventListener?.('change',sync);
 // Native scrolling gently opens the final film to the full viewport.
 let scrollFrame=0;
 function reveal(){scrollFrame=0;if(document.hidden)return;const top=section.getBoundingClientRect().top;const progress=Math.max(0,Math.min(1,(innerHeight-top)/innerHeight));section.style.setProperty('--promo-entry',String(progress*progress*(3-2*progress)));}
 function scheduleReveal(){if(!scrollFrame&&!document.hidden)scrollFrame=requestAnimationFrame(reveal);}
 addEventListener('scroll',scheduleReveal,{passive:true});addEventListener('resize',scheduleReveal,{passive:true});
 document.addEventListener('visibilitychange',scheduleReveal);reveal();
})();
