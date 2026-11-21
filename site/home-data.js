(() => {
 const $=id=>document.getElementById(id),{node:el,image,list,run,empty,safe}=ContentDB;
 function tile(root,src,title,href,cls='brief-image-tile'){
  const a=el('a',cls);a.href=href;a.setAttribute('aria-label',title);a.append(image(src,''),el('span','brief-image-label',title));root.append(a);return a;
 }
 const parts={};new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).forEach(x=>parts[x.type]=x.value);
 const y=Number(parts.year),m=Number(parts.month)-1,today=Number(parts.day),days=new Date(Date.UTC(y,m+1,0)).getUTCDate();
 const next=Math.min(today+2,days),monthKey=parts.year+'-'+parts.month;
 let calendarEvents=[];
 let viewY=y,viewM=m;
 const calendar=$('brief-calendar'),toolbar=el('div','calendar-toolbar'),arrows=el('div','calendar-arrows');
 function control(text,label){const button=el('button','',text);button.type='button';button.setAttribute('aria-label',label);return button;}
 const prev=control('‹','Previous month'),forward=control('›','Next month'),reset=control('Today','Go to current month');
 const monthSelect=el('select',''),yearSelect=el('select','');
 monthSelect.setAttribute('aria-label','Select month');yearSelect.setAttribute('aria-label','Select year');
 for(let i=0;i<12;i++){const option=el('option','',new Intl.DateTimeFormat('en',{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2026,i,1))));option.value=String(i);monthSelect.append(option);}
 for(let i=y-5;i<=y+5;i++){const option=el('option','',String(i));option.value=String(i);yearSelect.append(option);}
 const pickers=el('div','calendar-pickers');arrows.append(prev,forward);pickers.append(monthSelect,yearSelect,reset);toolbar.append(arrows,pickers);
 const grid=el('div','month-grid compact-event-grid');
 calendar.replaceChildren(toolbar,grid);
 function renderMonth(){
  monthSelect.value=String(viewM);yearSelect.value=String(viewY);grid.replaceChildren();
  const offset=new Date(Date.UTC(viewY,viewM,1)).getUTCDay(),total=new Date(Date.UTC(viewY,viewM+1,0)).getUTCDate();
  const week=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const count=Math.ceil((offset+total)/7)*7;
  grid.style.setProperty('--calendar-weeks',String(count/7));
  for(let i=0;i<count;i++){
   const date=new Date(Date.UTC(viewY,viewM,i-offset+1)),dateKey=date.toISOString().slice(0,10),outside=date.getUTCMonth()!==viewM;
   const events=outside?[]:calendarEvents.filter(event=>event.date<=dateKey&&(event.end_date||event.date)>=dateKey);
   const cell=el('div','month-cell'+(outside?' calendar-outside':'')+(dateKey===parts.year+'-'+parts.month+'-'+parts.day?' month-today':'')+(events.length?' month-has-event':''));
   cell.append(el('span','calendar-weekday',week[i%7]),el('span','calendar-day-number',String(date.getUTCDate()).padStart(2,'0')));
   if(dateKey===parts.year+'-'+parts.month+'-'+parts.day)cell.setAttribute('aria-current','date');
   if(events.length)cell.append(el('span','calendar-signal'));
   events.forEach(event=>{
    const link=el('a','calendar-event');link.href='schedule.html?month='+dateKey.slice(0,7)+'#lich';
    link.setAttribute('aria-label',dateKey+' · '+event.time+' · '+event.name);link.title=event.time+' · '+event.name+' · '+event.location;
    link.append(el('time','',event.time+' · '+event.location),el('span','',event.name));cell.append(link);
   });
   grid.append(cell);
  }
  prev.disabled=viewY===y-5&&viewM===0;forward.disabled=viewY===y+5&&viewM===11;
 }
 function move(delta){const date=new Date(Date.UTC(viewY,viewM+delta,1));viewY=date.getUTCFullYear();viewM=date.getUTCMonth();renderMonth();}
 prev.onclick=()=>move(-1);forward.onclick=()=>move(1);
 monthSelect.onchange=()=>{viewM=Number(monthSelect.value);renderMonth();};
 yearSelect.onchange=()=>{viewY=Number(yearSelect.value);renderMonth();};
 reset.onclick=()=>{viewY=y;viewM=m;renderMonth();};renderMonth();

 run(document.querySelector('.nearest-event'),async()=>{
  const rows=await list('events',{select:'*,event_images(*)',is_published:'eq.true',order:'event_date.asc,start_time.asc.nullslast'});
  calendarEvents=rows.map(row=>({...row,date:row.event_date,time:row.start_time?.slice(0,5)||'Chưa có giờ'}));renderMonth();
  const todayKey=parts.year+'-'+parts.month+'-'+parts.day;
  const item=rows.find(row=>(row.end_date||row.event_date)>=todayKey),root=document.querySelector('.nearest-event');
  if(!item){empty(root,'Chưa có lịch trình sắp tới.');return;}
  const a=el('a','text-link','Explore Schedule ↗');a.href='schedule.html?month='+item.event_date.slice(0,7)+'#lich';
  const candidates=[];
  const add=url=>{if(safe(url)&&!candidates.includes(url))candidates.push(url);};
  const stored=(item.event_images||[]).slice().sort((a,b)=>Number(!!b.is_cover)-Number(!!a.is_cover)||(a.sort_order||0)-(b.sort_order||0));
  stored.filter(photo=>photo.is_cover).forEach(photo=>add(photo.image_url));
  stored.filter(photo=>/main/i.test(photo.file_name||'')).forEach(photo=>add(photo.image_url));
  if(item.drive_folder_url&&typeof resolveDriveImages==='function'){
   item.thumb=item.thumbnail_url;await resolveDriveImages(item,new Map());add(item.thumb);(item.event_images||[]).forEach(photo=>add(photo.image_url));
  }
  add(item.thumbnail_url);stored.forEach(photo=>add(photo.image_url));
  const media=el('div','upcoming-media'),photo=el('img','');photo.alt=item.name;photo.loading='eager';photo.decoding='async';
  let candidate=0;
  function nextImage(){if(candidate<candidates.length){photo.src=candidates[candidate++];}else{media.replaceChildren(el('span','upcoming-image-empty','Ảnh sự kiện đang được cập nhật.'));}}
  photo.addEventListener('error',nextImage);media.append(photo);nextImage();
  const info=el('div','upcoming-info'),tags=el('div','upcoming-tags');
  (item.event_types||[]).forEach(type=>tags.append(el('span','brief-pill',type)));
  info.append(el('div','next-date',item.event_date.split('-').reverse().join('/')),el('h3','',item.name),el('p','upcoming-location',[item.start_time?.slice(0,5)||'Chưa có giờ',item.location].filter(Boolean).join(' · ')),tags,a);
  root.replaceChildren(el('span','eyebrow','UPCOMING EVENT'),media,info);
 });
 run($('home-profile-data'),async()=>{
  const rows=await list('artist_profiles',{slug:'eq.bex',is_published:'eq.true',limit:1});const item=rows[0];
  if(!item){empty($('home-profile-data'));return;}
  document.querySelector('.about-wordmark h1').textContent=item.stage_name;
  const photo=document.querySelector('.about-image img');if(safe(item.portrait_url)){photo.src=item.portrait_url;photo.alt=item.stage_name;photo.hidden=false;}
  const dl=el('dl','');[['NAME',item.full_name],['ARTIST NAME',item.stage_name]].forEach(([label,value])=>{const row=el('div','');row.append(el('dt','',label),el('dd','',value));dl.append(row);});
  $('home-profile-data').replaceChildren(el('p','about-lead',item.introduction||''),dl);
 });
 run($('brief-gallery'),async()=>{
  const rows=await list('events',{select:'id,name,event_date,thumbnail_url,drive_folder_url,event_images(*)',is_published:'eq.true',order:'event_date.desc'});
  const cache=new Map();for(let i=0;i<rows.length;i+=4)await Promise.all(rows.slice(i,i+4).map(async row=>{if(row.drive_folder_url&&typeof resolveDriveImages==='function'){row.thumb=row.thumbnail_url;await resolveDriveImages(row,cache);}}));
  const albums=rows.filter(row=>(row.event_images||[]).length).slice(0,3);$('brief-gallery').replaceChildren();
  albums.forEach(row=>{const cover=row.event_images.find(p=>p.is_cover)||row.event_images[0];tile($('brief-gallery'),cover.image_url,row.name,'gallery.html');});
  if(!albums.length)empty($('brief-gallery'),'Chưa có album công khai.');
 });
 run($('home-brand'),async()=>{
  const rows=await list('brands',{is_published:'eq.true',limit:8});const root=$('home-brand');root.replaceChildren();root.className='home-project-grid';
  rows.forEach(row=>tile(root,row.logo_url||row.cover_image_url,row.title,'brand.html','home-project-tile'));if(!rows.length)empty(root,'Chưa có thương hiệu công khai.');
 });
 run($('brief-projects'),async()=>{
  const rows=await list('projects',{select:ProjectData.select,order:'created_at.desc.nullslast,id.desc',limit:2},window.PROJECT_CONFIG);
  const items=rows.map(ProjectData.normalize);
  const cache=new Map();await Promise.all(items.map(async item=>{if(item.drive_folder_url&&typeof resolveDriveImages==='function'){const source={id:item.id,drive_folder_url:item.drive_folder_url,event_images:item.project_gallery,thumb:item.cover_image_url};await resolveDriveImages(source,cache);item.cover_image_url=source.thumb||item.cover_image_url;item.project_gallery=source.event_images||item.project_gallery;}}));
  $('brief-projects').replaceChildren();
  items.forEach(item=>{
   const card=el('article','brief-project'),link=el('a','brief-image-tile');link.href='project.html';link.setAttribute('aria-label',item.title);
   const photo=el('img','');photo.alt=item.title;photo.loading='lazy';photo.decoding='async';
   const sources=[...new Set([item.cover_image_url,...(item.project_gallery||[]).map(p=>p.image_url)].map(ProjectData.imageUrl).filter(Boolean))];let index=0;
   function nextPhoto(){if(index<sources.length){photo.src=sources[index++];}else{link.replaceChildren(el('span','project-image-empty','Ảnh project đang được cập nhật.'));}}
   photo.addEventListener('error',nextPhoto);link.append(photo,el('span','brief-image-label',item.title));nextPhoto();
   card.append(link,el('p','eyebrow',item.type||''),el('h3','',item.title));
   if(item.by_name?.trim())card.append(el('p','project-author','Project by '+item.by_name.trim()));
   $('brief-projects').append(card);
  });
  if(!items.length)empty($('brief-projects'),'Chưa có project.');
 });
 run(document.querySelector('.frequency-log'),async()=>{
  const rows=await createWishesClient(window.WISHES_CONFIG).list({limit:30,offset:0});
  const root=document.querySelector('.frequency-log');root.replaceChildren();const ol=el('ol','');
  rows.forEach(row=>{const li=el('li','');const date=Date.parse(row.created_at);li.append(el('time','',Number.isFinite(date)?new Intl.DateTimeFormat('vi-VN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Ho_Chi_Minh'}).format(date):''),el('span','signal-index',row.name||'Ẩn danh'),el('p','',row.message),el('span','','♡'));ol.append(li);});root.append(ol);if(!rows.length)empty(root,'Chưa có lời nhắn.');
 });
 run($('brief-resources'),async()=>{
  const rows=await list('resources',{is_published:'eq.true',order:'published_at.desc.nullslast,created_at.desc',limit:4});$('brief-resources').replaceChildren();
  rows.forEach((row,i)=>{const a=el('a','brief-resource');a.href='resources.html#'+encodeURIComponent(row.slug);a.append(el('span','resource-number',String(i+1).padStart(2,'0')),el('span','eyebrow',ContentDB.categories[row.category]||row.category),el('h3','',row.title),el('span','resource-arrow','↗'));$('brief-resources').append(a);});if(!rows.length)empty($('brief-resources'),'Chưa có bài viết công khai.');
 });
})();
