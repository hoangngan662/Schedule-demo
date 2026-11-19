(() => {
 try{if(Date.now()-Number(sessionStorage.getItem('bex:preloaded:v1'))<(window.SiteCache?.ttl||300000)){window.SiteLoading={begin:()=>()=>{},track:promise=>Promise.resolve(promise)};return;}}catch{}
 const root=document.documentElement;
 root.classList.add('site-loading');root.setAttribute('aria-busy','true');
 let pending=1,finished=false,version=0;
 const started=performance.now();
 function reveal(){
  if(finished)return;finished=true;clearTimeout(deadline);
  root.classList.remove('site-loading');root.removeAttribute('aria-busy');
  const banner=document.getElementById('site-loading-banner');
  if(banner){banner.classList.add('is-finished');setTimeout(()=>banner.remove(),400);}
 }
 async function check(){
  if(pending||finished)return;
  const current=++version;
  // Data is rendered before images in the initial viewport are decoded.
  const pictures=[...document.images].filter(img=>!img.hidden&&img.getAttribute('src')&&img.getBoundingClientRect().top<innerHeight);
  await Promise.race([
   Promise.allSettled(pictures.map(img=>img.decode?img.decode():Promise.resolve())),
   new Promise(resolve=>setTimeout(resolve,6000))
  ]);
  await new Promise(resolve=>setTimeout(resolve,Math.max(0,600-(performance.now()-started))));
  if(!pending&&current===version)reveal();
 }
 function begin(){
  if(finished)return ()=>{};
  pending++;version++;let done=false;
  return ()=>{if(done)return;done=true;pending--;check();};
 }
 function track(promise){const end=begin();return Promise.resolve(promise).finally(end);}
 window.SiteLoading={begin,track};
 document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.querySelector('.site-nav');
  if(nav){
   const measure=()=>root.style.setProperty('--loading-nav-height',Math.max(0,nav.getBoundingClientRect().bottom)+'px');
   measure();
   if('ResizeObserver' in window){const observer=new ResizeObserver(measure);observer.observe(nav);setTimeout(()=>observer.disconnect(),45000);}
   window.addEventListener('resize',measure);
  }
  pending--;check();
 },{once:true});
 // A broken script or unavailable service must not lock the site indefinitely.
 const deadline=setTimeout(reveal,45000);
 setTimeout(()=>{const label=document.getElementById('site-loading-label');if(label&&!finished)label.textContent='Đang kết nối dữ liệu, bạn chờ một chút nhé…';},12000);
 window.addEventListener('pageshow',event=>{if(event.persisted)reveal();});
})();
