(() => {
 const $=id=>document.getElementById(id);
 const articles=[
  {id:'guide-1',title:'Theo dõi lịch trình và thông tin sự kiện',type:'Hướng dẫn',tags:['Schedule','Sự kiện'],image:'assets/wall.jpg',intro:'Một nơi để xem lịch trình và chuẩn bị cho những cuộc hẹn cùng BEX.',sections:[['Xem lịch tháng','Từ Home, mở Schedule để xem lịch trình. Chọn tháng và loại sự kiện bạn quan tâm.'],['Đọc thông tin chi tiết','Mở sự kiện để xem thời gian, địa điểm và các liên kết liên quan. Kiểm tra bài thông báo chính thức trước khi lên kế hoạch.']]},
  {id:'guide-2',title:'Chuẩn bị trước khi tham gia fan project',type:'Hướng dẫn',tags:['Project','White Rose'],image:'assets/page-background.jpg',intro:'Những điều nên đọc trước khi tham gia một hoạt động do cộng đồng tổ chức.',sections:[['Tìm hiểu project','Xem phần giới thiệu, thời gian, khu vực và người tổ chức trong WR Projects.'],['Theo dõi cập nhật','Đọc bài đăng gốc để biết cách tham gia và các thay đổi. Nếu thông tin chưa rõ, liên hệ người tổ chức qua kênh được công bố.']]},
  {id:'guide-3',title:'Gửi một tín hiệu yêu thương đến BEX',type:'Hướng dẫn',tags:['Frequency','Lời nhắn'],image:'assets/wall.jpg',intro:'Gửi một lời chúc, một lời cảm ơn hay đơn giản là một chút yêu thương.',sections:[['Viết lời nhắn','Mở WR Frequency, chọn Phát tín hiệu và viết điều bạn muốn gửi. Bạn có thể dùng tên hiển thị hoặc gửi ẩn danh.'],['Trước khi gửi','Đọc lại lời nhắn và tránh đưa thông tin riêng tư của bản thân hay người khác vào nội dung công khai.']]},
  {id:'guide-4',title:'Lưu giữ khoảnh khắc và chia sẻ ảnh có nguồn',type:'Chia sẻ',tags:['Gallery','Hình ảnh'],image:'assets/page-background.jpg',intro:'Cùng lưu lại những khoảnh khắc đẹp và trân trọng người đã ghi lại chúng.',sections:[['Tìm album','Chọn một sự kiện trong Gallery để mở bộ ảnh. Nhấn từng ảnh để xem rõ hơn.'],['Ghi nguồn khi chia sẻ','Giữ watermark và ghi tên tác giả nếu có. Đọc yêu cầu sử dụng của chủ ảnh trước khi đăng lại hoặc chỉnh sửa.']]},
  {id:'guide-5',title:'Đọc số liệu tương tác trong một chiến dịch',type:'Phân tích',tags:['Social','Campaign'],image:'assets/wall.jpg',intro:'Một góc nhìn cơ bản để hiểu các chỉ số thường gặp trong hoạt động truyền thông.',sections:[['Đặt chỉ số trong bối cảnh','Lượt xem, lượt tiếp cận và lượt tương tác phản ánh những khía cạnh khác nhau. Khi so sánh, cần cùng khoảng thời gian và cùng nền tảng.'],['Quan sát chất lượng nội dung','Bên cạnh số lượng, hãy xem phản hồi có liên quan đến nội dung không và người đọc quan tâm đến điều gì. Bài mẫu này không đưa ra số liệu hay kết luận về chiến dịch thực tế.']]},
  {id:'guide-6',title:'Viết bài thảo luận rõ ràng trên Facebook',type:'Hướng dẫn',tags:['Facebook','Social'],image:'assets/page-background.jpg',intro:'Bắt đầu từ điều bạn thật sự muốn chia sẻ và giúp người đọc dễ tham gia cuộc trò chuyện.',sections:[['Chọn một ý chính','Mỗi bài nên tập trung vào một chủ đề. Có thể kể lại một khoảnh khắc, nhận xét một phần trình diễn hoặc đặt một câu hỏi cụ thể.'],['Bổ sung ngữ cảnh','Ghi nguồn khi dẫn thông tin, phân biệt cảm nhận cá nhân với dữ kiện và giữ thái độ tôn trọng khi thảo luận.']]}
 ];
 let topic='',limit=4;
 const node=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text!=null)n.textContent=text;return n;};
 const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
 function tags(item){const box=node('div','resource-tags');[item.type,...item.tags].forEach(t=>box.append(node('span','',t)));return box;}
 function openArticle(item){
  const img=node('img','');img.src=item.image;img.alt='Ảnh minh họa · '+item.title;
  const copy=node('div','resource-article-copy'),heading=node('h2','',item.title);heading.id='resource-title';
  copy.append(tags(item),heading,node('p','',item.intro));
  item.sections.forEach(([title,text])=>copy.append(node('h3','',title),node('p','',text)));
  copy.append(node('p','resource-sample-note','Bài viết và hình ảnh mẫu để minh họa giao diện WR Resources.'));
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
   const img=node('img','');img.src=item.image;img.alt='';img.loading='lazy';
   const copy=node('div','resource-card-copy');copy.append(node('h2','',item.title),tags(item));card.append(img,copy);
   card.addEventListener('click',()=>openArticle(item));$('resource-grid').append(card);
  });
  $('resource-count').textContent=result.length+' bài viết';$('resource-empty').hidden=result.length>0;$('resource-more').hidden=result.length<=limit;
 }
 ['Tất cả',...new Set(articles.map(a=>a.type))].forEach((label,index)=>{
  const button=node('button','',label);button.type='button';button.setAttribute('aria-pressed',String(!index));
  button.addEventListener('click',()=>{topic=index?label:'';limit=4;$('resource-topics').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();});$('resource-topics').append(button);
 });
 $('resource-search-form').addEventListener('submit',e=>e.preventDefault());
 $('resource-search').addEventListener('input',()=>{limit=4;render();});
 $('resource-filter-toggle').addEventListener('click',()=>{const button=$('resource-filter-toggle'),open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));$('resource-filters').hidden=!open;});
 $('resource-more').addEventListener('click',()=>{limit+=4;render();});
 $('resource-close').addEventListener('click',()=>$('resource-dialog').close());
 $('resource-dialog').addEventListener('close',()=>document.documentElement.classList.remove('resource-dialog-open'));
 $('resource-dialog').addEventListener('click',e=>{if(e.target!==e.currentTarget)return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();});
 function fromHash(){const item=articles.find(a=>'#'+a.id===location.hash);if(item)openArticle(item);}
 render();fromHash();window.addEventListener('hashchange',fromHash);
})();
