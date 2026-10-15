/* CSS compositor loops run only while the photo wall is visible and settled. */
(() => {
 'use strict';
 const scene=document.querySelector('#brand .city-wall-scene');if(!scene)return;
 const button=scene.querySelector('.city-wall-toggle'),root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false,paused=false,leaving=false;
 function sync(){
  const staticMode=reduced.matches||root.classList.contains('reduce-motion');
  const travelling=scene.classList.contains('opening-in-transit')||!!scene.querySelector('.voyage-in-transit')||scene.closest('#brand').classList.contains('is-question-phase');
  const running=visible&&!paused&&!leaving&&!document.hidden&&!staticMode&&!travelling;
  if(scene.classList.contains('is-wall-playing')!==running)scene.classList.toggle('is-wall-playing',running);
  if(button){button.hidden=staticMode;button.textContent=paused?'继续流动 ▷':'暂停流动 Ⅱ';button.setAttribute('aria-label',paused?'继续照片流动':'暂停照片流动');button.setAttribute('aria-pressed',String(paused));}
 }
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.3;sync();},{threshold:[0,.3]}).observe(scene);
 button?.addEventListener('click',()=>{paused=!paused;sync();});
 new MutationObserver(sync).observe(scene,{subtree:true,attributes:true,attributeFilter:['class']});
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
 new MutationObserver(sync).observe(scene.closest('#brand'),{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 addEventListener('pagehide',()=>{leaving=true;sync();});addEventListener('pageshow',()=>{leaving=false;sync();});sync();
})();
