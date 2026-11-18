(() => {
 const sections=[
  {id:'journey',labels:['Chapter One','Finding the stage','A new beginning','Together as UPRIZE','The journey continues'],tags:['Milestone'],timeline:['2018 · Sample','2019 · Sample','2022 · Sample','2025 · Sample','2026 · Sample']},
  {id:'musics',labels:['First melody','A voice, a story','Live session','Together in harmony','The next track'],tags:['Music','Sample'],timeline:['Single','Music video','Live','Group release','Coming chapter']},
  {id:'film-game',labels:['On screen','A different character','Play together','Behind the scene','New worlds'],tags:['Film / Game','Sample'],timeline:['Film','Character','Game','Behind the scene','Special']},
  {id:'shows',labels:['The first spotlight','A stage to remember','In conversation','A shared stage','One more encore'],tags:['Show','Sample'],timeline:['Stage','Performance','Talk show','Group stage','Special']},
  {id:'press',labels:['The cover story','Between the lines','In focus','A conversation with BEX','Through another lens'],tags:['Press','Sample'],timeline:['Magazine','Interview','Editorial','Feature','Cover']},
  {id:'awards',labels:['A moment of recognition','The nomination','On the shortlist','A memorable milestone','Looking forward'],tags:['Illustration only'],timeline:['Award sample','Nomination sample','Nomination sample','Award sample','Archive sample']}
 ];
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
  const previous=container.querySelector('[data-direction="-1"]'),next=container.querySelector('[data-direction="1"]'),position=container.querySelector('.artist-position');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  function step(){return track.children[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(track).columnGap)||0);}
  function update(){
   const index=Math.max(0,Math.min(track.children.length-1,Math.round(track.scrollLeft/step())));
   position.textContent=String(index+1).padStart(2,'0')+' / '+String(track.children.length).padStart(2,'0');
   previous.disabled=track.scrollLeft<2;
   next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;
  }
  function move(direction){track.scrollBy({left:direction*step(),behavior:reduced.matches?'instant':'smooth'});}
  previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  track.addEventListener('keydown',event=>{
   if(event.target!==track)return;
   if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
  });
  track.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  update();
 });
})();
