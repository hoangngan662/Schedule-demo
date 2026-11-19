(() => {
 const $=id=>document.getElementById(id);
 let articles=[];
 let topic='',limit=4;
 const node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text!=null)n.textContent=text;return n;};
 const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
 function tags(item){const box=node('div','resource-tags');[item.type,...item.tags].forEach(t=>box.append(node('span','',t)));return box;}
 function openArticle(item){
  const img=node('img','');if(item.image)img.src=item.image;else img.hidden=true;img.alt=item.title;
  const copy=node('div','resource-article-copy'),heading=node('h2','',item.title);heading.id='resource-title';
  copy.append(tags(item),heading,node('p','',item.intro));
  item.sections.forEach(([title,text])=>copy.append(node('h3','',title),node('p','',text)));
  item.images.forEach(photo=>copy.append(ContentDB.image(photo.image_url,photo.alt_text||photo.caption||item.title)));
  if(item.source_url){const link=node('a','text-link','Xem nguồn ↗');link.href=item.source_url;link.target='_blank';link.rel='noopener noreferrer';copy.append(link);}
  $('resource-body').replaceChildren(img,copy);const dialog=$('resource-dialog');
  if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
  document.documentElement.classList.add('resource-dialog-open');$('resource-close').focus();
 }
 function render(){
  const search=normalize($('resource-search').value.trim());
  const result=articles.filter(a=>(!topic||a.type===topic)&&normalize([a.title,a.type,...a.tags,a.intro,...a.sections.flat()].join(' ')).includes(search));
  $('resource-grid').replaceChildren();
  result.slice(0,limit).forEach(item=>{
   const card=node('button','resource-card');card.type='button';card.id=item.id;card.setAttribute('aria-haspopup','dialog');
   const img=node('img','');if(item.image)img.src=item.image;else img.hidden=true;img.alt='';img.loading='lazy';
   const copy=node('div','resource-card-copy');copy.append(node('h2','',item.title),tags(item));card.append(img,copy);
   card.addEventListener('click',()=>openArticle(item));$('resource-grid').append(card);
  });
  $('resource-count').textContent=result.length+' bài viết';$('resource-empty').hidden=result.length>0;$('resource-more').hidden=result.length<=limit;
 }
 function renderTopics(){
  $('resource-topics').replaceChildren();
 ['Tất cả',...new Set(articles.map(a=>a.type))].forEach((label,index)=>{
  const button=node('button','',label);button.type='button';button.setAttribute('aria-pressed',String(!index));
  button.addEventListener('click',()=>{topic=index?label:'';limit=4;$('resource-topics').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();});$('resource-topics').append(button);
 });
 }
 $('resource-search-form').addEventListener('submit',e=>e.preventDefault());
 $('resource-search').addEventListener('input',()=>{limit=4;render();});
 $('resource-filter-toggle').addEventListener('click',()=>{const button=$('resource-filter-toggle'),open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));$('resource-filters').hidden=!open;});
 $('resource-more').addEventListener('click',()=>{limit+=4;render();});
 $('resource-close').addEventListener('click',()=>$('resource-dialog').close());
 $('resource-dialog').addEventListener('close',()=>document.documentElement.classList.remove('resource-dialog-open'));
 $('resource-dialog').addEventListener('click',e=>{if(e.target!==e.currentTarget)return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();});
 function fromHash(){const item=articles.find(a=>'#'+encodeURIComponent(a.id)===location.hash||'#'+a.id===location.hash);if(item)openArticle(item);}
 $('resource-more').hidden=true;
 ContentDB.run($('resource-grid'),async()=>{
  const rows=await ContentDB.list('resources',{select:'*,resource_images(*)',is_published:'eq.true',order:'published_at.desc.nullslast,created_at.desc'});
  articles=rows.map(row=>({id:row.slug,title:row.title,type:ContentDB.categories[row.category]||row.category,tags:row.tags||[],image:ContentDB.safe(row.cover_image_url),intro:row.summary||'',sections:[['',row.content||'']],images:(row.resource_images||[]).filter(p=>p.is_published).sort((a,b)=>a.sort_order-b.sort_order),source_url:ContentDB.safe(row.source_url)}));
  renderTopics();render();fromHash();
 });
 window.addEventListener('hashchange',fromHash);
})();
