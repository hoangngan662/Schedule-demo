/* Public, read-only website content. No sample fallback. */
(() => {
 const safe=value=>typeof value==='string'&&/^(https?:\/\/|assets\/)/i.test(value)?value:'';
 async function list(table,params={},config=window.SITE_CONFIG){
  if(!config?.SUPABASE_URL||!config?.SUPABASE_PUBLISHABLE_KEY)throw new Error('Thiếu cấu hình database.');
  const url=new URL('/rest/v1/'+table,config.SUPABASE_URL);
  Object.entries({select:'*',order:'sort_order.asc,created_at.desc',...params}).forEach(([key,value])=>url.searchParams.set(key,value));
  const rows=[];const requested=Number(params.limit)||Infinity;
  for(let offset=0;offset<requested;){
   const size=Math.min(100,requested-offset);url.searchParams.set('limit',size);url.searchParams.set('offset',offset);
   const response=await fetch(url,{headers:{apikey:config.SUPABASE_PUBLISHABLE_KEY},signal:AbortSignal.timeout(20000)});
   if(!response.ok)throw new Error(table+': HTTP '+response.status);
   const page=await response.json();if(!Array.isArray(page))throw new Error('Dữ liệu không hợp lệ.');
   rows.push(...page);if(page.length<size)break;offset+=page.length;
  }
  return rows;
 }
 function node(tag,cls,text){const n=document.createElement(tag);n.className=cls||'';if(text!=null)n.textContent=text;return n;}
 function image(src,alt=''){const img=node('img');const url=safe(src);if(url)img.src=url;else img.hidden=true;img.alt=alt;img.loading='lazy';img.addEventListener('error',()=>{img.hidden=true;},{once:true});return img;}
 async function run(root,task){
  if(!root)return;root.replaceChildren(node('p','page-status','Đang tải nội dung…'));
  try{await task();}catch(error){
   console.error('Content loading:',error.message);const box=node('div','page-status','Chưa tải được dữ liệu.');
   const retry=node('button','page-button','Thử lại');retry.type='button';retry.onclick=()=>run(root,task);box.append(document.createElement('br'),retry);root.replaceChildren(box);
  }
 }
 function empty(root,text='Nội dung đang được cập nhật.'){root.replaceChildren(node('p','page-status',text));}
 const categories={guide:'Hướng dẫn',analysis:'Phân tích',sharing:'Chia sẻ'};
 window.ContentDB={list,safe,node,image,run,empty,categories};
})();
