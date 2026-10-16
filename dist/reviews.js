(() => {
  const section=document.querySelector('#reviews');
  const button=document.querySelector('#reviews-toggle');
  if(!section||!button)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false,paused=false,manual=false;
  const reduce=()=>reduced.matches||document.documentElement.classList.contains('reduce-motion');
  function sync(){
    const simple=reduce();
    section.classList.toggle('reviews-static',simple||manual);
    section.classList.toggle('reviews-running',visible&&!document.hidden&&!paused&&!simple);
    button.hidden=simple;
    button.setAttribute('aria-pressed',String(paused));
    button.textContent=paused?'继续流动 ▷':'暂停流动 Ⅱ';
  }
  section.classList.add('reviews-enhanced');
  button.addEventListener('click',()=>{paused=!paused;if(!paused){manual=false;section.querySelectorAll('.review-stream-row').forEach(row=>{row.scrollLeft=0;});}sync();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.12}).observe(section);
  reduced.addEventListener('change',sync);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',sync);
  addEventListener('pagehide',()=>section.classList.remove('reviews-running'));
  addEventListener('pageshow',sync);
  section.querySelectorAll('.review-stream-row').forEach(row=>row.addEventListener('keydown',event=>{
    if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;
    event.preventDefault();
    paused=true;manual=true;sync();
    row.scrollBy({left:event.key==='ArrowRight'?320:-320,behavior:reduce()?'instant':'smooth'});
  }));
  sync();
})();
