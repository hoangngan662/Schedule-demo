(() => {
  const form=document.getElementById('rose-form'),message=document.getElementById('rose-message'),name=document.getElementById('rose-name');
  const count=document.getElementById('rose-count'),feedback=document.getElementById('rose-feedback'),notes=document.getElementById('rose-notes');
  const submit=form.querySelector('[type="submit"]'),more=document.getElementById('rose-load-more'),label=document.getElementById('rose-list-label');
  const pageSize=20;
  let offset=0,loading=false,sending=false,pendingRefresh=false,client;
  const seen=new Set();
  function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el;}
  function card(row) {
    const article=node('article','rose-note');
    const quote=node('span','rose-note-icon','“');quote.setAttribute('aria-hidden','true');
    const body=node('p','',row.message),footer=document.createElement('footer'),author=node('span','',row.name||'Một Bạch hồng');
    const date=node('span','rose-note-date');
    if(row.created_at&&Number.isFinite(Date.parse(row.created_at)))date.textContent=new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(row.created_at));
    else date.textContent='♡';
    footer.append(author,date);article.append(quote,body,footer);return article;
  }
  function listState(text,retry) {
    const box=node('div','rose-list-status',text);
    if(retry){const button=node('button','rose-more','Thử lại');button.type='button';button.addEventListener('click',()=>load(true));box.append(document.createElement('br'),button);}
    notes.replaceChildren(box);
  }
  async function load(reset=false) {
    if(loading)return;
    loading=true;more.disabled=true;
    if(reset){offset=0;seen.clear();more.hidden=true;listState('Đang đọc những lời thương…');}
    try{
      const rows=await client.list({limit:pageSize,offset});
      if(reset)notes.replaceChildren();
      rows.forEach(row=>{if(!row.id||seen.has(row.id))return;seen.add(row.id);notes.append(card(row));});
      offset+=rows.length;more.hidden=rows.length<pageSize;
      label.textContent='Những lời thương mới nhất';
      if(!offset)listState('Góc nhỏ đang chờ lời nhắn đầu tiên của bạn.');
    }catch(error){
      if(reset)listState('Chưa tải được lời nhắn. Bạn thử lại nhé.',true);
      else{feedback.textContent='Chưa tải được các lời nhắn tiếp theo. Bạn thử lại nhé.';more.hidden=false;}
      console.error('Wishes loading:',error.message);
    }finally{loading=false;more.disabled=false;if(pendingRefresh){pendingRefresh=false;load(true);}}
  }
  message.addEventListener('input',()=>{count.textContent=message.value.length+' / 1000';message.setCustomValidity('');});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(sending||!client)return;
    const text=message.value.trim(),author=name.value.trim();
    if(!text){message.setCustomValidity('Bạn viết một chút lời nhắn nhé.');message.reportValidity();return;}
    if(text.length>1000||author.length>50){feedback.textContent='Tên tối đa 50 ký tự, lời nhắn tối đa 1000 ký tự.';return;}
    if(!form.reportValidity())return;
    sending=true;submit.disabled=true;submit.textContent='Đang gửi…';feedback.textContent='';form.setAttribute('aria-busy','true');
    try{
      const position=window.WISHES_CONFIG.placement();
      await client.send({name:author,message:text,...position});
      // Clear only the sent text; preserve anything typed during the request.
      if(message.value.trim()===text){message.value='';count.textContent='0 / 1000';}
      feedback.textContent='Đã gửi lời nhắn của bạn. Cảm ơn vì một chút thương dành cho Bạch!';
      // Refresh from the database rather than claiming an unsaved local preview is real.
      if(loading)pendingRefresh=true;else await load(true);
    }catch(error){
      feedback.textContent='Chưa xác nhận được lời nhắn đã gửi. Nội dung của bạn vẫn được giữ lại; hãy kiểm tra danh sách trước khi gửi lại.';
      console.error('Wishes submission:',error.message);
    }finally{sending=false;submit.disabled=false;submit.textContent='Gửi lời nhắn ↗';form.removeAttribute('aria-busy');}
  });
  more.addEventListener('click',()=>load());
  try{client=createWishesClient(window.WISHES_CONFIG);load(true);}
  catch(error){listState('Chưa kết nối được Góc Bạch hồng.');submit.disabled=true;feedback.textContent='Chưa thể gửi lời nhắn lúc này.';}
})();
