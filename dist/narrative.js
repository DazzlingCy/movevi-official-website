(() => {
  'use strict';
  const motivation=document.querySelector('#motivation');
  const reasons=[...document.querySelectorAll('[data-reason]')];
  function selectReason(index,focus=false){
    const focusWithinPanel=[...motivation.querySelectorAll('[role="tabpanel"]')].some(panel=>panel.contains(document.activeElement));
    reasons.forEach((button,i)=>{
      const active=i===index;
      button.setAttribute('aria-selected',String(active));
      button.tabIndex=active?0:-1;
      document.getElementById(button.getAttribute('aria-controls')).hidden=!active;
    });
    motivation.classList.toggle('is-exploring',index===1);
    motivation.dataset.reason=index===1?'after':'before';
    if(focus||focusWithinPanel)reasons[index].focus({preventScroll:true});
  }
  if(motivation&&reasons.length){
    motivation.classList.add('is-enhanced');selectReason(0);
    motivation.addEventListener('movevi:story-phase',event=>selectReason(event.detail.index));
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
  }));
  const chapters=[...document.querySelectorAll('[data-chapter]')];
  const mainLinks=[...document.querySelectorAll('[data-nav-chapter]')];
  if(!chapters.length)return;
  let frame=0;
  function update(){
    frame=0;
    const line=innerHeight*.32;
    const current=chapters.filter(chapter=>chapter.getBoundingClientRect().top<=line).at(-1);
    mainLinks.forEach(link=>{
      if(current&&link.dataset.navChapter.split(/\s+/).includes(current.dataset.chapter))link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  function requestUpdate(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  document.addEventListener('visibilitychange',requestUpdate);
  update();
})();
