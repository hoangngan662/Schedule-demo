(async () => {
  const text=document.getElementById('home-rose-message');
  const author=document.getElementById('home-rose-author');
  const state=document.getElementById('home-rose-state');
  if(!text)return;
  try{
    const client=createWishesClient(window.WISHES_CONFIG);
    const rows=await client.list({limit:1});
    if(rows.length){
      text.textContent=rows[0].message;
      author.textContent=rows[0].name||'Một Bạch hồng';
      state.textContent='Lời nhắn mới nhất';
    }else{
      text.textContent='Góc nhỏ đang chờ một lời chúc, một lời cảm ơn, hay một chút thương từ bạn.';
      author.textContent='';state.textContent='Ghé Góc Bạch hồng để viết đôi lời.';
    }
  }catch(error){
    text.textContent='Có những điều nhỏ xíu, nhưng thương thì thật nhiều. Ghé Góc Bạch hồng để viết đôi lời nhé.';
    author.textContent='';state.textContent='Chưa tải được lời nhắn.';
  }
})();
