(() => {
 const marker='bex:preloaded:v1';
 try{if(Date.now()-Number(sessionStorage.getItem(marker))<SiteCache.ttl)return;}catch{}
 const end=window.SiteLoading?.begin()||(()=>{});
 const pages=['index.html','profile.html','schedule.html','gallery.html','brand.html','frequency.html','project.html','resources.html'];
 const publicRows={is_published:'eq.true'};
 const {list}=ContentDB;
 async function warmFiles(){
  await Promise.allSettled(pages.map(async page=>{
   const response=await fetch(page,{cache:'force-cache'});if(!response.ok)return;
   const html=new DOMParser().parseFromString(await response.text(),'text/html');
   const urls=[...html.querySelectorAll('script[src],link[rel="stylesheet"][href]')].map(node=>node.getAttribute('src')||node.getAttribute('href'));
   await Promise.allSettled(urls.map(url=>fetch(url,{cache:'force-cache'})));
  }));
 }
 async function warmData(){
  const profiles=await list('artist_profiles',{...publicRows,slug:'eq.bex',limit:1});
  const tasks=[
   ...['home','profile','schedule','brands','projects','resources'].map(page=>list('site_banners',{page:'eq.'+page,...publicRows})),
   list('events',{...publicRows,select:'id,name,event_date,location,thumbnail_url,drive_folder_url,event_images(*)',order:'event_date.desc'}),
   list('brands',{...publicRows}),list('brands',{...publicRows,limit:8}),
   list('brand_campaigns',{...publicRows,select:'*,campaign_images(*),campaign_links(*)'}),
   list('resources',{...publicRows,select:'*,resource_images(*)',order:'published_at.desc.nullslast,created_at.desc'}),
   list('resources',{...publicRows,order:'published_at.desc.nullslast,created_at.desc',limit:4}),
   list('events',{...publicRows,order:'event_date.asc,start_time.asc.nullslast'}),
   list('events',{...publicRows,select:'id,name,event_date,thumbnail_url,drive_folder_url,event_images(*)',order:'event_date.desc'}),
   list('projects',{select:ProjectData.select,order:'created_at.desc.nullslast,id.desc',limit:2},window.PROJECT_CONFIG),
   list('projects',{select:ProjectData.select,order:'created_at.desc.nullslast,id.desc'},window.PROJECT_CONFIG),
   createWishesClient(window.WISHES_CONFIG).list({limit:3,offset:0}),
   createWishesClient(window.WISHES_CONFIG).list({limit:5,offset:0}),
   import('../supabase/event-client.mjs').then(module=>module.fetchPublishedEvents())
  ];
  if(profiles[0])tasks.push(list('profile_entries',{profile_id:'eq.'+profiles[0].id,...publicRows}));
  const results=await Promise.allSettled(tasks);
  // Only skip the next full-screen load when all required APIs were warmed.
  if(results.every(result=>result.status==='fulfilled'))try{sessionStorage.setItem(marker,String(Date.now()));}catch{}
 }
 Promise.allSettled([warmFiles(),warmData()]).finally(end);
})();
