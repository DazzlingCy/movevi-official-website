(() => {
  'use strict';
  const products = window.MOVEVI_PRODUCTS;
  const productDialog = document.querySelector('#product-dialog');
  const seriesButtons = [...document.querySelectorAll('[data-series]')];
  const descriptions = {
    ts2: '以轻巧机身，融入日常走步时光。',
    ts3: '从走步到快跑，让每一天都有自己的节奏。'
  };
  let activeProduct, activePhoto=0;
  const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('reduce-motion');
  function arrive(node){if(!reduce())node.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.2,.7,.2,1)'});}
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  const productStoreUrl = 'https://detail.tmall.com/item.htm?abbucket=0&id=966719578473&mi_id=0000NeCJ3-w5Qe1tv8HplC_4BBxqulmtUznrlu18DzpJ8rk&ns=1&skuId=6096784394965&spm=a21xtw.29978516.product_shelf.1.183375451TrEOJ&xxc=taobaoSearch';
  function contactProduct() {
    window.open(productStoreUrl, '_blank', 'noopener,noreferrer');
  }
  function selectPhoto(product, index, focus = false) {
    activePhoto=index;
    const photo = product.gallery[index];
    const image = document.querySelector('#product-detail-image');
    image.src = photo.src; image.alt = `${product.name} ${photo.label}`;
    document.querySelector('.product-gallery').classList.toggle('is-photo',photo.type==='photo');
    document.querySelector('.product-render-note').textContent=photo.type==='photo'?'木卫六产品实拍':'产品渲染图';
    document.querySelector('#product-image-caption').textContent = photo.label;
    document.querySelector('#product-image-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(product.gallery.length).padStart(2,'0')}`;
    document.querySelectorAll('[data-photo-prev],[data-photo-next]').forEach(button=>button.disabled=product.gallery.length<2);
    image.getAnimations().forEach(a=>a.cancel());
    image.onload=()=>arrive(image);
    const buttons = [...document.querySelectorAll('[data-product-photo]')];
    buttons.forEach((b,i) => b.setAttribute('aria-pressed', String(i === index)));
    if (focus) buttons[index].focus();
    if(productDialog.open)buttons[index].scrollIntoView({block:'nearest',inline:'nearest',behavior:reduce()?'instant':'smooth'});
  }
  function showProduct(product, trigger) {
    activeProduct = {product, trigger};
    document.querySelector('#product-dialog-title').textContent = product.name;
    document.querySelector('#product-detail-description').textContent = product.description;
    document.querySelector('#product-footer-name').textContent=`MOVEVI ${product.name}`;
    document.querySelector('#product-detail-highlights').replaceChildren(...product.highlights.map(h=>{const item=el('div');item.append(el('dt','',h.label),el('dd','',h.value));return item;}));
    const specs = document.querySelector('#product-detail-specs');
    specs.replaceChildren(...product.specs.map(spec => {
      const row = el('div'); row.append(el('dt', '', spec.label),el('dd', '', spec.value));return row;
    }));
    document.querySelector('#product-thumbnails').replaceChildren(...product.gallery.map((photo, i) => {
      const button = el('button');button.type = 'button';button.dataset.productPhoto = String(i);
      button.setAttribute('aria-label', `${product.name} ${photo.label}`);
      const img = el('img');img.src = photo.src;img.alt = '';img.width = 76;img.height = 64;
      button.append(img,el('span','',photo.label));
      button.addEventListener('click', () => selectPhoto(product,i));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (i+1)%product.gallery.length;
        if (event.key === 'ArrowLeft') next = (i+product.gallery.length-1)%product.gallery.length;
        if (next !== undefined) {event.preventDefault();selectPhoto(product,next,true);}
      });
      return button;
    }));
    selectPhoto(product,0);
    productDialog.scrollTop = 0;
    openDialog(productDialog,trigger);
    productDialog.scrollTop = 0;
    document.querySelector('.product-spec-scroll').scrollTop=0;
    document.querySelector('.product-detail-grid').scrollTop=0;
    document.querySelector('#product-thumbnails').scrollLeft=0;
  }
  document.querySelector('[data-photo-prev]').addEventListener('click',()=>{if(activeProduct)selectPhoto(activeProduct.product,(activePhoto+activeProduct.product.gallery.length-1)%activeProduct.product.gallery.length);});
  document.querySelector('[data-photo-next]').addEventListener('click',()=>{if(activeProduct)selectPhoto(activeProduct.product,(activePhoto+1)%activeProduct.product.gallery.length);});
  document.querySelector('#product-detail-contact').addEventListener('click', () => {
    if (activeProduct) contactProduct();
  });
  function card(product) {
    const article = el('article','product-card');article.dataset.series = product.series;
    const media = el('button','product-card-media');
    media.type = 'button';media.setAttribute('aria-label',`查看 ${product.name} 图片与参数`);
    const img=el('img');img.src=product.image;img.alt=`MOVEVI ${product.name} ${product.imageType==='photo'?'家庭运动实拍':'产品渲染图'}`;img.loading='lazy';img.width=1000;img.height=700;
    media.classList.toggle('is-photo',product.imageType==='photo');
    if(product.imageMobile){img.srcset=`${product.imageMobile} 720w, ${product.image} 1600w`;img.sizes='(max-width:600px) 100vw, 50vw';}
    media.append(img,el('span','product-image-label',product.gallery.length>1?`${product.gallery.length} 个视角 ↗`:'查看产品 ↗'));
    media.addEventListener('click',()=>showProduct(product,media));
    const copy = el('div','product-card-copy');
    const heading = el('div','product-card-heading');heading.append(el('h3','',product.name),el('span','',product.tagline));
    const stats = el('dl','product-card-stats');
    product.highlights.forEach(h=>{const item=el('div');item.append(el('dt','',h.label),el('dd','',h.value));stats.append(item);});
    const actions = el('div','product-card-actions');
    const details = el('button','product-detail-button','图片与完整参数 ↗');details.type='button';details.addEventListener('click',()=>showProduct(product,details));
    const contact = el('button','product-consult-button',`咨询 ${product.name}`);contact.type='button';contact.addEventListener('click',()=>contactProduct());
    actions.append(details,contact);copy.append(heading,stats,actions);article.append(media,copy);return article;
  }
  function comparison(selected) {
    const table=document.querySelector('#comparison-table');
    const caption=el('caption','',`${selected[0].name} 与 ${selected[1].name} 完整参数对比`);
    const head=el('thead'),header=el('tr');
    ['产品参数',...selected.map(p=>p.name)].forEach(text=>{const cell=el('th','',text);cell.scope='col';header.append(cell);});head.append(header);
    const body=el('tbody');
    const normalized=selected.map(p=>p.specs.map(s=>['最大坡度','坡度范围'].includes(s.label)?{label:'坡度（百分比）',value:`${s.label} ${s.value}`}:s));
    const labels=[...new Set(normalized.flatMap(specs=>specs.map(s=>s.label)))];
    labels.forEach(label=>{const row=el('tr');const th=el('th','',label);th.scope='row';row.append(th);normalized.forEach(specs=>row.append(el('td','',specs.find(s=>s.label===label)?.value||'未列明')));body.append(row);});
    table.replaceChildren(caption,head,body);
  }
  function selectSeries(series, focus=false) {
    const selected=products.filter(p=>p.series===series);
    seriesButtons.forEach(b=>{const active=b.dataset.series===series;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;if(active&&focus)b.focus();});
    document.querySelector('#product-panel').setAttribute('aria-labelledby',`series-${series}`);
    document.querySelector('#product-series-description').textContent=descriptions[series];
    document.querySelector('#product-series-count').textContent=`${series.toUpperCase()} / 02 MODELS`;
    document.querySelector('#comparison-title').textContent=`${series.toUpperCase()} 系列参数对比`;
    document.querySelector('#product-grid').replaceChildren(...selected.map(card));
    document.querySelectorAll('#product-grid .product-card').forEach(arrive);
    comparison(selected);
  }
  seriesButtons.forEach((button,index)=>{
    button.addEventListener('click',()=>selectSeries(button.dataset.series));
    button.addEventListener('keydown',event=>{
      let next;if(event.key==='ArrowRight')next=(index+1)%seriesButtons.length;if(event.key==='ArrowLeft')next=(index+seriesButtons.length-1)%seriesButtons.length;if(event.key==='Home')next=0;if(event.key==='End')next=seriesButtons.length-1;
      if(next!==undefined){event.preventDefault();selectSeries(seriesButtons[next].dataset.series,true);}
    });
  });
  selectSeries('ts3');
})();
