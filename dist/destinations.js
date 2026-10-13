(() => {
 'use strict';
 const section=document.querySelector('.world-destinations'),deck=section?.querySelector('.destination-deck');
 if(!deck)return;
 const viewport=deck.querySelector('.destination-viewport'),cards=[...deck.querySelectorAll('[data-city-card]')];
 const videos=cards.map(card=>card.querySelector('video')),toggles=cards.map(card=>card.querySelector('.destination-video-toggle'));
 const choices=[...deck.querySelectorAll('[data-city-index]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),connection=navigator.connection;
 const blocked=new Set();let current=0,visible=false,paused=false,optedIn=false,epoch=0,drag=null,suppressClick=0;
 const reduce=()=>reduced.matches||document.documentElement.classList.contains('reduce-motion');
 const runnable=()=>visible&&!document.hidden&&!paused&&!reduce()&&(!connection?.saveData||optedIn);
 function label(){
  toggles.forEach((button,index)=>{
   button.hidden=index!==current;button.disabled=reduce();
   const playing=!videos[index].paused;
   button.textContent=reduce()?'静态画面':playing?'暂停影像 Ⅱ':'播放影像 ▷';
   button.setAttribute('aria-label',`${reduce()?'静态画面':playing?'暂停':'播放'}${cards[index].getAttribute('aria-label')}运动视频`);
  });
 }
 function sync(){
  const ticket=++epoch;
  videos.forEach((video,index)=>{
   if(index!==current||!runnable()){video.pause();if(index!==current||reduce()||connection?.saveData&&!optedIn)video.classList.remove('is-playing');return;}
   if(blocked.has(index))return;
   const media=window.MOVEVI_MEDIA[cards[index].dataset.cityMedia];
   if(!media)return;
   if(!video.getAttribute('src')){video.src=media.src;video.muted=true;}
   if(!video.paused)return;
   video.play().then(()=>{if(ticket!==epoch||index!==current||!runnable()){if(index!==current||!runnable())video.pause();return;}video.classList.add('is-playing');label();}).catch(error=>{if(ticket===epoch&&error.name!=='AbortError'){blocked.add(index);video.classList.remove('is-playing');label();}});
  });label();
 }
 function select(index){
  current=(index+cards.length)%cards.length;
  cards.forEach((card,i)=>{
   let slot=(i-current+cards.length)%cards.length;if(slot>cards.length/2)slot-=cards.length;
   card.style.setProperty('--slot',slot);card.dataset.position=slot<0?'previous':slot>0?'next':'current';card.classList.toggle('is-active',i===current);
   card.querySelector('.destination-select').hidden=i===current;
  });
  choices.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));
  deck.querySelector('#destination-count').textContent=`${String(current+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
  sync();
 }
 choices.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
 cards.forEach((card,i)=>card.querySelector('.destination-select').addEventListener('click',()=>select(i)));
 deck.querySelector('[data-city-prev]').addEventListener('click',()=>select(current-1));
 deck.querySelector('[data-city-next]').addEventListener('click',()=>select(current+1));
 deck.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();select(current+(event.key==='ArrowLeft'?-1:1));}});
 toggles.forEach((button,i)=>button.addEventListener('click',()=>{
  if(reduce())return;
  if(videos[i].paused){paused=false;optedIn=true;blocked.delete(i);}else paused=true;
  sync();
 }));
 videos.forEach((video,i)=>{
  video.addEventListener('playing',()=>{if(i!==current||!runnable())video.pause();else video.classList.add('is-playing');label();});
  video.addEventListener('pause',label);
  video.addEventListener('error',()=>{blocked.add(i);video.classList.remove('is-playing');label();});
 });
 viewport.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.target.closest('.destination-video-toggle'))return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,started:false};
 });
 viewport.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.started){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){drag=null;return;}if(Math.abs(dx)<8)return;drag.started=true;viewport.setPointerCapture(event.pointerId);deck.classList.add('is-dragging');}
  drag.dx=dx;viewport.style.setProperty('--drag-offset',`${Math.max(-240,Math.min(240,dx))}px`);
 });
 function finish(event,cancelled=false){
  if(!drag||event.pointerId!==drag.id)return;
  const action=drag;drag=null;deck.classList.remove('is-dragging');viewport.style.removeProperty('--drag-offset');
  if(viewport.hasPointerCapture(action.id))viewport.releasePointerCapture(action.id);
  if(action.started){suppressClick=Date.now()+350;if(!cancelled&&Math.abs(action.dx)>60)select(current+(action.dx<0?1:-1));}
 }
 viewport.addEventListener('pointerup',event=>finish(event));viewport.addEventListener('pointercancel',event=>finish(event,true));viewport.addEventListener('lostpointercapture',event=>finish(event,true));
 viewport.addEventListener('click',event=>{if(Date.now()<suppressClick){event.preventDefault();event.stopImmediatePropagation();}},true);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.25}).observe(viewport);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&drag)finish({pointerId:drag.id},true);sync();});
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 reduced.addEventListener('change',sync);connection?.addEventListener?.('change',sync);
 viewport.tabIndex=0;viewport.setAttribute('aria-label','左右拖动或使用方向键切换城市');
 deck.classList.add('is-enhanced');select(0);
})();
