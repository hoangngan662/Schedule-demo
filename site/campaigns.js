(() => {
 const $=id=>document.getElementById(id),el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
 let campaigns=[];
 let current=0,view='ring',ringStart=null;
 function logo(brand){const box=el('div','campaign-logo',brand.title);if(ContentDB.safe(brand.logo_url)){box.textContent='';box.append(ContentDB.image(brand.logo_url,brand.title));}return box;}
 function open(item){
  const body=$('campaign-body'),top=el('div','campaign-modal-top'),image=el('img','');
  if(item.image)image.src=item.image;else image.hidden=true;image.alt=item.title;top.append(image,logo(item.brand));
  const title=el('h2','',item.title);title.id='campaign-title';
  const tags=el('div','campaign-tags');[item.jobType,item.credit,...(item.tags||[])].filter(Boolean).forEach(tag=>tags.append(el('span','',tag)));
  const lower=el('div','campaign-modal-lower'),photos=el('div','campaign-photos'),links=el('div','campaign-posts');
  item.photos.forEach(photo=>photos.append(ContentDB.image(photo.image_url,photo.alt_text||photo.caption||item.title)));
  links.append(el('h3','','Related posts'));
  item.links.forEach(link=>{if(!ContentDB.safe(link.url))return;const a=el('a','text-link',link.title+' ↗');a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';links.append(a);});
  lower.append(photos,links);
  body.replaceChildren(top,title,el('p','campaign-brand-name',item.brand.title),el('p','campaign-date',item.date),tags,el('p','campaign-description',item.description),lower);
  $('campaign-dialog').showModal();$('campaign-dialog').scrollTop=0;document.documentElement.classList.add('campaign-modal-open');$('campaign-close').focus();
 }
 function card(item,index){
  const button=el('button','campaign-card');button.type='button';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label',item.brand.title+' · '+item.title);
  const image=el('img','');if(item.image)image.src=item.image;else image.hidden=true;image.alt='';image.loading='lazy';
  button.append(image,logo(item.brand),el('span','campaign-card-name',item.title));
  button.addEventListener('click',()=>open(item));
  return button;
 }
 const stage=$('ring-stage');
 const status=document.querySelector('.campaign-toolbar>p');
 ContentDB.run(status,async()=>{
  const [brands,rows]=await Promise.all([
   ContentDB.list('brands',{is_published:'eq.true'}),
   ContentDB.list('brand_campaigns',{select:'*,campaign_images(*),campaign_links(*)',is_published:'eq.true'})
  ]);
  campaigns=rows.map(row=>({...row,brand:brands.find(b=>b.id===row.brand_id),image:ContentDB.safe(row.cover_image_url),jobType:row.participation_type==='group'?'Cùng nhóm':row.participation_type==='individual'?'Cá nhân':'',date:[row.starts_on,row.ends_on].filter(Boolean).join(' — '),photos:(row.campaign_images||[]).filter(p=>p.is_published).sort((a,b)=>a.sort_order-b.sort_order),links:[...(row.campaign_links||[]).filter(p=>p.is_published).sort((a,b)=>a.sort_order-b.sort_order),...(row.website_url?[{title:'Trang chiến dịch',url:row.website_url}]:[])]})).filter(row=>row.brand);
  status.textContent=campaigns.length+' campaigns';
  stage.replaceChildren();$('campaign-list').replaceChildren();
  if(!campaigns.length){ContentDB.empty(stage);ContentDB.empty($('campaign-list'));return;}
  campaigns.forEach((item,i)=>{$('campaign-list').append(card(item,i));stage.append(card(item,i));});
  for(let repeat=0;repeat<Math.max(1,Math.ceil(8/campaigns.length));repeat++)campaigns.forEach((item,i)=>{const duplicate=card(item,i);duplicate.tabIndex=-1;duplicate.setAttribute('aria-hidden','true');stage.append(duplicate);});
 });
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let pointerPaused=false,lastFrame=0,frameId;
 function loopWidth(){
  const first=stage.children[0],repeat=stage.children[campaigns.length];
  return first&&repeat?repeat.offsetLeft-first.offsetLeft:0;
 }
 function updateRing(){}
 stage.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')pointerPaused=true;});
 stage.addEventListener('pointerleave',()=>{pointerPaused=false;});
 stage.addEventListener('pointerdown',()=>{pointerPaused=true;});
 stage.addEventListener('pointerup',event=>{if(event.pointerType!=='mouse')pointerPaused=false;});
 stage.addEventListener('pointercancel',()=>{pointerPaused=false;});
 function tick(time){
  const elapsed=lastFrame?Math.min(time-lastFrame,50):0;lastFrame=time;
  if(view==='ring'&&!document.hidden&&!reduced.matches&&!pointerPaused&&!$('campaign-dialog').open&&!stage.contains(document.activeElement)){
   const width=loopWidth();
   if(width>0){if(stage.scrollLeft>=width)stage.scrollLeft-=width;stage.scrollLeft+=elapsed*.035;}
  }
  frameId=requestAnimationFrame(tick);
 }
 frameId=requestAnimationFrame(tick);
 window.addEventListener('pagehide',()=>cancelAnimationFrame(frameId),{once:true});
 stage.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();
   stage.scrollBy({left:(event.key==='ArrowRight'?1:-1)*stage.clientWidth*.6,behavior:reduced.matches?'instant':'smooth'});
  }
 });
 document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  view=button.dataset.view;
  $('campaign-list').hidden=view!=='list';$('campaign-ring').hidden=view!=='ring';
  document.querySelectorAll('[data-view]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  if(view==='ring')updateRing();
 }));
 $('campaign-close').onclick=()=>$('campaign-dialog').close();
 $('campaign-dialog').addEventListener('close',()=>{document.documentElement.classList.remove('campaign-modal-open');$('campaign-body').replaceChildren();});
 $('campaign-dialog').addEventListener('click',event=>{if(event.target!==$('campaign-dialog'))return;const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();});
 updateRing();
})();
