/* One wheel gesture advances one Home chapter; long chapters remain readable. */
(() => {
  if (!document.body.classList.contains('profile-page')) return;
  const desktop = matchMedia('(min-width:821px) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const syncMode=()=>document.documentElement.classList.toggle('section-wheel-scroll',desktop.matches&&!reduced.matches);
  syncMode();
  desktop.addEventListener('change',syncMode);
  reduced.addEventListener('change',syncMode);
  let animating=false, lastWheel=-Infinity;
  const sections=()=>[...document.querySelectorAll('.artist-banner,.artist-section,.profile-page>.site-footer')];
  function animateTo(target){
    const from=window.scrollY,delta=target-from;
    if(reduced.matches){window.scrollTo({top:target,behavior:'instant'});return;}
    animating=true;
    const start=performance.now(),duration=560;
    function tick(now){
      const progress=Math.min(1,(now-start)/duration);
      const eased=progress<.5?4*progress*progress*progress:1-Math.pow(-2*progress+2,3)/2;
      window.scrollTo({top:from+delta*eased,behavior:'instant'});
      if(progress<1)requestAnimationFrame(tick);
      else animating=false;
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('wheel',event=>{
    if(!desktop.matches||reduced.matches||event.ctrlKey||Math.abs(event.deltaY)<Math.abs(event.deltaX)||!event.deltaY)return;
    if(document.querySelector('dialog[open]'))return;
    if(event.target.closest('input,textarea,select,.nav-group'))return;
    // Keep nested scroll areas usable (for example a long Frequency log).
    for(let node=event.target;node&&node!==document.body;node=node.parentElement){
      const style=getComputedStyle(node);
      if(/auto|scroll/.test(style.overflowY)&&node.scrollHeight>node.clientHeight+2){
        if(event.deltaY>0&&node.scrollTop+node.clientHeight<node.scrollHeight-2)return;
        if(event.deltaY<0&&node.scrollTop>2)return;
      }
    }
    const now=performance.now(),gap=now-lastWheel;
    lastWheel=now;
    if(animating||gap<130){event.preventDefault();return;}
    const frames=sections(),header=document.querySelector('.site-nav').getBoundingClientRect().height;
    const top=window.scrollY+header,available=window.innerHeight-header;
    let index=0;
    frames.forEach((frame,i)=>{if(window.scrollY+frame.getBoundingClientRect().top<=top+8)index=i;});
    const frame=frames[index],start=window.scrollY+frame.getBoundingClientRect().top;
    const end=start+frame.offsetHeight;
    const direction=event.deltaY>0?1:-1;
    // A chapter taller than the screen is paged before leaving it.
    let target;
    if(direction>0&&top+available<end-12)target=Math.min(window.scrollY+available,end-window.innerHeight);
    else if(direction<0&&top>start+12)target=Math.max(start-header,window.scrollY-available);
    else{
      const next=frames[index+direction];
      if(!next)return;
      target=window.scrollY+next.getBoundingClientRect().top-header;
    }
    event.preventDefault();
    const maximum=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
    animateTo(Math.max(0,Math.min(target,maximum)));
  },{passive:false});
})();
