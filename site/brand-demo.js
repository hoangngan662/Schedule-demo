(() => {
  const brands = [
    {id:'moc-tra',title:'Mộc Trà',logo:'MỘC TRÀ',tone:'tea',category:'Ẩm thực & đồ uống',summary:'Một khoảng nghỉ nhẹ nhàng, bắt đầu từ hương trà.',campaigns:[{title:'Một ngụm, một khoảng xanh',postUrl:'https://example.com/bai-viet/moc-tra-khoang-xanh',jobType:'Cá nhân',credit:'Cường Bạch',date:'01/11 – 30/11/2026',description:'Bộ ảnh và video ngắn ghi lại những khoảnh khắc thư giãn bên một tách trà.'},{title:'Quà mùa cuối năm',postUrl:'https://example.com/bai-viet/moc-tra-qua-cuoi-nam',jobType:'Cùng nhóm',credit:'UPRIZE',date:'Tháng 12/2026',description:'Giới thiệu bộ quà tặng trà theo mùa.'}]},
    {id:'nep-studio',title:'Nếp Studio',logo:'NẾP',tone:'linen',category:'Thời trang',summary:'Những thiết kế giản dị cho nhịp sống mỗi ngày.',campaigns:[{title:'Một ngày thật nhẹ',postUrl:'https://example.com/bai-viet/nep-studio-lookbook',jobType:'Cá nhân',credit:'Cường Bạch',date:'Tháng 11/2026',description:'Lookbook phối đồ từ các thiết kế cơ bản, dễ mặc và dễ kết hợp.'}]},
    {id:'am-thanh',title:'Âm Thành',logo:'ÂM THÀNH',tone:'sound',category:'Âm nhạc & phong cách sống',summary:'Dành thêm thời gian cho những giai điệu mình yêu.',campaigns:[{title:'Nghe theo cách của bạn',postUrl:'https://example.com/bai-viet/am-thanh-nghe-theo-cach-ban',jobType:'Cùng nhóm',credit:'UPRIZE',date:'Tháng 12/2026',description:'Chuỗi nội dung về thói quen nghe nhạc và những bản nhạc yêu thích.'}]}
  ];
  const root=document.getElementById('page-content');
  const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
  function cover(brand){
    const n=el('div','brand-demo-cover '+brand.tone);
    n.append(el('span','brand-demo-mark',brand.logo),el('span','brand-demo-cover-title',brand.title));
    n.setAttribute('aria-hidden','true');return n;
  }
  function campaignList(brand){
  const campaigns=el('section','brand-demo-campaigns');
  campaigns.append(el('h2','','Chiến dịch'));
  brand.campaigns.forEach((item,i)=>{
    const card=el('article','brand-demo-campaign');
    const info=el('div','');
    const tags=el('div','brand-demo-tags');
    tags.append(el('span','brand-demo-credit brand-demo-job-type',item.jobType),el('span','brand-demo-credit',item.credit));
    info.append(el('p','eyebrow',item.date),el('h3','',item.title),tags,el('p','',item.description));
    if(/^https?:\/\//i.test(item.postUrl||'')){
      const post=el('a','text-link brand-campaign-post','Xem bài viết mẫu ↗');
      post.href=item.postUrl;
      post.target='_blank';
      post.rel='noopener noreferrer';
      info.append(post);
    }
    card.append(el('span','brand-demo-number',String(i+1).padStart(2,'0')),info);campaigns.append(card);
  });
    return campaigns;
  }
  if(document.body.dataset.page==='brand'){
    const dialog=el('dialog','brand-demo-dialog');
    dialog.setAttribute('aria-labelledby','brand-dialog-title');
    const close=el('button','brand-dialog-close','×');
    close.type='button';
    close.setAttribute('aria-label','Đóng');
    close.addEventListener('click',()=>dialog.close());
    const body=el('div','brand-dialog-body');
    dialog.append(close,body);
    document.body.append(dialog);
    root.className='brand-demo-grid';
    root.replaceChildren(...brands.map(brand=>{
      const link=el('button','brand-demo-card');link.type='button';link.setAttribute('aria-haspopup','dialog');
      const tile=el('div','brand-logo-tile '+brand.tone);
      const mark=el('span','brand-logo-wordmark',brand.logo);
      mark.setAttribute('aria-hidden','true');
      tile.append(mark);
      link.append(tile);
      link.setAttribute('aria-label','Xem chiến dịch của '+brand.title);
      link.addEventListener('click',()=>{
        const title=el('h2','brand-dialog-title',brand.title);
        title.id='brand-dialog-title';
        body.replaceChildren(title,el('p','',brand.summary),cover(brand),campaignList(brand));
        dialog.showModal();
        dialog.scrollTop=0;
        close.focus();
      });
      return link;
    }));
    return;
  }
  const brand=brands.find(item=>item.id===new URLSearchParams(location.search).get('id'));
  if(!brand){root.replaceChildren(el('p','page-status','Không tìm thấy thương hiệu mẫu.'));return;}
  document.title=brand.title+' · Brand demo';
  document.getElementById('detail-title').textContent=brand.title;
  document.getElementById('detail-summary').textContent=brand.summary;
  root.replaceChildren(cover(brand),campaignList(brand));
})();
