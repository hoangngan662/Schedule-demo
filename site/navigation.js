document.querySelectorAll('.nav-group').forEach(group => {
  const summary = group.querySelector('summary');
  group.addEventListener('pointerenter', event => {
    if (!matchMedia('(max-width: 820px)').matches && event.pointerType === 'mouse') group.open = true;
  });
  group.addEventListener('pointerleave', event => {
    if (!matchMedia('(max-width: 820px)').matches && event.pointerType === 'mouse' && !group.querySelector('div').contains(document.activeElement)) group.open = false;
  });
  group.addEventListener('focusout', event => {
    if (!group.contains(event.relatedTarget) && !group.matches(':hover')) group.open = false;
  });
  group.addEventListener('keydown', event => {
    if (event.key === 'Escape' && group.open) {
      event.preventDefault();
      group.open = false;
      summary.focus();
    }
  });
});

const mobileNavigation = matchMedia('(max-width: 820px)');
document.querySelectorAll('.site-nav').forEach((nav,index) => {
  const links=nav.querySelector('.site-links');
  if(!links)return;
  const groups=[...links.querySelectorAll('.nav-group')];
  links.id=links.id||'site-menu-'+index;
  const toggle=document.createElement('button');
  toggle.type='button';toggle.className='mobile-nav-toggle';toggle.textContent='Menu';
  toggle.setAttribute('aria-controls',links.id);toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Mở menu điều hướng');
  nav.insertBefore(toggle,links);nav.classList.add('mobile-nav-ready');
  function setOpen(open,returnFocus=false){
    nav.classList.toggle('mobile-nav-open',open);
    toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Đóng menu điều hướng':'Mở menu điều hướng');
    if(!open)groups.forEach(group=>{group.open=false;});
    if(returnFocus)toggle.focus();
  }
  toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
  nav.addEventListener('keydown',event=>{
    if(mobileNavigation.matches&&event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();setOpen(false,true);}
  });
  links.addEventListener('click',event=>{if(mobileNavigation.matches&&event.target.closest('a'))setOpen(false);});
  document.addEventListener('pointerdown',event=>{if(mobileNavigation.matches&&!nav.contains(event.target))setOpen(false);});
  nav.addEventListener('focusout',event=>{if(mobileNavigation.matches&&!nav.contains(event.relatedTarget))setOpen(false);});
  mobileNavigation.addEventListener('change',()=>setOpen(false));
  groups.forEach(group=>{
    const active=[...group.querySelectorAll('a')].some(link=>link.getAttribute('href').split('#')[0]===location.pathname.split('/').pop());
    if(active)group.querySelector('summary').setAttribute('aria-current','true');
    group.addEventListener('toggle',()=>{if(mobileNavigation.matches&&group.open)groups.forEach(other=>{if(other!==group)other.open=false;});});
  });
});
