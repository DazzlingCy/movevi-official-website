/* A few quiet windows reveal more destinations without crowding the globe. */
(() => {
 const hero=document.querySelector('.hero-visual');
 const groups=[...document.querySelectorAll('[data-landmark-rotation]')].map(group=>[...group.querySelectorAll('.landmark-scene')]);
 if(!hero||!groups.length)return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),connection=navigator.connection;
 let visible=false,timer=0,step=0,leaving=false;
 function sync(){
  clearTimeout(timer);
  if(!visible||document.hidden||leaving||preference.matches||connection?.saveData||document.documentElement.classList.contains('reduce-motion'))return;
  timer=setTimeout(()=>{
   const group=groups[step%groups.length],current=group.findIndex(scene=>scene.classList.contains('is-active'));
   group.forEach((scene,i)=>{const active=i===(current+1)%group.length;scene.classList.toggle('is-active',active);scene.setAttribute('aria-hidden',String(!active));});
   step++;sync();
  },6500);
 }
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.15}).observe(hero);
 document.addEventListener('visibilitychange',sync);preference.addEventListener('change',sync);connection?.addEventListener?.('change',sync);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 addEventListener('pagehide',()=>{leaving=true;sync();});addEventListener('pageshow',()=>{leaving=false;sync();});
})();
