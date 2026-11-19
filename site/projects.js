(() => {
 const $=id=>document.getElementById(id),el=(tag,cls,text)=>{const node=document.createElement(tag);node.className=cls;if(text!=null)node.textContent=text;return node;};
 const safe=url=>typeof url==='string'&&/^(https?:\/\/|assets\/)/.test(url)?url:'';
 let engines=[];
 let filterType='',items=[],filtered=[],view='ring',photos=[],photoIndex=0,last=0,animation;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),stage=$('projects-ring');
 function image(src,alt){const img=el('img','');img.src=safe(src)||'assets/event-default.jpg';img.alt=alt;img.loading='lazy';img.addEventListener('error',()=>{img.src='assets/event-default.jpg';},{once:true});return img;}
 function renderPhoto(){
  const photo=photos[photoIndex];$('project-photo').src=photo.image_url;$('project-photo').alt=photo.caption||'Project image '+(photoIndex+1);
  $('project-photo-count').textContent=(photoIndex+1)+' / '+photos.length;
  $('project-photo-prev').disabled=$('project-photo-next').disabled=photos.length<2;
 }
 function showPhoto(index){photoIndex=index;renderPhoto();$('project-lightbox').showModal();$('project-photo-close').focus();}
 function showProject(item){
  const body=$('project-modal-body'),hero=el('div','project-modal-hero');hero.append(image(item.cover_image_url,item.title));
  const title=el('h2','',item.title);title.id='project-modal-title';hero.append(title,el('p','','by '+(item.by_name||'White Rose')));
  const facts=el('dl','project-modal-facts');
  [['Time',item.date],['Region',item.region],['Organizer',({FC:'FC',FS:'Fansite',Individual:'Fan lẻ'})[item.actor]||item.actor],['Status',item.status],['Type',item.type],['Budget',item.budget],['Target',item.target]].forEach(([label,value])=>{if(!value)return;const group=el('div','');group.append(el('dt','',label),el('dd','',String(value)));facts.append(group);});
  body.replaceChildren(hero,facts,el('h3','project-modal-heading','About the project'),el('p','project-modal-description',item.content||'Nội dung đang được cập nhật.'));
  const seenPhotos=new Set();
  photos=[...(safe(item.cover_image_url)?[{image_url:item.cover_image_url,caption:item.title+' · Cover'}]:[]),...(item.project_gallery||[])].filter(photo=>{
   const url=safe(photo.image_url);if(!url||seenPhotos.has(url))return false;
   seenPhotos.add(url);return true;
  });
  if(photos.length){
   body.append(el('h3','project-modal-heading','Project gallery ('+photos.length+')'));
   const grid=el('div','project-modal-photos');
   photos.forEach((photo,index)=>{const button=el('button','');button.type='button';button.setAttribute('aria-label','View image '+(index+1));button.append(image(photo.image_url,photo.caption||'Project image '+(index+1)));button.addEventListener('click',()=>showPhoto(index));grid.append(button);});
   body.append(grid);
  }
  if(/^https?:\/\//.test(item.website_url||'')){const link=el('a','page-button','View original post ↗');link.href=item.website_url;link.target='_blank';link.rel='noopener noreferrer';body.append(link);}
  $('project-modal').showModal();$('project-modal').scrollTop=0;document.documentElement.classList.add('project-dialog-open');$('project-modal-close').focus();
 }
 function card(item,duplicate=false){
  const button=el('button','project-preview');button.type='button';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label',item.title);
  if(duplicate){button.tabIndex=-1;button.setAttribute('aria-hidden','true');}
  const info=el('div','project-preview-info'),tags=el('div','project-preview-tags');
  info.append(el('h2','',item.title));
  if(item.date)info.append(el('p','',item.date));if(item.region)info.append(el('p','',item.region));
  [item.type,item.status].filter(Boolean).forEach(tag=>tags.append(el('span','',tag)));info.append(tags);
  button.append(image(item.cover_image_url,''),info);button.addEventListener('click',event=>{if(button.closest('.project-marquee-row')?.dataset.dragged==='true'){event.preventDefault();return;}showProject(item);});return button;
 }
 function status(text,retry=false){const root=$('projects-status');root.replaceChildren(el('p','',text));if(retry){const button=el('button','page-button','Thử lại');button.type='button';button.onclick=load;root.append(button);}}
 function normalizeText(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();}
 function renderTypeFilters(){
  const root=$('project-type-buttons');root.replaceChildren();
  [['','Tất cả'],...[...new Set(items.map(item=>item.type).filter(Boolean))].map(type=>[type,type])].forEach(([value,label])=>{
   const count=value?items.filter(item=>item.type===value).length:items.length;
   const button=el('button','project-type-button',label+' ');
   button.type='button';button.setAttribute('aria-pressed',String(filterType===value));
   button.append(el('span','project-type-count',String(count)));
   button.addEventListener('click',()=>{filterType=value;applyFilters();root.querySelectorAll('button').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));});
   root.append(button);
  });
 }
 function applyFilters(){
  const search=normalizeText($('project-search').value.trim());
  filtered=items.filter(item=>(!filterType||item.type===filterType)&&(!search||normalizeText([item.title,item.by_name,item.content,item.type,item.region].join(' ')).includes(search)));
  engines=[];
  stage.replaceChildren();$('projects-list').replaceChildren();stage.scrollLeft=0;last=0;
  $('project-filter-count').textContent=filtered.length+' / '+items.length+' projects';
  if(!filtered.length){status(items.length?'Không có project phù hợp. Thử đổi hoặc bỏ bộ lọc.':'Các fan project sẽ được cập nhật tại đây.');return;}
  $('projects-status').replaceChildren();
  filtered.forEach(item=>$('projects-list').append(card(item)));
  const half=Math.ceil(filtered.length/2);
  [filtered.slice(0,half),filtered.slice(half).length?filtered.slice(half):filtered.slice(0,half)].forEach((rows,index)=>{
   const row=el('div','project-marquee-row'),track=el('div','project-marquee-track');
   const group=el('div','project-marquee-group'),copy=el('div','project-marquee-group');
   const repeats=Math.max(1,Math.ceil(8/rows.length));
   for(let repeat=0;repeat<repeats;repeat++){
    rows.forEach(item=>group.append(card(item,repeat>0)));
    rows.forEach(item=>copy.append(card(item,true)));
   }
   track.append(group,copy);row.append(track);stage.append(row);
   engines.push(createEngine(row,track,group,copy,index));
  });
 }
 $('project-filters').addEventListener('submit',event=>event.preventDefault());
 $('project-search').addEventListener('input',applyFilters);
 $('project-filter-toggle').addEventListener('click',()=>{
  const button=$('project-filter-toggle'),open=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',String(open));$('project-type-panel').hidden=!open;
 });
 async function load(){
  status('Đang tải fan projects…');
  try{
   const config=window.PROJECT_CONFIG,url=new URL('/rest/v1/projects',config.SUPABASE_URL);
   url.searchParams.set('select',ProjectData.select);url.searchParams.set('order','created_at.desc.nullslast,id.desc');
   // Paginate to avoid silently dropping projects above the server's default page size.
   const rows=[];let offset=0;
   do{
    url.searchParams.set('limit','100');url.searchParams.set('offset',String(offset));
    const response=await fetch(url,{headers:{apikey:config.SUPABASE_PUBLISHABLE_KEY},signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const page=await response.json();if(!Array.isArray(page))throw new Error('Invalid response');rows.push(...page);if(page.length<100)break;offset+=page.length;
   }while(true);
   items=rows.map(ProjectData.normalize);
   const cache=new Map();
   for(let i=0;i<items.length;i+=4)await Promise.all(items.slice(i,i+4).map(async item=>{
    if(!item.drive_folder_url||typeof resolveDriveImages!=='function')return;
    const source={id:item.id,drive_folder_url:item.drive_folder_url,event_images:item.project_gallery,thumb:item.cover_image_url};
    await resolveDriveImages(source,cache);
    item.project_gallery=source.event_images;item.cover_image_url=source.thumb;
   }));
   renderTypeFilters();
   applyFilters();

  }catch(error){console.error('Project loading:',error.message);status('Chưa tải được fan projects.',true);}
 }
 document.querySelectorAll('[data-project-view]').forEach(button=>button.addEventListener('click',()=>{
  view=button.dataset.projectView;stage.hidden=view!=='ring';$('projects-list').hidden=view!=='list';
  document.querySelectorAll('[data-project-view]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
 }));
 function createEngine(row,track,group,copy,index){
  const engine={row,track,group,copy,offset:0,velocity:0,pressed:false,dragging:false,hover:false,lastX:0,startX:0,startY:0,width:0};
  function paint(){const width=copy.offsetLeft-group.offsetLeft;engine.width=width;if(width>0){engine.offset=((engine.offset%width)+width)%width-width;track.style.transform='translate3d('+engine.offset+'px,0,0)';}}
  engine.paint=paint;engine.direction=index?1:-1;
  row.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')engine.hover=true;});
  row.addEventListener('pointerleave',()=>{engine.hover=false;});
  row.addEventListener('dragstart',event=>event.preventDefault());
  row.addEventListener('pointerdown',event=>{if(event.button!==0)return;engine.pressed=true;engine.dragging=false;engine.velocity=0;engine.startX=engine.lastX=event.clientX;engine.startY=event.clientY;row.dataset.dragged='false';});
  row.addEventListener('pointermove',event=>{
   if(!engine.pressed)return;
   const dx=event.clientX-engine.lastX;
   if(!engine.dragging){
    if(Math.abs(event.clientY-engine.startY)>Math.abs(event.clientX-engine.startX)&&event.pointerType==='touch'){engine.pressed=false;return;}
    if(Math.abs(event.clientX-engine.startX)<6)return;
    engine.dragging=true;row.dataset.dragged='true';row.classList.add('is-dragging');row.setPointerCapture(event.pointerId);
   }
   event.preventDefault();engine.lastX=event.clientX;engine.offset+=dx;engine.velocity=dx;paint();
  });
  function release(event){if(!engine.pressed)return;engine.pressed=false;engine.dragging=false;row.classList.remove('is-dragging');if(event&&row.hasPointerCapture(event.pointerId))row.releasePointerCapture(event.pointerId);setTimeout(()=>{row.dataset.dragged='false';},100);}
  row.addEventListener('pointerup',release);row.addEventListener('pointercancel',event=>{engine.velocity=0;release(event);});
  return engine;
 }
 stage.addEventListener('keydown',event=>{
  if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
  event.preventDefault();engines.forEach(engine=>{engine.offset+=(event.key==='ArrowRight'?-1:1)*stage.clientWidth*.5;engine.paint();});
 });
 function tick(time){
  const delta=last?Math.min(time-last,50):0;last=time;
  if(view==='ring'&&!document.hidden&&!$('project-modal').open){
   engines.forEach(engine=>{
    if(!engine.pressed&&!engine.row.contains(document.activeElement)){
     if(Math.abs(engine.velocity)>.4&&!reduced.matches){engine.offset+=engine.velocity*delta/16.67;engine.velocity*=Math.pow(.92,delta/16.67);}
     else if(!engine.hover&&!reduced.matches)engine.offset+=engine.direction*delta*.15;
    }
    engine.paint();
   });
  }
  animation=requestAnimationFrame(tick);
 }
 animation=requestAnimationFrame(tick);window.addEventListener('pagehide',()=>cancelAnimationFrame(animation),{once:true});
 $('project-modal-close').onclick=()=>$('project-modal').close();
 $('project-modal').addEventListener('close',()=>{document.documentElement.classList.remove('project-dialog-open');$('project-modal-body').replaceChildren();photos=[];});
 $('project-photo-close').onclick=()=>$('project-lightbox').close();
 $('project-photo-prev').onclick=()=>{photoIndex=(photoIndex-1+photos.length)%photos.length;renderPhoto();};
 $('project-photo-next').onclick=()=>{photoIndex=(photoIndex+1)%photos.length;renderPhoto();};
 $('project-lightbox').addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();photoIndex=(photoIndex+(event.key==='ArrowRight'?1:-1)+photos.length)%photos.length;renderPhoto();}});
 $('project-lightbox').addEventListener('close',()=>{$('project-photo').removeAttribute('src');});
 ['project-modal','project-lightbox'].forEach(id=>$(id).addEventListener('click',event=>{if(event.target!==$(id))return;const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}));
 if(window.SiteLoading)SiteLoading.track(load());else load();
})();
