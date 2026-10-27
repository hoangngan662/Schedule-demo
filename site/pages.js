(() => {
  const page = document.body.dataset.page, content = document.getElementById('page-content'), filter = document.getElementById('event-filter');
  let events = [], generation = 0;
  const isGallery = page === 'gallery' || page === 'gallery-album';
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
      const card=el('article','album-card'),link=document.createElement('a'),photo=document.createElement('img');
      link.href='gallery-album.html?id='+encodeURIComponent(event.id);
      link.setAttribute('aria-label','Xem tất cả '+list.length+' ảnh: '+event.name);
      photo.src=safeUrl(cover.image_url);photo.alt=event.name;photo.loading='lazy';photo.decoding='async';
      photo.addEventListener('error',()=>{photo.src='assets/event-default.jpg';},{once:true});
      const info=el('div','album-info');
      info.append(el('h2','',event.name),el('p','',event.event_date.split('-').reverse().join('/')+' · '+list.length+' ảnh'));
      link.append(photo,info);card.append(link);content.append(card);
    });
    if(!albums.length)status('Chưa có album ảnh công khai.');
  }
  function album() {
    content.replaceChildren();
    const event=events[0];
    if(!event){status('Album chưa được công khai hoặc không tồn tại.');return;}
    const list=images(event);
    document.title=event.name+' · Gallery';
    document.getElementById('album-title').textContent=event.name;
    document.getElementById('album-meta').textContent=event.event_date.split('-').reverse().join('/')+' · '+list.length+' ảnh';
    list.forEach((image,i)=>{
      const figure=el('figure','exhibit'),photo=document.createElement('img');
      photo.src=safeUrl(image.image_url);photo.alt=image.caption||('Ảnh '+(i+1)+' – '+event.name);
      photo.loading=i<2?'eager':'lazy';photo.decoding='async';
      photo.addEventListener('error',()=>photo.replaceWith(el('div','page-status','Ảnh hiện không tải được.')),{once:true});
      figure.append(photo);content.append(figure);
    });
    if(!list.length)status('Album này chưa có ảnh.');
  }
  function collection() {
    content.replaceChildren();
    if(!events.length){status(page==='brand'?'Thông tin thương hiệu sẽ được cập nhật tại đây.':'Các project sẽ được cập nhật tại đây.');return;}
    events.forEach(item=>{
      const card=el('article','collection-card'),link=document.createElement('a'),image=document.createElement('img');
      const href=(page==='brand'?'brand-detail.html':'project-detail.html')+'?id='+encodeURIComponent(item.id);
      link.href=href;link.setAttribute('aria-label','Xem '+item.title);
      image.src=safeUrl(item.cover_image_url)||'assets/event-default.jpg';
      image.alt=item.title;image.loading='lazy';image.addEventListener('error',()=>{image.src='assets/event-default.jpg';},{once:true});link.append(image);
      card.append(link,el('div','collection-meta',page==='brand'?'Brand & collaboration':'Fan project'),el('h2','',item.title));
      if(item.summary)card.append(el('p','',item.summary));
      const more=el('a','text-link','Khám phá →');more.href=href;card.append(more);content.append(card);
    });
  }
  function detail() {
    content.replaceChildren();
    const item=events[0];
    if(!item){status('Nội dung chưa được công khai hoặc không tồn tại.');return;}
    document.title=item.title+' · Cường Bạch';
    document.getElementById('detail-title').textContent=item.title;
    document.getElementById('detail-summary').textContent=item.summary||'';
    if(safeUrl(item.cover_image_url)){const img=document.createElement('img');img.src=item.cover_image_url;img.alt=item.title;img.className='detail-cover';content.append(img);}
    content.append(el('div','detail-body',item.content||'Nội dung đang được cập nhật.'));
    if(safeUrl(item.website_url)&&/^https?:/.test(item.website_url)){const link=el('a','page-button','Trang chính thức ↗');link.href=item.website_url;link.rel='noopener';content.append(link);}
  }
  async function load() {
    const current=++generation;status(isGallery?'Đang chuẩn bị không gian ảnh…':'Đang tải các hoạt động…');
    try {
      const config=window.SITE_CONFIG;
      const table=isGallery?'events':page.startsWith('brand')?'brands':'projects';
      const url=new URL('/rest/v1/'+table,config.SUPABASE_URL);
      url.searchParams.set('select',isGallery?'id,name,event_date,thumbnail_url,drive_folder_url,event_images(*)':'id,title,summary,content,cover_image_url,website_url,sort_order,created_at');
      if(page.endsWith('-detail')||page==='gallery-album'){
        const id=new URLSearchParams(location.search).get('id');
        if(!id||!/^[0-9a-f-]{36}$/i.test(id)){status('Đường dẫn không hợp lệ.');return;}
        url.searchParams.set('id','eq.'+id);url.searchParams.set('limit','1');
      }
      url.searchParams.set('is_published','eq.true');url.searchParams.set('order',isGallery?'event_date.desc':'sort_order.asc,created_at.desc');
      const response=await fetch(url,{headers:{apikey:config.SUPABASE_PUBLISHABLE_KEY},signal:AbortSignal.timeout(20000)});
      if(!response.ok)throw new Error('Request failed: '+response.status);
      const data=await response.json();if(!Array.isArray(data))throw new Error('Invalid data');
      const cache=new Map();
      for(let i=0;isGallery&&i<data.length;i+=4)await Promise.all(data.slice(i,i+4).map(async event=>{
        event.thumb=event.thumbnail_url;
        if(event.drive_folder_url&&typeof resolveDriveImages==='function')await resolveDriveImages(event,cache);
      }));
      if(current!==generation)return;events=data;
      if(page==='gallery')gallery();
      else if(page==='gallery-album')album();
      else if(page.endsWith('-detail'))detail();
      else collection();
    }catch(error){
      if(current!==generation)return;console.error('Page loading failed:',error.message);
      status('Chưa tải được nội dung. Bạn thử lại sau nhé.',true);if(page==='gallery')document.getElementById('image-count').textContent='';
    }
  }
  if(filter)filter.addEventListener('change',gallery);
  load();
})();
