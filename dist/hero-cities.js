/* Scenic windows accompany the globe; footage is atmosphere, not route playback. */
(() => {
 'use strict';
 const stage=document.querySelector('.hero-city-window');
 if(!stage)return;
 const slides=[...stage.querySelectorAll('[data-hero-city]')];
 const videos=slides.map(slide=>slide.querySelector('video'));
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const desktop=matchMedia('(min-width:901px)');
 const connection=navigator.connection;
 const blocked=new Set();
 let index=0,visible=false,timer=0,epoch=0,leaving=false;
 const allowed=()=>visible&&!document.hidden&&!leaving&&!reduced.matches&&!root.classList.contains('reduce-motion')&&!connection?.saveData;
 function stopTimer(){clearTimeout(timer);timer=0;}
 async function sync(){
  stopTimer();const current=++epoch;
  slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===index);slide.setAttribute('aria-hidden',String(i!==index));if(i!==index||!allowed())videos[i].pause();});
  stage.dataset.city=slides[index].dataset.heroCity;
  if(!allowed()){stage.dataset.playback='paused';return;}
  timer=setTimeout(()=>{index=(index+1)%slides.length;sync();},12000);
  const video=videos[index],config=window.MOVEVI_MEDIA[slides[index].dataset.heroCity];
  if(!config||blocked.has(video)){stage.dataset.playback='poster';return;}
  if(!video.getAttribute('src')){video.src=(!desktop.matches&&config.mobile)||config.src;video.poster=config.poster;}
  video.muted=true;stage.dataset.playback='loading';
  try{
   await video.play();
   if(current!==epoch||!allowed()||video!==videos[index]){if(!allowed()||video!==videos[index])video.pause();return;}
   video.classList.add('is-playing');stage.dataset.playback='playing';
  }catch{if(current===epoch){blocked.add(video);video.classList.remove('is-playing');stage.dataset.playback='poster';}}
 }
 videos.forEach(video=>video.addEventListener('error',()=>{blocked.add(video);video.pause();video.classList.remove('is-playing');if(video===videos[index])stage.dataset.playback='poster';}));
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.15}).observe(stage);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',sync);desktop.addEventListener('change',sync);connection?.addEventListener?.('change',sync);
 window.addEventListener('pagehide',()=>{leaving=true;sync();});
 window.addEventListener('pageshow',()=>{leaving=false;sync();});
})();
