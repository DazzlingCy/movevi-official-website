(() => {
  'use strict';
  const motivation=document.querySelector('#motivation');
  const reasons=[...document.querySelectorAll('[data-reason]')];
  function selectReason(index,focus=false){
    reasons.forEach((button,i)=>{
      const active=i===index;
      button.setAttribute('aria-selected',String(active));
      button.tabIndex=active?0:-1;
      document.getElementById(button.getAttribute('aria-controls')).hidden=!active;
    });
    motivation.classList.toggle('is-exploring',index===1);
    if(focus)reasons[index].focus();
  }
  if(motivation&&reasons.length){
    motivation.classList.add('is-enhanced');selectReason(0);
    reasons.forEach((button,index)=>{
      button.addEventListener('click',()=>selectReason(index));
      button.addEventListener('keydown',event=>{
        let next;
        if(event.key==='ArrowRight'||event.key==='ArrowLeft')next=1-index;
        if(event.key==='Home')next=0;
        if(event.key==='End')next=reasons.length-1;
        if(next!==undefined){event.preventDefault();selectReason(next,true);}
      });
    });
  }
  const values=[...document.querySelectorAll('.value-accordion details')];
  values.forEach(detail=>detail.addEventListener('toggle',()=>{
    if(!detail.open)return;
    values.forEach(other=>{if(other!==detail)other.open=false;});
    document.querySelector('#value-number').textContent=detail.dataset.number;
    document.querySelector('#value-word').textContent=detail.dataset.value;
  }));
  const index=document.querySelector('.story-index');
  const chapters=[...document.querySelectorAll('[data-chapter]')];
  const links=[...document.querySelectorAll('[data-chapter-link]')];
  const ending=document.querySelector('#set-off');
  if(!index||!chapters.length)return;
  index.classList.add('is-enhanced');
  let frame=0;
  function update(){
    frame=0;
    const line=innerHeight*.32;
    const current=chapters.filter(chapter=>chapter.getBoundingClientRect().top<=line).at(-1);
    const visible=!!current&&ending.getBoundingClientRect().top>line;
    // Keep a focused navigation link visible until focus leaves it.
    const keyboardFocus=index.contains(document.activeElement)&&document.activeElement.matches(':focus-visible');
    index.hidden=!visible&&!keyboardFocus;
    links.forEach(link=>{
      if(visible&&link.dataset.chapterLink===current.dataset.chapter)link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  function requestUpdate(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  document.addEventListener('visibilitychange',requestUpdate);
  index.addEventListener('focusout',requestUpdate);
  update();
})();
