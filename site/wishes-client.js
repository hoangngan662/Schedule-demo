// No requests run on import. The UI can create this client after configuration.
(function(root){
  function createWishesClient(config, fetcher) {
    if(!config || !config.url || !config.publishableKey)throw new Error('Chưa cấu hình Supabase cho lời nhắn.');
    const base=new URL(config.url);
    if(base.protocol!=='https:')throw new Error('Supabase URL phải dùng HTTPS.');
    const request=fetcher || root.fetch.bind(root);
    const headers={apikey:config.publishableKey};
    // Legacy anon keys use a JWT; publishable sb_ keys are API keys, not bearer tokens.
    if(config.publishableKey.startsWith('eyJ'))headers.Authorization='Bearer '+config.publishableKey;
    async function responseJson(response) {
      if(!response.ok)throw new Error('Không thể truy cập lời nhắn ('+response.status+').');
      return response.json();
    }
    return {
      async list({limit=30,before,offset=0}={}) {
        const url=new URL('/rest/v1/wishes',base);
        url.searchParams.set('select','id,name,message,x,y,size,created_at');
        url.searchParams.set('order','created_at.desc.nullslast,id.desc');
        url.searchParams.set('limit',String(Math.max(1,Math.min(100,Math.floor(Number(limit)||30)))));
        if(offset)url.searchParams.set('offset',String(Math.max(0,Math.floor(Number(offset)||0))));
        if(before) {
          if(!Number.isFinite(Date.parse(before)))throw new Error('Mốc thời gian không hợp lệ.');
          url.searchParams.set('created_at','lt.'+new Date(before).toISOString());
        }
        const rows=await responseJson(await request(url,{headers,signal:AbortSignal.timeout(20000)}));
        if(!Array.isArray(rows))throw new Error('Danh sách lời nhắn không hợp lệ.');
        return rows;
      },
      async send({name,message,x,y,size}) {
        if(typeof message!=='string'||!message.trim())throw new Error('Lời nhắn không được để trống.');
        if(message.trim().length>1000)throw new Error('Lời nhắn tối đa 1000 ký tự.');
        if(name!=null&&typeof name!=='string')throw new Error('Tên không hợp lệ.');
        if(name&&name.trim().length>50)throw new Error('Tên tối đa 50 ký tự.');
        if(![x,y,size].every(v=>typeof v==='number'&&Number.isFinite(v)))throw new Error('Cần xác định x, y và size trước khi gửi.');
        const row={name:name?.trim()||null,message:message.trim(),x,y,size};
        const response=await request(new URL('/rest/v1/wishes',base),{
          method:'POST',headers:{...headers,'Content-Type':'application/json',Prefer:'return=minimal'},
          body:JSON.stringify(row),signal:AbortSignal.timeout(20000)
        });
        if(!response.ok)throw new Error('Chưa gửi được lời nhắn ('+response.status+').');
        // return=minimal does not require SELECT permission and does not claim approval.
        return {sent:true};
      }
    };
  }
  root.createWishesClient=createWishesClient;
})(globalThis);
