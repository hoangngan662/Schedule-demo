(() => {
 const $=id=>document.getElementById(id),el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
 const pictures=['assets/page-background.jpg','assets/wall.jpg','assets/event-default.jpg'];
 const campaigns=window.CAMPAIGN_DEMO_BRANDS.flatMap(brand=>brand.campaigns.map(campaign=>({...campaign,brand}))).map((item,index)=>({...item,image:pictures[index%pictures.length]}));
 let current=0,view='ring',ringStart=null;
 function logo(brand){return el('div','campaign-logo '+brand.tone,brand.logo);}
 function open(item){
  const body=$('campaign-body'),top=el('div','campaign-modal-top'),image=el('img','');
  image.src=item.image;image.alt='Sample artwork · '+item.title;top.append(image,logo(item.brand));
  const title=el('h2','',item.title);title.id='campaign-title';
  const tags=el('div','campaign-tags');[item.jobType,item.credit].forEach(tag=>tags.append(el('span','',tag)));
  const lower=el('div','campaign-modal-lower'),photos=el('div','campaign-photos'),links=el('div','campaign-posts');
  pictures.forEach((src,i)=>{const img=el('img','');img.src=src;img.alt='Sample campaign image '+(i+1);img.loading='lazy';photos.append(img);});
  links.append(el('h3','','Related posts'));
  if(/^https?:\/\//.test(item.postUrl||'')){const a=el('a','text-link','View sample post ↗');a.href=item.postUrl;a.target='_blank';a.rel='noopener noreferrer';links.append(a);}
  links.append(el('p','sample-link-note','Link và ảnh minh họa; chưa phải nội dung chiến dịch thực tế.'));
  lower.append(photos,links);
  body.replaceChildren(top,title,el('p','campaign-brand-name',item.brand.title),el('p','campaign-date',item.date),tags,el('p','campaign-description',item.description),lower);
  $('campaign-dialog').showModal();$('campaign-dialog').scrollTop=0;document.documentElement.classList.add('campaign-modal-open');$('campaign-close').focus();
 }
 function card(item,index){
  const button=el('button','campaign-card');button.type='button';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label',item.brand.title+' · '+item.title);
  const image=el('img','');image.src=item.image;image.alt='';image.loading='lazy';
  button.append(image,logo(item.brand),el('span','campaign-card-name',item.title));
  button.addEventListener('click',()=>open(item));
  return button;
 }
 campaigns.forEach((item,i)=>$('campaign-list').append(card(item,i)));
 const stage=$('ring-stage');
 campaigns.forEach((item,i)=>stage.append(card(item,i)));
 // Repeat the strip once for a seamless loop; duplicates do not enter keyboard order.
 campaigns.forEach((item,i)=>{const duplicate=card(item,i);duplicate.tabIndex=-1;duplicate.setAttribute('aria-hidden','true');stage.append(duplicate);});
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
