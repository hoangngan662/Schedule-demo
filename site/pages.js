(() => {
  const page = document.body.dataset.page, content = document.getElementById('page-content');
  if(page!=='gallery'||!content)return;
  let events = [], generation = 0;
  const safeUrl = value => typeof value === 'string' && /^(https?:\/\/|assets\/)/i.test(value) ? value : '';
  function el(tag, cls, text) {const node=document.createElement(tag);if(cls)node.className=cls;if(text!=null)node.textContent=text;return node;}
  function status(message,retry=false) {
    content.replaceChildren();
    const box=el('div','page-status',message);
    if(retry){box.append(document.createElement('br'));const button=el('button','page-button','Thử lại');button.addEventListener('click',load);box.append(button);}
    content.append(box);
  }
  function images(event) {
    const seen=new Set();
    return [...(event.event_images||[])].filter(image=>safeUrl(image.image_url)).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).filter(image=>{
      const key=image.drive_file_id||image.image_url;if(seen.has(key))return false;seen.add(key);return true;
    });
  }
  function gallery() {
    content.replaceChildren();
    const albums=events.filter(event=>images(event).length);
    document.getElementById('image-count').textContent=albums.length+' album';
    albums.forEach(event=>{
      const list=images(event);
      const cover=list.find(image=>image.is_cover)||list.find(image=>/main/i.test(image.file_name||''))||list[0];
      const card=el('article','album-card'),link=document.createElement('button'),photo=document.createElement('img');
      link.type='button';link.setAttribute('aria-haspopup','dialog');link.addEventListener('click',()=>openGalleryModal(event));
      link.setAttribute('aria-label','Xem tất cả '+list.length+' ảnh: '+event.name);
      photo.src=safeUrl(cover.image_url);photo.alt=event.name;photo.loading='lazy';photo.decoding='async';
      photo.addEventListener('error',()=>{photo.src='assets/event-default.jpg';},{once:true});
      const info=el('div','album-info');
      info.append(el('h2','',event.name));
      link.append(photo,info);card.append(link);content.append(card);
    });
    if(!albums.length)status('Chưa có album ảnh công khai.');
  }
  function openGalleryModal(event) {
    const dialog=document.getElementById('event-album-dialog');
    document.getElementById('event-album-title').textContent=event.name;
    document.getElementById('event-album-meta').textContent=[event.event_date?.split('-').reverse().join('/'),event.location,images(event).length+' ảnh'].filter(Boolean).join(' · ');
    const grid=document.getElementById('event-album-images');grid.replaceChildren();
    images(event).forEach((image,i)=>{
      const figure=el('figure',''),photo=document.createElement('img');
      photo.src=image.image_url;photo.alt=image.caption||('Ảnh '+(i+1)+' · '+event.name);photo.loading=i<3?'eager':'lazy';photo.decoding='async';
      photo.addEventListener('error',()=>photo.replaceWith(el('p','page-status','Không tải được ảnh.')),{once:true});
      figure.append(photo);grid.append(figure);
    });
    dialog.showModal();dialog.scrollTop=0;
    document.documentElement.classList.add('gallery-modal-open');
    document.getElementById('event-album-close').focus();
  }
  if(page==='gallery'){
    const dialog=document.getElementById('event-album-dialog');
    document.getElementById('event-album-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{document.documentElement.classList.remove('gallery-modal-open');document.getElementById('event-album-images').replaceChildren();});
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog)return;
      const r=dialog.getBoundingClientRect();
      if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
    });
  }
  async function load() {
    const current=++generation;status('Đang chuẩn bị không gian ảnh…');
    try {
      const config=window.SITE_CONFIG;
      const url=new URL('/rest/v1/events',config.SUPABASE_URL);
      url.searchParams.set('select','id,name,event_date,location,thumbnail_url,drive_folder_url,event_images(*)');
      url.searchParams.set('is_published','eq.true');
      url.searchParams.set('order','event_date.desc');
      const response=await fetch(url,{headers:{apikey:config.SUPABASE_PUBLISHABLE_KEY},signal:AbortSignal.timeout(20000)});
      if(!response.ok)throw new Error('Request failed: '+response.status);
      const data=await response.json();if(!Array.isArray(data))throw new Error('Invalid data');
      const cache=new Map();
      for(let i=0;i<data.length;i+=4)await Promise.all(data.slice(i,i+4).map(async event=>{
        event.thumb=event.thumbnail_url;
        if(event.drive_folder_url&&typeof resolveDriveImages==='function')await resolveDriveImages(event,cache);
      }));
      if(current!==generation)return;events=data;
      gallery();
    }catch(error){
      if(current!==generation)return;console.error('Page loading failed:',error.message);
      status('Chưa tải được nội dung. Bạn thử lại sau nhé.',true);if(page==='gallery')document.getElementById('image-count').textContent='';
    }
  }
  load();
})();
