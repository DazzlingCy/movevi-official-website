/* Reveal in reading order on touch layouts without pinning or taking over scroll. */
(() => {
 const mobile=matchMedia('(max-width:900px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.documentElement;
 const targets=[...document.querySelectorAll('#brand .intro-label,#brand-title,#brand .intro-description,#brand .intro-bottom,#brand .intro-city,#brand .intro-ambition,.system-grid article,.benefits-grid article')];
 const seen=new WeakSet();
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.remove('is-waiting');seen.add(entry.target);observer.unobserve(entry.target);}
 }),{threshold:.12});
 function sync(){
  observer.disconnect();
  const active=mobile.matches&&!reduced.matches&&!root.classList.contains('reduce-motion');
  targets.forEach(node=>{
   node.classList.toggle('mobile-enter',active);
   const waiting=active&&!seen.has(node)&&node.getBoundingClientRect().top>innerHeight*.9;
   node.classList.toggle('is-waiting',waiting);
   if(waiting)observer.observe(node);
  });
  document.querySelector('.steps').setAttribute('aria-orientation',matchMedia('(max-width:600px)').matches?'horizontal':'vertical');
 }
 targets.forEach(node=>node.addEventListener('focusin',()=>{node.classList.remove('is-waiting');seen.add(node);}));
 mobile.addEventListener('change',sync);reduced.addEventListener('change',sync);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
 addEventListener('pageshow',sync);addEventListener('resize',sync,{passive:true});sync();
})();
