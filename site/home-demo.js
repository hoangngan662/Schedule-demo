(() => {
 const $=id=>document.getElementById(id),el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
 const slides=[['assets/wall.jpg','BEX · featured banner'],['assets/page-background.jpg','BEX · a quiet moment'],['assets/event-default.jpg','BEX · illustration']];
 let slide=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function show(n){slide=(n+slides.length)%slides.length;$('hero-image').src=slides[slide][0];$('hero-image').alt=slides[slide][1];}
 setInterval(()=>{if(!document.hidden&&!reduced.matches)show(slide+1);},6000);
 const parts={};new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).forEach(x=>parts[x.type]=x.value);
 const y=Number(parts.year),m=Number(parts.month)-1,today=Number(parts.day),days=new Date(Date.UTC(y,m+1,0)).getUTCDate();
 const next=Math.min(today+2,days),monthKey=parts.year+'-'+parts.month;
 const sampleEvents=[
  {date:monthKey+'-'+String(next).padStart(2,'0'),time:'19:00',name:'A night with BEX',location:'Hà Nội'},
  {date:monthKey+'-'+String(Math.min(next+6,days)).padStart(2,'0'),time:'18:30',name:'Fan meeting',location:'Hà Nội'},
  {date:monthKey+'-'+String(Math.min(next+12,days)).padStart(2,'0'),time:'20:00',name:'Live cùng UPRIZE',location:'Online'},
  {date:monthKey+'-'+String(Math.min(next+6,days)).padStart(2,'0'),time:'21:00',name:'Radio: Những điều muốn nói',location:'Online'}
 ];
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
 calendar.replaceChildren(toolbar,grid,el('p','sample-small','Sample events · Select an event to view Schedule.'));
 function renderMonth(){
  monthSelect.value=String(viewM);yearSelect.value=String(viewY);grid.replaceChildren();
  const offset=new Date(Date.UTC(viewY,viewM,1)).getUTCDay(),total=new Date(Date.UTC(viewY,viewM+1,0)).getUTCDate();
  const week=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const count=Math.ceil((offset+total)/7)*7;
  for(let i=0;i<count;i++){
   const date=new Date(Date.UTC(viewY,viewM,i-offset+1)),dateKey=date.toISOString().slice(0,10),outside=date.getUTCMonth()!==viewM;
   const events=outside?[]:sampleEvents.filter(event=>event.date===dateKey);
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
 $('next-date').textContent=String(next).padStart(2,'0')+' / '+parts.month+' / '+parts.year;
 const photos=[['assets/page-background.jpg','A moment with BEX'],['assets/wall.jpg','On stage / BEX'],['assets/event-default.jpg','White Rose moments']];
 function picture(root,src,title,href){const a=el('a','brief-image-tile');a.href=href;a.setAttribute('aria-label',title);const img=el('img','');img.src=src;img.alt='';img.loading='lazy';a.append(img,el('span','brief-image-label',title));root.append(a);}
 photos.forEach(x=>picture($('brief-gallery'),x[0],x[1],'gallery.html'));
 const more=el('a','brief-image-tile brief-more');more.href='gallery.html';more.setAttribute('aria-label','View Gallery');const img=el('img','');img.src='assets/page-background.jpg';img.alt='';img.loading='lazy';more.append(img,el('span','','More ↗'));$('brief-gallery').append(more);
 [['assets/wall.jpg','A little light for BEX','Birthday fan project · Sample'],['assets/page-background.jpg','Together, in every season','Fan support project · Sample']].forEach(x=>{
  const card=el('article','brief-project');picture(card,x[0],x[1],'project.html');card.append(el('p','eyebrow',x[2]),el('h3','',x[1]));$('brief-projects').append(card);
 });
 [['01','Theo dõi lịch trình','Schedule guide'],['02','Tham gia fan project','Project guide'],['03','Gửi một tín hiệu','Frequency guide'],['04','Lưu giữ khoảnh khắc','Gallery guide']].forEach((x,i)=>{
  const a=el('a','brief-resource');a.href='resources.html#guide-'+(i+1);a.append(el('span','resource-number',x[0]),el('span','eyebrow',x[2]));const h=el('h3','',x[1]);a.append(h,el('span','resource-arrow','↗'));$('brief-resources').append(a);
 });
})();
