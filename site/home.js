(() => {
  const config=window.SITE_CONFIG;
  const safe=value=>typeof value==='string'&&/^(https?:\/\/|assets\/)/.test(value)?value:'';
  function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
  function message(id,text,retry){
    const root=document.getElementById(id),box=el('div','page-status',text);root.replaceChildren(box);
    if(retry){box.append(document.createElement('br'));const button=el('button','page-button','Thử lại');button.addEventListener('click',retry);box.append(button);}
  }
  async function request(table,select,limit,filters={}){
    const source=table==='projects'?window.PROJECT_CONFIG:config;
    const url=new URL('/rest/v1/'+table,source.SUPABASE_URL);
    url.searchParams.set('select',table==='projects'?window.ProjectData.select:select);
    if(table!=='projects')url.searchParams.set('is_published','eq.true');
    url.searchParams.set('order',table==='projects'?'created_at.desc.nullslast,id.desc':table==='events'?'event_date.desc':'sort_order.asc,created_at.desc');url.searchParams.set('limit',String(limit));
    for(const [key,value] of Object.entries(filters))url.searchParams.set(key,value);
    const response=await fetch(url,{headers:{apikey:source.SUPABASE_PUBLISHABLE_KEY},signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error('Request failed '+response.status);
    const rows=await response.json();if(!Array.isArray(rows))throw new Error('Invalid data');return table==='projects'?rows.map(window.ProjectData.normalize):rows;
  }
  function today(){
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),p={};
    parts.forEach(x=>p[x.type]=x.value);return p.year+'-'+p.month+'-'+p.day;
  }
  function schedule(rows,day){
    const [year,month]=day.split('-').map(Number),first=new Date(Date.UTC(year,month-1,1));
    const days=new Date(Date.UTC(year,month,0)).getUTCDate(),offset=(first.getUTCDay()+6)%7;
    const root=document.getElementById('home-schedule'),grid=el('div','month-grid');
    const heading=el('h3','month-title',new Intl.DateTimeFormat('en',{month:'long',year:'numeric',timeZone:'UTC'}).format(first));
    for(const label of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])grid.append(el('span','month-weekday',label));
    for(let i=0;i<Math.ceil((days+offset)/7)*7;i++){
      const number=i-offset+1;
      if(number<1||number>days){grid.append(el('span','month-blank'));continue;}
      const date=day.slice(0,8)+String(number).padStart(2,'0');
      const count=rows.filter(row=>row.event_date<=date&&(row.end_date||row.event_date)>=date).length;
      const cell=el(count?'a':'span','month-cell'+(date===day?' month-today':'')+(count?' month-has-event':''),number);
      if(date===day)cell.setAttribute('aria-current','date');
      if(count){
        cell.href='schedule.html?month='+date.slice(0,7)+'#lich';
        cell.setAttribute('aria-label',date+' · '+count+' events');
        cell.append(el('span','month-dot'));
      }
      grid.append(cell);
    }
    root.replaceChildren(heading,grid,el('p','month-legend','● Event day'));
  }
  async function monthOverview(){
    const day=today(),[year,month]=day.split('-').map(Number);
    const last=new Date(Date.UTC(year,month,0)).toISOString().slice(0,10);
    try{
      const rows=await request('events','event_date,end_date',1000,{event_date:'lte.'+last,or:'(event_date.gte.'+day.slice(0,7)+'-01,end_date.gte.'+day.slice(0,7)+'-01)'});
      schedule(rows,day);
    }catch(error){message('home-schedule','Chưa tải được lịch tháng.',monthOverview);}
  }
  async function albums(rows){
    const root=document.getElementById('home-gallery'),cache=new Map();
    const chosen=rows.filter(x=>x.drive_folder_url||(x.event_images||[]).some(i=>safe(i.image_url))).slice(0,4);
    await Promise.all(chosen.map(async item=>{item.thumb=item.thumbnail_url;if(item.drive_folder_url&&typeof resolveDriveImages==='function')await resolveDriveImages(item,cache);}));
    root.replaceChildren();
    const previews=chosen.map(item=>{
      const list=(item.event_images||[]).filter(x=>safe(x.image_url));
      const cover=list.find(x=>x.is_cover)||list.find(x=>/main/i.test(x.file_name||''))||list[0];
      return cover?{item,cover}:null;
    }).filter(Boolean);
    if(!previews.length){message('home-gallery','Các album ảnh sẽ được cập nhật tại đây.');return;}
    function tile({item,cover},more=false){
      const link=el('a','home-project-tile'+(more?' home-project-more':'')),image=el('img','');
      link.href=more?'gallery.html':'gallery-album.html?id='+encodeURIComponent(item.id);
      link.setAttribute('aria-label',more?'View all albums':item.name);
      image.src=cover.image_url;image.alt='';image.loading='lazy';
      image.addEventListener('error',()=>{image.src='assets/event-default.jpg';},{once:true});
      link.append(image);
      if(more)link.append(el('span','','More →')); else link.append(el('span','home-tile-label',item.name));
      root.append(link);
    }
    previews.slice(0,3).forEach(item=>tile(item));
    tile(previews[3]||previews[previews.length-1],true);
  }
  async function events(){
    message('home-gallery','Đang tải album…');
    try{
      const rows=await request('events','id,name,event_date,end_date,start_time,event_types,location,thumbnail_url,drive_folder_url,event_images(*)',100);
      await albums(rows);
    }catch(error){
      console.error('Home events:',error.message);
      message('home-gallery','Chưa tải được album.',events);
    }
  }
  async function projects(){
    const id='home-project',root=document.getElementById(id);
    message(id,'Đang tải project…');
    try{
      const rows=await request('projects',null,4);
      root.replaceChildren();
      if(!rows.length){message(id,'Các project sẽ được cập nhật.');return;}
      function tile(item,more=false){
        const link=el('a','home-project-tile'+(more?' home-project-more':'')),image=el('img','');
        link.href=more?'project.html':'project-detail.html?id='+encodeURIComponent(item.id);
        link.setAttribute('aria-label',more?'View all fan projects':item.title);
        image.src=safe(item.cover_image_url)||'assets/event-default.jpg';
        image.alt='';image.loading='lazy';
        image.addEventListener('error',()=>{image.src='assets/event-default.jpg';},{once:true});
        link.append(image);
        if(more)link.append(el('span','','More →')); else link.append(el('span','home-tile-label',item.title));
        root.append(link);
      }
      rows.slice(0,3).forEach(item=>tile(item));
      tile(rows[3]||rows[rows.length-1],true);
    }catch(error){console.error('Home projects:',error.message);message(id,'Chưa tải được project.',projects);}
  }
  monthOverview();events();projects();
})();
