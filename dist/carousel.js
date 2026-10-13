(() => {
  'use strict';
  const section=document.querySelector('.city-carousel');
  if(!section)return;
  const slides=[...section.querySelectorAll('[data-cta-slide]')];
  const videos=slides.map(slide=>slide.querySelector('video'));
  const buttons=[...section.querySelectorAll('[data-cta-city]')];
  const toggle=section.querySelector('#cta-carousel-toggle');
  const cities=[
    {media:'nycRun',country:'NEW YORK / 美国',name:'纽约 · 河畔奔跑'},
    {media:'parisRun',country:'PARIS / 法国',name:'巴黎 · 街巷探索'}
  ];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:800px)');
  const connection=navigator.connection;
  let current=0,visible=false,paused=false,hovered=false,focused=false,optedIn=false,timer=0;
  const blocked=new Set();
  const reduce=()=>reduced.matches||document.documentElement.classList.contains('reduce-motion');
  const runnable=()=>visible&&!document.hidden&&!paused&&!reduce()&&(!connection?.saveData||optedIn);
  function clearTimer(){if(timer)clearTimeout(timer);timer=0;}
  function sync(){
    clearTimer();
    section.classList.toggle('is-static',reduce());
    videos.forEach((video,index)=>{
      if(index!==current||!runnable()){video.pause();if(reduce()||connection?.saveData&&!optedIn)video.classList.remove('is-playing');return;}
      if(blocked.has(index))return;
      const media=window.MOVEVI_MEDIA[cities[index].media],src=mobile.matches?media.mobile:media.src;
      if(video.dataset.loadedSource!==src){video.classList.remove('is-playing');video.src=src;video.dataset.loadedSource=src;}
      video.muted=true;
      if(!video.paused)return;
      video.play().then(()=>{
        if(index!==current||!runnable())video.pause();
        else video.classList.add('is-playing');
      }).catch(error=>{if(error.name!=='AbortError'){blocked.add(index);video.classList.remove('is-playing');}});
    });
    toggle.disabled=reduce();
    const stopped=paused||reduce()||connection?.saveData&&!optedIn;
    toggle.textContent=reduce()?'静态模式':stopped?'播放轮播 ▷':'暂停轮播 Ⅱ';
    toggle.setAttribute('aria-label',reduce()?'已减少动态效果，仍可手动切换城市':stopped?'播放城市跑步轮播':'暂停城市跑步轮播');
    if(runnable()&&!hovered&&!focused)timer=setTimeout(()=>select((current+1)%slides.length),8000);
  }
  function select(index,manual=false){
    current=index;
    slides.forEach((slide,i)=>slide.classList.toggle('is-active',i===current));
    buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));
    section.querySelector('#cta-city-country').textContent=cities[current].country;
    section.querySelector('#cta-city-name').textContent=cities[current].name;
    if(manual)section.querySelector('#cta-carousel-status').textContent=`已切换至${cities[current].name}`;
    sync();
  }
  buttons.forEach((button,index)=>{
    button.addEventListener('click',()=>select(index,true));
    button.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(index+1)%buttons.length;
      if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=buttons.length-1;
      if(next!==undefined){event.preventDefault();select(next,true);buttons[next].focus();}
    });
  });
  toggle.addEventListener('click',()=>{
    if(reduce())return;
    if(connection?.saveData&&!optedIn){optedIn=true;paused=false;}else paused=!paused;
    if(!paused)blocked.delete(current);
    sync();
  });
  videos.forEach((video,index)=>video.addEventListener('error',()=>{blocked.add(index);video.classList.remove('is-playing');}));
  const controls=section.querySelector('.cta-carousel-controls');
  controls.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;sync();}});
  controls.addEventListener('pointerleave',()=>{hovered=false;sync();});
  section.addEventListener('focusin',()=>{focused=true;sync();});
  section.addEventListener('focusout',event=>{if(!section.contains(event.relatedTarget)){focused=false;sync();}});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.25}).observe(section);
  document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  reduced.addEventListener('change',sync);mobile.addEventListener('change',sync);
  connection?.addEventListener?.('change',sync);
  controls.hidden=false;
  sync();
})();
