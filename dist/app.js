const contactDialog = document.querySelector('#contact-dialog');
const cityDialog = document.querySelector('#city-dialog');
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
  dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) { document.body.classList.remove('modal-open'); lastTrigger?.focus(); } });
});
const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(){mobileNav.hidden = true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','打开导航菜单');}
menuButton.addEventListener('click', () => { const opening = mobileNav.hidden; mobileNav.hidden = !opening;menuButton.setAttribute('aria-expanded',String(opening));menuButton.setAttribute('aria-label',opening ? '关闭导航菜单' : '打开导航菜单'); });
mobileNav.querySelectorAll('a,button').forEach(link => link.addEventListener('click',closeMenu));
document.addEventListener('keydown', event => { if(event.key === 'Escape' && !mobileNav.hidden){closeMenu();menuButton.focus();} });
const cities = {
  paris: {name:'巴黎',en:'PARIS / FRANCE',description:'沿塞纳河展开一册关于艺术、街道与光的手记。下一次运动，从一段想亲近的巴黎日常开始。',landmarks:['塞纳河左岸','卢浮宫','蒙马特','埃菲尔铁塔']},
  tokyo: {name:'东京',en:'TOKYO / JAPAN',description:'传统街区与霓虹天际并行。从隅田川到街巷深处，发现东京细密而鲜活的节奏。',landmarks:['浅草寺','隅田川','代代木公园','东京塔']},
  'new-york': {name:'纽约',en:'NEW YORK / UNITED STATES',description:'在高楼、绿地与河岸之间，感受城市不断向前的节奏。跟随好奇心，寻找属于你的纽约。',landmarks:['中央公园','布鲁克林大桥','时代广场','哈德逊河']},
  sydney: {name:'悉尼',en:'SYDNEY / AUSTRALIA',description:'在海港与城市的交界，让日常运动多一点海风的想象。下一站，向阳光和海岸出发。',landmarks:['悉尼歌剧院','海港大桥','皇家植物园','邦迪海滩']}
};
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(filter => {const selected = filter === button;filter.classList.toggle('active',selected);filter.setAttribute('aria-pressed',String(selected));});
  let count = 0;
  document.querySelectorAll('[data-city]').forEach(card => {card.hidden = button.dataset.filter !== 'all' && card.dataset.region !== button.dataset.filter;if(!card.hidden)count++;});
  document.querySelector('#city-count').textContent = `${String(count).padStart(2,'0')} DESTINATION${count === 1 ? '' : 'S'}`;
}));
document.querySelectorAll('[data-city]').forEach(card => card.addEventListener('click', () => {
  const city = cities[card.dataset.city];
  document.querySelector('#city-dialog-title').textContent = city.name;
  document.querySelector('#city-dialog-en').textContent = city.en;
  document.querySelector('#city-dialog-description').textContent = city.description;
  const picture = document.querySelector('#city-dialog-image');picture.src = `assets/${card.dataset.city}.jpg`;picture.alt = `${city.name}城市风景`;
  document.querySelector('#city-landmarks').replaceChildren(...city.landmarks.map(name=>{const tag=document.createElement('span');tag.textContent=name;return tag;}));
  openDialog(cityDialog,card);
}));
document.querySelector('#city-contact').addEventListener('click', () => {const trigger=lastTrigger;cityDialog.close();openDialog(contactDialog,trigger);});
const panels = [
  {title:'下一站，由你选择',subtitle:'从好奇心开始一段旅程',note:'App 2.0 原型界面',html:'<img class="app-screen" src="assets/app-city-selection.png" alt="MOVEVI App 2.0 城市选择界面，展示东京、巴黎与纽约" width="390" height="844">'},
  {title:'风景，让每一步有期待',subtitle:'在运动中发现一座城市',note:'官网流程示意 · 数字为演示数据',html:'<div class="demo-screen"><span class="demo-kicker">MOVEVI / EXPLORE</span><h3>沿塞纳河，出发</h3><p>巴黎 · 路线探索示意</p><div class="demo-route-image"><img src="assets/paris.jpg" alt="巴黎城市风景"><span>路线体验示意</span></div><div class="demo-stat"><span>已探索</span><strong>2.5 km</strong></div><div class="demo-stat"><span>运动时长</span><strong>24:18</strong></div><div class="demo-bar"><i></i></div><span class="demo-caption">示例进度 · 按自己的节奏前进</span><div class="demo-start">你的每一步，都向世界靠近</div></div>'},
  {title:'走过的路，成为你的故事',subtitle:'收藏城市，期待下一次出发',note:'官网流程示意 · 不代表真实完成记录',html:'<div class="demo-screen demo-complete"><span class="demo-kicker">YOUR CITY JOURNAL</span><div class="demo-medal" aria-hidden="true">⚑</div><h3>你好，巴黎。</h3><p>一座城市，一段自己的旅程。</p><div class="demo-stat"><span>路线探索</span><strong>完成</strong></div><div class="demo-stat"><span>城市报告</span><strong>旅程留念</strong></div><div class="demo-stat"><span>国家或地区</span><strong>点亮法国</strong></div><p class="demo-caption">完成状态仅作功能展示</p><div class="demo-start">下一站，还有新的期待 ↗</div></div>'}
];
const stepButtons = [...document.querySelectorAll('[data-step]')];
function selectStep(index,focus=false){
  stepButtons.forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
  const panel=panels[index];document.querySelector('#phone-content').innerHTML=panel.html;
  document.querySelector('#stage-title').textContent=panel.title;document.querySelector('#stage-subtitle').textContent=panel.subtitle;document.querySelector('#stage-footnote').textContent=panel.note;
  document.querySelector('#step-panel').setAttribute('aria-labelledby',`step-${index}`);if(focus)stepButtons[index].focus();
}
stepButtons.forEach((button,index)=>{button.addEventListener('click',()=>selectStep(index));button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%3;if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index+2)%3;if(event.key==='Home')next=0;if(event.key==='End')next=2;if(next!==undefined){event.preventDefault();selectStep(next,true);}});});
document.querySelector('#year').textContent = new Date().getFullYear();
