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

const navIcons = {
  Home: 'M3 10l9-7 9 7v10H15v-6H9v6H3z',
  Schedule: 'M4 6h16v15H4z M4 10h16 M8 3v5 M16 3v5 M8 14h2 M14 14h2 M8 17h2',
  Profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2z',
  Gallery: 'M3 4h18v16H3z M3 17l6-6 4 4 3-3 5 5 M16 8h.01',
  Brands: 'M3 4h9l9 9-8 8-10-10z M8 8h.01',
  Whiterose: 'M12 20S3 15 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 11-9 11z'
};
const bottomNav = matchMedia('(max-width: 820px)');
document.querySelectorAll('.site-nav').forEach(nav => {
  const links = nav.querySelector('.site-links');
  if (!links) return;
  const groups = [...links.querySelectorAll('.nav-group')];
  const currentFile = location.pathname.split('/').pop();
  const detailParent = {'gallery-album.html':'gallery.html','brand-detail.html':'brand.html','project-detail.html':'project.html'};
  const route = detailParent[currentFile] || currentFile || 'index.html';
  for (const item of links.children) {
    const control = item.matches('details') ? item.querySelector('summary') : item;
    const label = control.textContent.trim(), path = navIcons[label];
    if (!path) continue;
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('aria-hidden','true');
    svg.classList.add('bottom-nav-icon');
    const shape = document.createElementNS(svg.namespaceURI,'path');
    shape.setAttribute('d',path);
    svg.append(shape);
    const text = document.createElement('span');
    text.textContent = label;
    control.replaceChildren(svg,text);
    if (item.matches('details')) {
      const active = [...item.querySelectorAll('a')].some(link => link.getAttribute('href').split('#')[0] === route);
      item.classList.toggle('nav-current-section',active);
      if (active) control.setAttribute('aria-current','true');
    }
  }
  nav.classList.add('bottom-nav-ready');
  const closeGroups = () => groups.forEach(group => { group.open = false; });
  bottomNav.addEventListener('change',closeGroups);
  groups.forEach(group => group.addEventListener('toggle',() => {
    if (bottomNav.matches && group.open) groups.forEach(other => { if (other !== group) other.open = false; });
  }));
  links.addEventListener('click',event => {
    if (bottomNav.matches && event.target.closest('a')) closeGroups();
  });
  document.addEventListener('pointerdown',event => {
    if (bottomNav.matches && !nav.contains(event.target)) closeGroups();
  });
});
