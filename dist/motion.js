(() => {
  'use strict';
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');

  const connection=navigator.connection;
  const control=document.querySelector('#motion-toggle');if(control)control.hidden=false;
  let userReduced=false;
  try{if(control)userReduced=localStorage.getItem('movevi-reduce-motion')==='true';}catch{}
  const reduce=()=>reduced.matches||userReduced;

  const controllers=new Map();
  document.querySelectorAll('video[data-media]').forEach(video=>{
    const button=document.querySelector(`[data-video-toggle="${video.id}"]`);
    const state={key:video.dataset.media,visible:false,occluded:false,userPaused:false,blocked:false,loadedKey:null,epoch:0};
    function label(){
      if(!button)return;
      const config=window.MOVEVI_MEDIA[state.key];button.hidden=!config;
      button.disabled=reduce();
      const playing=!video.paused&&!video.ended;
      button.textContent=reduce()?'动态已关闭':playing?'暂停影像 Ⅱ':'播放影像 ▷';
      button.setAttribute('aria-label',reduce()?'已减少动态效果':`${playing?'暂停':'播放'}${video.id==='portal-video'?'转场':''}${config?.label||'城市'}背景视频`);
    }
    async function sync(explicit=false){
      const epoch=++state.epoch,config=window.MOVEVI_MEDIA[state.key];
      if(!config||reduce()||!state.visible||state.occluded||document.hidden||state.userPaused||(!explicit&&(state.blocked||connection?.saveData))){video.pause();if(reduce()||connection?.saveData)video.classList.remove('is-playing');label();return;}
      if(state.loadedKey!==state.key){video.classList.remove('is-playing');video.poster=config.poster;video.src=matchMedia('(max-width:800px)').matches?config.mobile:config.src;video.setAttribute('aria-label',`${config.label}城市氛围影像`);state.loadedKey=state.key;}
      video.muted=true;
      try{await video.play();if(epoch===state.epoch){video.classList.add('is-playing');label();}}catch(error){if(epoch===state.epoch&&error?.name!=="AbortError"){state.blocked=true;label();}}
    }
    button?.addEventListener('click',()=>{if(reduce())return;if(!video.paused){state.userPaused=true;++state.epoch;video.pause();label();}else{state.userPaused=false;state.blocked=false;sync(true);}});
    video.addEventListener('playing',()=>{video.classList.add('is-playing');label();});video.addEventListener('pause',label);
    video.addEventListener('error',()=>{state.blocked=true;video.classList.remove('is-playing');label();});
    const observer=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;sync();},{threshold:.1});observer.observe(video.closest('.media-stage'));
    controllers.set(video.id,{sync,occlude(value){state.occluded=value;sync();},change(key){++state.epoch;video.pause();video.classList.remove('is-playing');state.key=key;state.blocked=false;if(!window.MOVEVI_MEDIA[key]){video.removeAttribute('src');video.load();state.loadedKey=null;}label();sync();}});label();
  });
  document.addEventListener('movevi:portal-visibility',event=>controllers.get('portal-video')?.occlude(event.detail.occluded));
  document.addEventListener('movevi:destination',event=>controllers.get('world-video')?.change(event.detail.key));
  document.addEventListener('visibilitychange',()=>controllers.forEach(c=>c.sync()));
  connection?.addEventListener?.('change',()=>controllers.forEach(c=>c.sync()));

  const reveals=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('awaiting');reveals.unobserve(entry.target);}}),{threshold:.1});
  document.querySelectorAll('[data-reveal]').forEach(el=>{el.classList.add('awaiting');reveals.observe(el);});
  function applyPreference(){root.classList.toggle('reduce-motion',reduce());if(control){control.setAttribute('aria-pressed',String(reduce()));control.disabled=reduced.matches;control.textContent=reduced.matches?'已跟随系统减少动态':userReduced?'恢复动态效果':'减少动态效果';}controllers.forEach(c=>c.sync());}
  control?.addEventListener('click',()=>{userReduced=!userReduced;try{localStorage.setItem('movevi-reduce-motion',String(userReduced));}catch{}applyPreference();});reduced.addEventListener('change',applyPreference);
  document.addEventListener('movevi:step',()=>{if(!reduce())document.querySelector('#app-screen').animate([{opacity:.15,transform:'scale(1.035) translateY(6px)'},{opacity:1,transform:'scale(1) translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});});
  root.classList.add('motion-ready');applyPreference();
})();
