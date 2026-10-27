(() => {
  const config=window.SITE_CONFIG;
  const safe=value=>typeof value==='string'&&/^(https?:\/\/|assets\/)/.test(value)?value:'';
  function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
  function message(id,text,retry){
    const root=document.getElementById(id),box=el('div','page-status',text);root.replaceChildren(box);
    if(retry){box.append(document.createElement('br'));const button=el('button','page-button','Thử lại');button.addEventListener('click',retry);box.append(button);}
  }
  async function request(table,select,limit){
    const source=table==='projects'?window.PROJECT_CONFIG:config;
    const url=new URL('/rest/v1/'+table,source.SUPABASE_URL);
    url.searchParams.set('select',table==='projects'?window.ProjectData.select:select);
    if(table!=='projects')url.searchParams.set('is_published','eq.true');
    url.searchParams.set('order',table==='projects'?'created_at.desc.nullslast,id.desc':table==='events'?'event_date.desc':'sort_order.asc,created_at.desc');url.searchParams.set('limit',String(limit));
    const response=await fetch(url,{headers:{apikey:source.SUPABASE_PUBLISHABLE_KEY},signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error('Request failed '+response.status);
    const rows=await response.json();if(!Array.isArray(rows))throw new Error('Invalid data');return table==='projects'?rows.map(window.ProjectData.normalize):rows;
  }
  function today(){
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),p={};
    parts.forEach(x=>p[x.type]=x.value);return p.year+'-'+p.month+'-'+p.day;
  }
  function schedule(rows){
    const day=today(),active=rows.filter(x=>(x.end_date||x.event_date)>=day).sort((a,b)=>{
      const at=a.event_date<=day,bt=b.event_date<=day;
      return Number(bt)-Number(at)||a.event_date.localeCompare(b.event_date)||(a.start_time||'').localeCompare(b.start_time||'');
    });
    const chosen=(active.length?active:rows).slice(0,3),root=document.getElementById('home-schedule');root.replaceChildren();
    if(!chosen.length){message('home-schedule','Lịch trình sẽ được cập nhật tại đây.');return;}
    chosen.forEach(item=>{
      const isToday=item.event_date<=day&&(item.end_date||item.event_date)>=day;
      const card=el('a','home-event'+(isToday?' is-today':'')),date=el('div','home-event-date'),info=el('div','');
      card.href='schedule.html#lich';const parts=item.event_date.split('-');
      date.append(el('b','',parts[2]),el('small','','THÁNG '+parts[1]));
      info.append(el('span','eyebrow',isToday?'HÔM NAY':(item.event_types||[]).join(' · ')),el('h3','',item.name));
      info.append(el('p','',[item.start_time?.slice(0,5),item.location].filter(Boolean).join(' · ')));
      card.append(date,info);root.append(card);
    });
  }
  async function albums(rows){
    const root=document.getElementById('home-gallery'),cache=new Map();
    const chosen=rows.filter(x=>x.drive_folder_url||(x.event_images||[]).some(i=>safe(i.image_url))).slice(0,3);
    await Promise.all(chosen.map(async item=>{item.thumb=item.thumbnail_url;if(item.drive_folder_url&&typeof resolveDriveImages==='function')await resolveDriveImages(item,cache);}));
    root.replaceChildren();let count=0;
    chosen.forEach(item=>{
      const list=(item.event_images||[]).filter(x=>safe(x.image_url));if(!list.length)return;count++;
      const cover=list.find(x=>x.is_cover)||list.find(x=>/main/i.test(x.file_name||''))||list[0];
      const card=el('article','album-card'),link=el('a',''),image=el('img',''),info=el('div','album-info');
      link.href='gallery-album.html?id='+encodeURIComponent(item.id);image.src=cover.image_url;image.alt=item.name;image.loading='lazy';
      image.addEventListener('error',()=>{image.src='assets/event-default.jpg';},{once:true});
      info.append(el('h2','',item.name),el('p','',item.event_date.split('-').reverse().join('/')+' · '+list.length+' ảnh'));
      link.append(image,info);card.append(link);root.append(card);
    });
    if(!count)message('home-gallery','Các album ảnh sẽ được cập nhật tại đây.');
  }
  async function events(){
    message('home-schedule','Đang tải lịch trình…');message('home-gallery','Đang tải album…');
    try{
      const rows=await request('events','id,name,event_date,end_date,start_time,event_types,location,thumbnail_url,drive_folder_url,event_images(*)',100);
      schedule(rows);await albums(rows);
    }catch(error){
      console.error('Home events:',error.message);
      message('home-schedule','Chưa tải được lịch trình.',events);
      message('home-gallery','Chưa tải được album.',events);
    }
  }
  async function collection(kind){
    const id='home-'+kind,table=kind==='brand'?'brands':'projects';
    message(id,'Đang tải nội dung…');
    try{
      const rows=await request(table,'id,title,summary,cover_image_url,sort_order,created_at',3),root=document.getElementById(id);
      root.replaceChildren();
      if(!rows.length){message(id,kind==='brand'?'Thông tin thương hiệu sẽ được cập nhật.':'Các project sẽ được cập nhật.');return;}
      rows.forEach(item=>{
        const card=el('article','collection-card'),link=el('a',''),image=el('img',''),more=el('a','text-link','Khám phá →');
        link.href=kind+'-detail.html?id='+encodeURIComponent(item.id);more.href=link.href;
        image.src=safe(item.cover_image_url)||'assets/event-default.jpg';image.alt=item.title;image.loading='lazy';
        image.addEventListener('error',()=>{image.src='assets/event-default.jpg';},{once:true});link.append(image);
        card.append(link,el('div','collection-meta',kind==='brand'?'Brand':[item.type,item.status].filter(Boolean).join(' · ')),el('h2','',item.title));
        if(item.summary)card.append(el('p','',item.summary));
        card.append(more);root.append(card);
      });
    }catch(error){console.error('Home content:',error.message);message(id,'Chưa tải được nội dung.',()=>collection(kind));}
  }
  events();collection('project');collection('brand');
})();
