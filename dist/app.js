const contactDialog = document.querySelector('#contact-dialog');
let lastTrigger;
function openDialog(dialog, trigger) {
  lastTrigger = trigger || document.activeElement;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => openDialog(contactDialog, button)));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) { document.body.classList.remove('modal-open'); if(lastTrigger?.offsetParent!==null)lastTrigger?.focus();else document.querySelector('.menu-button').focus(); } });
});
const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(){mobileNav.hidden = true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','打开导航菜单');}
menuButton.addEventListener('click', () => { const opening = mobileNav.hidden; mobileNav.hidden = !opening;menuButton.setAttribute('aria-expanded',String(opening));menuButton.setAttribute('aria-label',opening ? '关闭导航菜单' : '打开导航菜单'); });
mobileNav.querySelectorAll('a,button').forEach(link => link.addEventListener('click',closeMenu));
matchMedia('(min-width: 901px)').addEventListener('change', event => { if(event.matches)closeMenu(); });
document.addEventListener('keydown', event => { if(event.key === 'Escape' && !mobileNav.hidden){closeMenu();menuButton.focus();} });
const panels = [
  {src:'assets/app/city.jpg',alt:'木卫六 App 2.0 城市选择页原型',title:'从一座想去的城市，开始探索。'},
  {src:'assets/app/routes.jpg',alt:'木卫六 App 2.0 东京路线列表原型',title:'沿着连续的路线，走进城市。'},
  {src:'assets/app/run.jpg',alt:'木卫六 App 2.0 运动暂停界面原型',title:'看见运动进度，按自己的节奏前进。'},
  {src:'assets/app/complete.jpg',alt:'木卫六 App 2.0 运动记录与下一路线原型',title:'走过这一程，期待下一次发现。'}
];
const stepButtons = [...document.querySelectorAll('[data-step]')];
function selectStep(index,focus=false){
  stepButtons.forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
  const panel=panels[index], image=document.querySelector('#app-screen');image.src=panel.src;image.alt=panel.alt;
  document.querySelector('#stage-title').textContent=panel.title;
  document.querySelector('#step-panel').setAttribute('aria-labelledby',`step-${index}`);
  document.dispatchEvent(new CustomEvent('movevi:step'));
  if(focus)stepButtons[index].focus();
}
function tabKeys(event,index,count,select){let next;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%count;if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index+count-1)%count;if(event.key==='Home')next=0;if(event.key==='End')next=count-1;if(next!==undefined){event.preventDefault();select(next,true);}}
stepButtons.forEach((button,index)=>{button.addEventListener('click',()=>selectStep(index));button.addEventListener('keydown',event=>tabKeys(event,index,panels.length,selectStep));});
document.querySelector('#year').textContent=new Date().getFullYear();
