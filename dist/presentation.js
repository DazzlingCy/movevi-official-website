(() => {
  'use strict';
  const root=document.documentElement;
  const desktop=matchMedia('(min-width:901px)');
  const systemReduced=matchMedia('(prefers-reduced-motion: reduce)');
  const seen=new WeakSet(), active=new Set();
  const hero=document.querySelector('.hero-landscape');
  const portal=document.querySelector('.portal-section');
  let frame=0, prepared=false, enabled=false;
  const targets=[];
  const clamp=value=>Math.min(1,Math.max(0,value));
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.remove('present-pending');
      seen.add(entry.target);revealObserver.unobserve(entry.target);
    });
  },{threshold:.16});

  function titleLines(title){
    if(title.querySelector('.type-line'))return;
    const lines=[document.createDocumentFragment()];
    [...title.childNodes].forEach(node=>{
      if(node.nodeName==='BR'){node.remove();lines.push(document.createDocumentFragment());}
      else lines.at(-1).append(node);
    });
    lines.forEach((line,index)=>{
      const mask=document.createElement('span'),inner=document.createElement('span');
      mask.className='type-line';mask.style.setProperty('--line-index',index);
      inner.append(line);mask.append(inner);title.append(mask);
    });
  }
  function register(selector,kind,delay){
    document.querySelectorAll(selector).forEach(node=>{
      node.classList.add(`present-${kind}`);
      node.style.setProperty('--present-delay',`${delay}ms`);
      if(kind==='title')titleLines(node);
      targets.push(node);
    });
  }
  function prepare(){
    if(prepared)return;
    register('#main h1,#main h2','title',60);
    register('.intro-label,.chapter-label,.portal-heading>.eyebrow,.section-heading .eyebrow,.experience-copy>.eyebrow,.system-principles>.eyebrow,.hero-copy>.eyebrow','copy',0);
    register('.intro-body,.intro-ambition,.story-copy,.motivation-copy,.world-ambition,.steps,.system-grid>article>p,.validation-questions,.value-accordion,.benefit-cycle,.faq-list,.hero-description,.hero-world-target,.hero-copy>.button,.hero-bottom','copy',180);
    register('.intro-city,.motivation-visual,.globe-panel,.world-stage,.portal-window,.system-grid>article,.app-stage,.product-card-media,.validation-intro,.value-emblem,.benefits-grid>article,.faq-photo','media',100);
    prepared=true;
  }
  function render(){
    frame=0;
    if(!enabled||document.hidden)return;
    // Only intersecting scenes are read; there is no continuous animation loop.
    active.forEach(scene=>{
      const box=scene.getBoundingClientRect();
      if(scene===hero)scene.style.setProperty('--hero-exit',clamp(-box.top/box.height).toFixed(4));
      if(scene===portal)scene.querySelector('.portal-scene').style.setProperty('--portal-progress',clamp(-box.top/(box.height*.5)).toFixed(4));
    });
  }
  function schedule(){if(enabled&&!document.hidden&&!frame)frame=requestAnimationFrame(render);}
  const sceneObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting)active.add(entry.target);
      else active.delete(entry.target);
    });
    schedule();
  },{threshold:0});
  [hero,portal].filter(Boolean).forEach(scene=>sceneObserver.observe(scene));
  function sync(){
    enabled=desktop.matches&&!systemReduced.matches&&!root.classList.contains('reduce-motion');
    if(frame){cancelAnimationFrame(frame);frame=0;}
    if(enabled){
      prepare();root.classList.add('presentation-ready');
      targets.forEach(node=>{
        if(seen.has(node))return;
        const box=node.getBoundingClientRect();
        // Deep links and browser-restored scroll positions never re-hide earlier content.
        if(box.bottom<=0){seen.add(node);node.classList.remove('present-pending');return;}
        node.classList.add('present-pending');revealObserver.observe(node);
      });
      schedule();
    }else{
      revealObserver.disconnect();
      targets.forEach(node=>node.classList.remove('present-pending'));
      hero?.style.removeProperty('--hero-exit');
      portal?.querySelector('.portal-scene').style.removeProperty('--portal-progress');
    }
  }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  addEventListener('pageshow',schedule);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}
    else schedule();
  });
  document.addEventListener('focusin',event=>{
    // A focused link or control always brings its whole presentation group into view.
    const screen=event.target.closest('[data-screen]');
    if(!screen)return;
    screen.querySelectorAll('.present-pending').forEach(node=>{
      node.classList.remove('present-pending');seen.add(node);revealObserver.unobserve(node);
    });
  });
  desktop.addEventListener('change',sync);systemReduced.addEventListener('change',sync);
  let lastReduced=root.classList.contains('reduce-motion');
  new MutationObserver(()=>{
    const reduced=root.classList.contains('reduce-motion');
    if(reduced!==lastReduced){lastReduced=reduced;sync();}
  }).observe(root,{attributes:true,attributeFilter:['class']});
  sync();
})();
