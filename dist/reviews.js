(() => {
  const section=document.querySelector('#reviews');
  if(!section)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false,manual=false;
  const reduce=()=>reduced.matches||document.documentElement.classList.contains('reduce-motion');
  function sync(){
    const simple=reduce();
    section.classList.toggle('reviews-static',simple||manual);
    section.classList.toggle('reviews-running',visible&&!document.hidden&&!manual&&!simple);
  }
  section.classList.add('reviews-enhanced');
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.12}).observe(section);
  reduced.addEventListener('change',sync);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',sync);
  addEventListener('pagehide',()=>section.classList.remove('reviews-running'));
  addEventListener('pageshow',sync);
  section.querySelectorAll('.review-stream-row').forEach(row=>row.addEventListener('keydown',event=>{
    if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;
    event.preventDefault();
    manual=true;sync();
    row.scrollBy({left:event.key==='ArrowRight'?320:-320,behavior:reduce()?'instant':'smooth'});
  }));
  section.querySelector('.reviews-stream').addEventListener('focusout',event=>{
    if(event.currentTarget.contains(event.relatedTarget))return;
    manual=false;
    section.querySelectorAll('.review-stream-row').forEach(row=>{row.scrollLeft=0;});
    sync();
  });
  sync();
})();
