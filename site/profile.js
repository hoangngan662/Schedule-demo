(() => {
 const sections=[['journey','journey'],['musics','music'],['film-game','film_game'],['shows','show'],['press','press'],['awards','award']].map(([id,key])=>({id,key}));
 const engines=[];
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
 ContentDB.run(document.querySelector('.artist-intro'),async()=>{
  const profiles=await ContentDB.list('artist_profiles',{is_published:'eq.true',slug:'eq.bex',limit:1});
  const profile=profiles[0];
  if(!profile){ContentDB.empty(document.querySelector('.artist-intro'));sections.forEach(section=>ContentDB.empty(document.getElementById(section.id+'-track')));return;}
  const intro=document.querySelector('.artist-intro'),title=el('h1','',profile.stage_name);title.id='artist-title';
  const facts=el('dl','');[['NAME',profile.full_name],['BIRTH DATE',profile.birth_date],['HEIGHT',profile.height_cm?profile.height_cm+' cm':null],['ZODIAC',profile.zodiac]].forEach(([label,value])=>{if(value){const row=el('div','');row.append(el('dt','',label),el('dd','',String(value)));facts.append(row);}});
  intro.replaceChildren(title,el('p','artist-description',profile.biography||profile.introduction||''),facts);
  const entries=await ContentDB.list('profile_entries',{profile_id:'eq.'+profile.id,is_published:'eq.true'});
  sections.forEach(section=>{section.entries=entries.filter(row=>row.section===section.key);});
  renderSections();
 });
 function renderSections(){sections.forEach((section,sectionIndex)=>{
  const track=document.getElementById(section.id+'-track'),container=track.closest('.artist-carousel');
  track.replaceChildren();
  if(!section.entries.length){ContentDB.empty(track);return;}
  section.entries.forEach((item,i)=>{
   const title=item.title;
   const card=el('article','artist-card'),media=el('div','artist-card-media'),image=el('img',''),info=el('div','artist-card-info'),tags=el('div','artist-card-tags'),timeline=el('div','artist-card-timeline');
   const src=ContentDB.safe(item.cover_image_url);if(src)image.src=src;else image.hidden=true;image.alt=title;image.loading='lazy';image.decoding='async';
   media.append(image);
   info.append(el('h3','',title),el('p','',item.summary||item.content||''));
   (item.tags||[]).forEach(tag=>tags.append(el('span','',tag)));info.append(tags);timeline.append(el('span','',item.timeline_label||item.starts_on||''));
   card.append(media,info,timeline);track.append(card);
  });
  const originals=[...track.children];
  for(let copy=0;copy<Math.max(2,Math.ceil(8/originals.length));copy++)originals.forEach(card=>{const clone=card.cloneNode(true);clone.setAttribute('aria-hidden','true');track.append(clone);});
  const engine={track,offset:0,velocity:0,pressed:false,dragging:false,lastX:0,startX:0,startY:0,hover:false};
  function paint(){
   const width=track.children[originals.length].offsetLeft-track.children[0].offsetLeft;
   if(width>0){engine.offset=((engine.offset%width)+width)%width;track.scrollLeft=engine.offset;}
  }
  engine.paint=paint;engines.push(engine);
  track.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')engine.hover=true;});
  track.addEventListener('pointerleave',()=>{engine.hover=false;});
  track.addEventListener('dragstart',e=>e.preventDefault());
  track.addEventListener('pointerdown',e=>{
   if(e.button!==0)return;engine.pressed=true;engine.dragging=false;engine.velocity=0;engine.startX=engine.lastX=e.clientX;engine.startY=e.clientY;
  });
  track.addEventListener('pointermove',e=>{
   if(!engine.pressed)return;
   if(!engine.dragging){
    if(e.pointerType==='touch'&&Math.abs(e.clientY-engine.startY)>Math.abs(e.clientX-engine.startX)){engine.pressed=false;return;}
    if(Math.abs(e.clientX-engine.startX)<6)return;
    engine.dragging=true;track.setPointerCapture(e.pointerId);track.classList.add('is-dragging');
   }
   e.preventDefault();const dx=engine.lastX-e.clientX;engine.lastX=e.clientX;engine.offset+=dx;engine.velocity=dx;paint();
  });
  function release(e){engine.pressed=false;engine.dragging=false;track.classList.remove('is-dragging');if(track.hasPointerCapture(e.pointerId))track.releasePointerCapture(e.pointerId);}
  track.addEventListener('pointerup',release);track.addEventListener('pointercancel',e=>{engine.velocity=0;release(e);});
  track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();engine.offset+=(e.key==='ArrowRight'?1:-1)*track.clientWidth*.6;paint();}});

 });}
 let last=0,frame;
 function tick(time){
  const delta=last?Math.min(time-last,50):0;last=time;
  if(!document.hidden)engines.forEach(engine=>{
   const rect=engine.track.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)return;
   if(!engine.pressed&&!reduced.matches){
    if(Math.abs(engine.velocity)>.4){engine.offset+=engine.velocity*delta/16.67;engine.velocity*=Math.pow(.92,delta/16.67);}
    else if(!engine.hover&&!engine.track.matches(':focus-visible'))engine.offset+=delta*.08;
   }
   engine.paint();
  });
  frame=requestAnimationFrame(tick);
 }
 frame=requestAnimationFrame(tick);window.addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
})();
