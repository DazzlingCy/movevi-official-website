(() => {
 'use strict';
 const root=document.querySelector('.trust-interactive');if(!root)return;
 const tabs=[...root.querySelectorAll('[role=tab]')],panels=[...root.querySelectorAll('[role=tabpanel]')],images=[...root.querySelectorAll('[data-trust-image]')];
 const figure=root.querySelector('.trust-view'),count=root.querySelector('.trust-view-count'),word=root.querySelector('.trust-view-word'),note=root.querySelector('.trust-view-note');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const still=()=>reduce.matches||document.documentElement.classList.contains('reduce-motion');
 let active=0,visible=false,frame=0,entered=false;
 const animations=new Set();
 function animate(node,keyframes,options){if(still())return;node.getAnimations().forEach(a=>a.cancel());const a=node.animate(keyframes,{fill:'backwards',...options});animations.add(a);a.finished.catch(()=>{}).finally(()=>animations.delete(a));}
 function select(index,focus=false){
  if(index===active){if(focus)tabs[index].focus();return;}active=index;
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;images[i].classList.toggle('is-active',i===index);images[i].setAttribute('aria-hidden',String(i!==index));});
  word.textContent=tabs[index].querySelector('strong').textContent;count.textContent=`0${index+1} / 06`;
  note.textContent=index===3||index===4?'木卫六产品实拍':index===0||index===2?'城市运动氛围示意':'城市风景展示';
  animate(panels[index],[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});
  animate(word,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:450});
  if(focus)tabs[index].focus();
 }
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(index));tab.addEventListener('keydown',event=>{
  let next;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%tabs.length;if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
  if(next!==undefined){event.preventDefault();select(next,true);}
 });});
 function enter(){
  if(entered||still())return;entered=true;
  root.querySelectorAll('[data-trust-reveal]').forEach((node,i)=>animate(node,[{opacity:0,transform:`translateY(${i===1?32:22}px)`},{opacity:1,transform:'translateY(0)'}],{duration:750,delay:i*110,easing:'cubic-bezier(.2,.7,.2,1)'}));
  tabs.forEach((tab,i)=>animate(tab,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,delay:260+i*55,easing:'cubic-bezier(.2,.7,.2,1)'}));
 }
 new IntersectionObserver(entries=>{const entry=entries[0];visible=entry.isIntersecting;if(visible){if(entry.intersectionRatio>.18)enter();schedule();}else{entered=false;animations.forEach(a=>a.cancel());}}, {threshold:[0,.2]}).observe(root);
 function update(){frame=0;if(!visible||document.hidden||still())return;const rect=figure.getBoundingClientRect();figure.style.setProperty('--trust-y',`${Math.max(-10,Math.min(10,(innerHeight/2-rect.top-rect.height/2)*.035))}px`);}
 function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(update);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 figure.addEventListener('pointermove',event=>{if(still()||event.pointerType!=='mouse')return;const r=figure.getBoundingClientRect();figure.style.setProperty('--trust-x',`${(event.clientX-r.left-r.width/2)*-.018}px`);});
 figure.addEventListener('pointerleave',()=>figure.style.setProperty('--trust-x','0px'));
 function resetMotion(){if(still()){animations.forEach(a=>a.cancel());figure.style.removeProperty('--trust-x');figure.style.removeProperty('--trust-y');}else schedule();}
 reduce.addEventListener('change',resetMotion);new MutationObserver(resetMotion).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)animations.forEach(a=>a.cancel());else schedule();});
})();
