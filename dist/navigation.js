(() => {
  'use strict';
  const header=document.querySelector('.header'), cluster=document.querySelector('.nav-cluster');
  const nav=document.querySelector('#desktop-navigation'), expand=document.querySelector('.nav-expand');
  const mobile=document.querySelector('#mobile-nav'), menu=document.querySelector('.menu-button');
  const desktop=matchMedia('(min-width:901px)');
  let lastY=scrollY, frame=0, expanded=false;
  const contrastTargets=[header.querySelector('.brand'),cluster,header.querySelector('.header-cta'),menu];
  expand.hidden=false;
  function navigation(open){
    expanded=open;cluster.classList.toggle('is-expanded',open);
    const compact=header.classList.contains('is-scrolled')&&desktop.matches;
    nav.inert=compact&&!open;
    expand.setAttribute('aria-expanded',String(!compact||open));
    expand.setAttribute('aria-label',open?'收起主导航':'展开主导航');
  }
  function update(){
    frame=0;const y=scrollY,delta=y-lastY;
    const scrolled=y>80;header.classList.toggle('is-scrolled',scrolled);
    const focus=header.contains(document.activeElement)&&document.activeElement.matches(':focus-visible');
    if(y<80||delta < -4||focus||!mobile.hidden||expanded)header.classList.remove('is-hidden');
    else if(delta>4&&y>180)header.classList.add('is-hidden');
    navigation(expanded);lastY=y;
    // Transparent controls change ink over city images, without adding a background block.
    for(const control of contrastTargets){
      const box=control.getBoundingClientRect(),x=Math.min(innerWidth-1,Math.max(1,box.left+box.width/2));
      const behind=document.elementsFromPoint(x,38).find(element=>!element.closest('.header'));
      const image=behind?.closest('.world-stage,.portal-window,.validation-intro,.benefit-world,.intro-city,.globe-panel');
      control.classList.toggle('is-light',!!image&&mobile.hidden);
    }
  }
  addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  addEventListener('resize',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  desktop.addEventListener('change',()=>{
    navigation(false);update();
    if(!desktop.matches)document.querySelectorAll('[data-expand][aria-expanded="true"]').forEach(button=>button.click());
  });
  expand.addEventListener('click',()=>navigation(!expanded));
  cluster.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&header.classList.contains('is-scrolled'))navigation(true);});
  cluster.addEventListener('pointerleave',()=>{if(!cluster.contains(document.activeElement))navigation(false);});
  cluster.addEventListener('focusout',event=>{if(!cluster.contains(event.relatedTarget))navigation(false);});
  header.addEventListener('focusin',()=>header.classList.remove('is-hidden'));
  cluster.addEventListener('keydown',event=>{if(event.key==='Escape'){navigation(false);expand.focus();}});
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>navigation(false)));
  document.querySelector('#open-comparison').addEventListener('click',event=>{
    document.querySelector('#comparison-dialog-title').textContent=document.querySelector('#comparison-title').textContent;
    openDialog(document.querySelector('#comparison-dialog'),event.currentTarget);
  });
  // Mobile menu is a modal navigation surface; keyboard users remain inside it.
  const locked=[document.querySelector('main'),document.querySelector('footer'),document.querySelector('.story-index')];
  new MutationObserver(()=>{
    const open=!mobile.hidden;document.body.classList.toggle('nav-open',open);
    locked.forEach(node=>{if(node)node.inert=open;});
    if(open){header.classList.remove('is-hidden');mobile.querySelector('a').focus();}
  }).observe(mobile,{attributes:true,attributeFilter:['hidden']});
  document.addEventListener('keydown',event=>{
    if(mobile.hidden||event.key!=='Tab')return;
    const items=[menu,...mobile.querySelectorAll('a,button')];
    if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus();}
    else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();menu.focus();}
  });
  document.querySelectorAll('[data-expand]').forEach(button=>{
    button.hidden=false;
    const world=button.dataset.expand==='world';
    const scene=document.querySelector(world?'.world-journey':'.portal-scene');
    const panel=document.querySelector('.globe-panel');
    button.addEventListener('click',()=>{
      const open=button.getAttribute('aria-expanded')!=='true';
      button.setAttribute('aria-expanded',String(open));scene.classList.toggle('is-open',open);
      button.innerHTML=(open?'返回全景':world?'展开目的地':'打开世界窗口')+' <span aria-hidden="true">'+(open?'↙':'↗')+'</span>';
      if(world){panel.inert=open;panel.setAttribute('aria-hidden',String(open));}
    });
  });
  // One answer at a time keeps the FAQ within a screen without hiding its text.
  const faqs=[...document.querySelectorAll('.faq details')];
  faqs.forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)faqs.forEach(other=>{if(other!==detail)other.open=false;});}));
  update();
})();
