/* Entrance motion is progressive: content is visible unless animation starts. */
(() => {
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  const visible = new WeakSet();
  const selector = '.about-image,.brief-about>div:last-child,.home-section-heading,#brief-calendar,.nearest-event,.brief-image-tile,#home-brand>.brand-demo-card,#home-brand>.home-project-more,.wr-intro,.wr-project-panel>.home-section-heading,.brief-project,.wr-frequency-panel>.home-section-heading,.frequency-log,.wr-resource-panel>.home-section-heading,.brief-resource,.home-layout-footer>img';
  const targets = [...document.querySelectorAll(selector)].filter(target => {
    // Animate a card as a unit, rather than also animating its nested photo.
    return !target.matches('.brief-image-tile') || !target.closest('.brief-project');
  });
  function reveal(target) {
    if (reduced.matches || target.contains(document.activeElement)) return;
    const group = target.parentElement;
    const siblings = [...group.children].filter(node => targets.includes(node));
    const delay = Math.min(Math.max(siblings.indexOf(target),0) * 65,195);
    const photo = target.matches('.brief-image-tile,.brief-project');
    const from = photo
      ? {opacity:0, transform:'translateY(24px) scale(.975)', clipPath:'inset(5% 0 0 0)'}
      : {opacity:0, transform:'translateY(22px)'};
    let animation;
    try {
      animation = target.animate([from,{opacity:1,transform:'translateY(0) scale(1)',...(photo?{clipPath:'inset(0 0 0 0)'}:{})}], {
        duration:photo?740:620,delay,easing:'cubic-bezier(.2,.65,.25,1)',fill:'backwards'
      });
    } catch { return; }
    running.add(animation);
    const cleanup=()=>running.delete(animation);
    animation.finished.then(cleanup,cleanup);
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        if(!visible.has(entry.target)){visible.add(entry.target);reveal(entry.target);}
      } else {
        // Rearm only after the element has fully left the viewport.
        visible.delete(entry.target);
      }
    });
  },{threshold:0,rootMargin:'-6% 0px -6% 0px'});
  targets.forEach(target=>observer.observe(target));
  function cancelMotion(){
    for(const animation of running)animation.cancel();
    running.clear();
  }
  reduced.addEventListener('change',()=>{if(reduced.matches)cancelMotion();});
  // Keyboard users should never wait for focused controls to appear.
  document.addEventListener('focusin',event=>{
    targets.filter(target=>target.contains(event.target)).forEach(target=>{
      target.getAnimations().forEach(animation=>animation.cancel());
    });
  });
  window.addEventListener('pagehide',()=>{cancelMotion();observer.disconnect();},{once:true});
})();
