(() => {
 'use strict';
 const section=document.querySelector('.promo-finale');if(!section)return;
 const video=section.querySelector('video'),player=section.querySelector('.promo-player');
 const toggle=section.querySelector('#promo-toggle'),start=section.querySelector('#promo-start'),sound=section.querySelector('#promo-sound'),status=section.querySelector('#promo-status');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false,userPaused=false,optedIn=false,blocked=false,epoch=0,loaded=false;
 const reduced=()=>reduce.matches||document.documentElement.classList.contains('reduce-motion');
 function label(){const playing=!video.paused&&!video.ended;player.classList.toggle('is-playing',playing);start.hidden=playing;toggle.textContent=playing?'暂停':'播放';toggle.setAttribute('aria-label',playing?'暂停宣传片':'播放宣传片');sound.textContent=video.muted?'开启声音':'静音';sound.setAttribute('aria-pressed',String(!video.muted));sound.setAttribute('aria-label',video.muted?'开启宣传片声音':'静音宣传片');}
 function load(){if(loaded)return;const source=video.querySelector('source');source.src=source.dataset.src;video.load();loaded=true;}
 async function sync(explicit=false){const ticket=++epoch;if(!visible||document.hidden||userPaused||(video.ended&&explicit!==true)||(!optedIn&&(reduced()||navigator.connection?.saveData||blocked))){video.pause();label();return;}load();try{await video.play();if(ticket!==epoch&&(!visible||document.hidden||userPaused))video.pause();}catch(e){if(e.name!=='AbortError'){blocked=true;status.textContent='点击播放即可观看宣传片。';}}label();}
 function play(){optedIn=true;userPaused=false;blocked=false;if(video.ended)video.currentTime=0;sync(true);}
 start.addEventListener('click',play);
 toggle.addEventListener('click',()=>{if(video.paused)play();else{userPaused=true;++epoch;video.pause();label();}});
 section.querySelector('#promo-replay').addEventListener('click',()=>{load();video.currentTime=0;play();});
 sound.addEventListener('click',()=>{video.muted=!video.muted;label();});
 section.querySelector('#promo-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(player.requestFullscreen)await player.requestFullscreen();else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();}catch{status.textContent='当前浏览器不支持全屏，请使用播放器观看。';}});
 video.addEventListener('timeupdate',()=>{const seconds=Math.min(20,Math.floor(video.currentTime));section.querySelector('#promo-time').textContent=`00:${String(seconds).padStart(2,'0')} / 00:20`;section.querySelector('#promo-progress').style.width=`${Math.min(100,video.currentTime/20*100)}%`;});
 ['play','pause','ended','volumechange'].forEach(event=>video.addEventListener(event,label));
 video.addEventListener('error',()=>{blocked=true;status.textContent='视频暂时无法播放，请刷新后重试。';label();});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.3;sync();},{threshold:[0,.3]}).observe(player);
 document.addEventListener('visibilitychange',sync);
 reduce.addEventListener('change',()=>{optedIn=false;sync();});
 new MutationObserver(()=>{if(reduced())optedIn=false;sync();}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 navigator.connection?.addEventListener?.('change',sync);label();
 // Native scrolling gently opens the final film to the full viewport.
 let scrollFrame=0;
 function reveal(){scrollFrame=0;if(document.hidden)return;const top=section.getBoundingClientRect().top;const progress=Math.max(0,Math.min(1,(innerHeight-top)/innerHeight));section.style.setProperty('--promo-entry',String(progress*progress*(3-2*progress)));}
 function scheduleReveal(){if(!scrollFrame&&!document.hidden)scrollFrame=requestAnimationFrame(reveal);}
 addEventListener('scroll',scheduleReveal,{passive:true});addEventListener('resize',scheduleReveal,{passive:true});
 document.addEventListener('visibilitychange',scheduleReveal);reveal();
})();
