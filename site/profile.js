(() => {
 const sections=[
  {id:'journey',labels:['Chapter One','Finding the stage','A new beginning','Together as UPRIZE','The journey continues'],tags:['Milestone'],timeline:['2018 · Sample','2019 · Sample','2022 · Sample','2025 · Sample','2026 · Sample']},
  {id:'musics',labels:['First melody','A voice, a story','Live session','Together in harmony','The next track'],tags:['Music','Sample'],timeline:['Single','Music video','Live','Group release','Coming chapter']},
  {id:'film-game',labels:['On screen','A different character','Play together','Behind the scene','New worlds'],tags:['Film / Game','Sample'],timeline:['Film','Character','Game','Behind the scene','Special']},
  {id:'shows',labels:['The first spotlight','A stage to remember','In conversation','A shared stage','One more encore'],tags:['Show','Sample'],timeline:['Stage','Performance','Talk show','Group stage','Special']},
  {id:'press',labels:['The cover story','Between the lines','In focus','A conversation with BEX','Through another lens'],tags:['Press','Sample'],timeline:['Magazine','Interview','Editorial','Feature','Cover']},
  {id:'awards',labels:['A moment of recognition','The nomination','On the shortlist','A memorable milestone','Looking forward'],tags:['Illustration only'],timeline:['Award sample','Nomination sample','Nomination sample','Award sample','Archive sample']}
 ];
 const engines=[];
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const pictures=['assets/page-background.jpg','assets/wall.jpg','assets/event-default.jpg'];
 const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
 sections.forEach((section,sectionIndex)=>{
  const track=document.getElementById(section.id+'-track'),container=track.closest('.artist-carousel');
  section.labels.forEach((title,i)=>{
   const card=el('article','artist-card'),media=el('div','artist-card-media'),image=el('img',''),info=el('div','artist-card-info'),tags=el('div','artist-card-tags'),timeline=el('div','artist-card-timeline');
   image.src=pictures[(i+sectionIndex)%pictures.length];image.alt='Ảnh minh họa · '+title;image.loading='lazy';image.decoding='async';
   media.append(image,el('span','artist-card-index','SAMPLE / '+String(i+1).padStart(2,'0')));
   info.append(el('h3','',title),el('p','','Nội dung mẫu để xem bố cục. Thông tin và nguồn chính thức sẽ được bổ sung sau.'));
   section.tags.forEach(tag=>tags.append(el('span','',tag)));info.append(tags);timeline.append(el('span','',section.timeline[i]));
   card.append(media,info,timeline);track.append(card);
  });
  const originals=[...track.children];
  for(let copy=0;copy<2;copy++)originals.forEach(card=>{const clone=card.cloneNode(true);clone.setAttribute('aria-hidden','true');track.append(clone);});
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

 });
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
