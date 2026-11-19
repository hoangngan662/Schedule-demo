(() => {
 const routes={'index.html':'home','profile.html':'profile','schedule.html':'schedule','gallery.html':'gallery','brand.html':'brands','project.html':'projects','frequency.html':'frequency','resources.html':'resources'};
 const page=routes[location.pathname.split('/').pop()||'index.html'];
 const banner=document.querySelector('.brief-hero,.artist-banner,.projects-banner,.campaigns-banner,.resources-banner,.schedule-banner,.schedule-page .hero');
 if(!banner)return;
 let photo=banner.querySelector('img');
 if(banner.matches('.hero')){banner.style.backgroundImage='none';photo=ContentDB.node('img','database-banner-photo');banner.prepend(photo);}
if(photo){photo.removeAttribute('src');photo.hidden=true;}
 const caption=banner.querySelector('.hero-caption');if(caption)caption.replaceChildren();
 const state=ContentDB.node('div','banner-data-status');banner.append(state);
 ContentDB.run(state,async()=>{
  const rows=await ContentDB.list('site_banners',{page:'eq.'+page,is_published:'eq.true'});
  const now=Date.now(),slides=rows.filter(row=>(!row.starts_at||Date.parse(row.starts_at)<=now)&&(!row.ends_at||Date.parse(row.ends_at)>now));
  state.replaceChildren();if(!slides.length){state.textContent='Banner đang được cập nhật.';return;}
  let index=0;
  function show(){
   const row=slides[index],src=ContentDB.safe(matchMedia('(max-width:820px)').matches&&row.mobile_image_url?row.mobile_image_url:row.image_url);
   if(photo){photo.hidden=!src;if(src)photo.src=src;photo.alt=row.alt_text||row.title||'';photo.style.objectPosition=row.image_position||'center';}
   if(caption){caption.replaceChildren();if(row.subtitle)caption.append(ContentDB.node('span','',row.subtitle));if(row.title)caption.append(ContentDB.node('p','',row.title));}
  }
  show();matchMedia('(max-width:820px)').addEventListener('change',show);
  if(slides.length>1)setInterval(()=>{if(!document.hidden&&!matchMedia('(prefers-reduced-motion:reduce)').matches){index=(index+1)%slides.length;show();}},6000);
 });
})();
