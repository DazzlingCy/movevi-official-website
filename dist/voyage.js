/* Native scroll only. No wheel handlers, scroll locking, or continuous RAF loop. */
(() => {
  'use strict';
  const root=document.documentElement;
  const oneScreen=document.body?.classList.contains("screens-v40");
  const desktop=matchMedia('(min-width:901px) and (min-height:650px)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const hero=document.querySelector('#vision');
  const solution=document.querySelector('#solution');
  const stage=solution?.querySelector('.voyage-stage');
  if(!hero||!solution||!stage)return;
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const range=(p,a,b)=>ease((p-a)/(b-a));
  const lerp=(a,b,t)=>a+(b-a)*t;
  let enabled=false,frame=0,leaving=false;
  let occluded=false;
  let source=document.querySelector('#curiosity [data-city="tokyo"]')||document.querySelector('#curiosity .intro-city-small');
  const windowNode=stage.querySelector('.voyage-window');
  const handoff=document.createElement('div');
  handoff.className='voyage-handoff';handoff.setAttribute('aria-hidden','true');handoff.hidden=true;
  const handoffImage=document.createElement('img');handoffImage.src='assets/video/tokyo-poster.webp';handoffImage.alt='';handoff.append(handoffImage);document.body.append(handoff);
  function videoOccluded(value){
    if(value===occluded)return;occluded=value;
    document.dispatchEvent(new CustomEvent('movevi:portal-visibility',{detail:{occluded:value}}));
  }
  function clearHandoff(){handoff.hidden=true;source?.classList.remove('voyage-in-transit');windowNode.classList.remove('voyage-in-transit');}
  const visible=new Set();
  const arrivals=[];
  function add(selector,kind='copy',delay=0){
    document.querySelectorAll(selector).forEach((node,index)=>{
      node.dataset.arrival=kind;
      arrivals.push({node,delay:delay+index*.035});
    });
  }
  add('#story .chapter-label,#story-title,#system .system-heading,.experience-copy>h2,#world .section-heading>div:first-child,#benefits-title,#products .section-heading,.trust-heading','copy');
  add('#story .story-copy,.experience-copy>.section-description,.world-content-intro,.benefit-cycle','copy',.07);
  add('#story .motivation,.experience .app-stage,.trust-scene','image',.08);
  add('.system-grid>article','image',.06);
  add('.experience .steps,.world-content-scale,.value-accordion','copy',.1);
  add('.benefits-grid>article','image',.08);
  if(oneScreen){
    add('#curiosity .intro-label,#brand-title,#curiosity .intro-description','compact-copy');
    add('#curiosity .intro-city-main,#curiosity .intro-city-small,#curiosity .intro-ambition','compact-image');
    add('#products .product-tabs','copy',.06);
    add('#products #product-panel','image',.16);
    add('.trust-checks','copy',.17);
  }
  document.querySelectorAll('.system-grid>article').forEach((node,i)=>node.style.setProperty('--fan-x',`${(1-i)*45}px`));
  const atlas=document.querySelector('#world');
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);});schedule();
  },{rootMargin:'100px 0px',threshold:0});
  [hero,solution,atlas,...arrivals.map(item=>item.node)].filter(Boolean).forEach(node=>observer.observe(node));

  function render(){
    frame=0;if(!enabled||document.hidden||leaving)return;
    if(visible.has(hero))hero.style.setProperty('--opening-progress',clamp(-hero.getBoundingClientRect().top/innerHeight).toFixed(4));
    if(desktop.matches&&(visible.has(solution)||!handoff.hidden)){
      const rect=solution.getBoundingClientRect();
      const p=clamp(-rect.top/Math.max(1,rect.height-innerHeight));
      solution.style.setProperty('--handoff-copy',range(1-rect.top/(innerHeight*.62),.9,1).toFixed(4));
      const expand=range(p,0,.2), fold=range(p,.25,.55), hardware=range(p,.68,.88);
      const box=stage.getBoundingClientRect();
      const phoneHeight=Math.min(box.height*.95,520),phoneWidth=phoneHeight*390/844;
      stage.style.setProperty('--window-left',`${lerp(lerp(box.width*.17,0,expand),box.width*.65,fold)}px`);
      stage.style.setProperty('--window-top',`${lerp(box.height*.08,box.height*.025,fold)}px`);
      stage.style.setProperty('--window-width',`${lerp(lerp(box.width*.66,box.width,expand),phoneWidth,fold)}px`);
      stage.style.setProperty('--window-height',`${lerp(box.height*.84,phoneHeight,fold)}px`);
      stage.style.setProperty('--window-radius',`${lerp(28,30,fold)}px`);
      stage.style.setProperty('--window-border',`${fold*6}px`);
      stage.style.setProperty('--route-opacity',range(p,.4,.56).toFixed(4));
      stage.style.setProperty('--run-opacity',range(p,.69,.8).toFixed(4));
      stage.style.setProperty('--city-opacity',(1-range(p,.48,.6)).toFixed(4));
      stage.style.setProperty('--city-caption',(1-range(p,.22,.38)).toFixed(4));
      stage.style.setProperty('--hardware-opacity',hardware.toFixed(4));
      solution.dataset.voyagePhase=p<.38?'city':p<.72?'route':'hardware';
      solution.querySelectorAll('.voyage-stops li').forEach((node,i)=>node.classList.toggle('is-current',i===(p<.38?0:p<.72?1:2)));
      const inTransit=source&&rect.top>0&&rect.top<innerHeight*.62;
      if(inTransit){
        if(handoff.hidden){
          const wall=document.querySelector('#curiosity .city-wall-scene');
          if(wall){
            const bounds=wall.getBoundingClientRect();
            const area=node=>{const r=node.getBoundingClientRect();return Math.max(0,Math.min(r.right,bounds.right)-Math.max(r.left,bounds.left))*Math.max(0,Math.min(r.bottom,bounds.bottom)-Math.max(r.top,bounds.top));};
            source=[...wall.querySelectorAll('[data-city="tokyo"]')].sort((a,b)=>area(b)-area(a))[0]||source;
            wall.classList.remove('is-wall-playing');
          }
        }
        const from=source.getBoundingClientRect(),to=windowNode.getBoundingClientRect();
        const t=ease(1-rect.top/(innerHeight*.62));
        handoff.hidden=false;source.classList.add('voyage-in-transit');windowNode.classList.add('voyage-in-transit');
        Object.assign(handoff.style,{left:`${lerp(from.left,to.left,t)}px`,top:`${lerp(from.top,to.top,t)}px`,width:`${lerp(from.width,to.width,t)}px`,height:`${lerp(from.height,to.height,t)}px`,borderRadius:'28px'});
      }else clearHandoff();
      videoOccluded(!!inTransit||p>=.6);
    }
    if(atlas&&visible.has(atlas))atlas.style.setProperty('--atlas-arrival',range((innerHeight-atlas.getBoundingClientRect().top)/innerHeight,.1,.85).toFixed(4));
    for(const {node,delay} of arrivals){
      if(!visible.has(node))continue;
      if(node.dataset.arrival.startsWith('compact-')&&desktop.matches)continue;
      // OffsetTop geometry is unaffected by the reveal's own transform.
      const rect=node.getBoundingClientRect();
      const current=parseFloat(node.style.getPropertyValue('--arrival')||'1');
      const originalTop=rect.top-(1-current)*(node.dataset.arrival==='image'?42:30);
      const section=oneScreen&&desktop.matches?node.closest("[data-screen]"):null;
      const value=section?range((innerHeight-section.getBoundingClientRect().top)/innerHeight,.16+delay,.72+delay):range((innerHeight-originalTop)/innerHeight,.08+delay,.4+delay);
      node.style.setProperty('--arrival',value.toFixed(4));
    }
  }
  function schedule(){if(enabled&&!document.hidden&&!leaving&&!frame)frame=requestAnimationFrame(render);}
  function sync(){
    const next=!reduced.matches&&!root.classList.contains('reduce-motion');
    solution.classList.toggle('is-voyage',next&&desktop.matches);
    if(!desktop.matches){clearHandoff();videoOccluded(false);stage.removeAttribute('style');solution.style.removeProperty('--handoff-copy');}
    if(next===enabled){schedule();return;}
    enabled=next;root.classList.toggle('voyage-motion',enabled);
    if(frame){cancelAnimationFrame(frame);frame=0;}
    if(!enabled){
      clearHandoff();videoOccluded(false);
      stage.removeAttribute('style');hero.style.removeProperty('--opening-progress');
      solution.style.removeProperty('--handoff-copy');
      arrivals.forEach(({node})=>node.style.removeProperty('--arrival'));
      atlas?.style.removeProperty('--atlas-arrival');
    }else schedule();
  }
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{sync();schedule();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else schedule();});
  addEventListener('pagehide',()=>{leaving=true;if(frame)cancelAnimationFrame(frame);frame=0;});
  addEventListener('pageshow',()=>{leaving=false;sync();});
  document.addEventListener('focusin',event=>{
    const node=event.target.closest('[data-arrival]');if(node)node.style.setProperty('--arrival','1');
  });
  desktop.addEventListener('change',sync);reduced.addEventListener('change',sync);
  let lastReduced=root.classList.contains('reduce-motion');
  new MutationObserver(()=>{const next=root.classList.contains('reduce-motion');if(next!==lastReduced){lastReduced=next;sync();}}).observe(root,{attributes:true,attributeFilter:['class']});
  sync();
})();
