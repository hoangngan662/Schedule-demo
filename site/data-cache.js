/* Cache public API reads for this tab. Writes always reach the server. */
(() => {
 const original=window.fetch.bind(window),memory=new Map(),inflight=new Map();
 const prefix='bex:data:v1:',ttl=5*60*1000;
 function read(key){try{return memory.get(key)||JSON.parse(sessionStorage.getItem(prefix+key)||'null');}catch{return null;}}
 function save(key,value){memory.set(key,value);try{sessionStorage.setItem(prefix+key,JSON.stringify(value));}catch{/* Memory cache remains available if storage is full. */}}
 function invalidate(path){
  for(const key of memory.keys())if(key.includes(path)){memory.delete(key);try{sessionStorage.removeItem(prefix+key);}catch{}}
  try{for(const key of Object.keys(sessionStorage))if(key.startsWith(prefix)&&key.includes(path))sessionStorage.removeItem(key);}catch{}
 }
 window.fetch=async(input,options={})=>{
  const request=new Request(input,options),url=new URL(request.url),method=request.method;
  if(!url.hostname.endsWith('.supabase.co')||!url.pathname.startsWith('/rest/v1/'))return original(input,options);
  const apiKey=request.headers.get('apikey')||'',auth=request.headers.get('authorization');
  if(auth&&auth!=='Bearer '+apiKey)return original(input,options);
  if(method!=='GET'){
   const result=await original(input,options);if(result.ok)invalidate(url.origin+url.pathname);return result;
  }
  url.searchParams.sort();const key=url.href+'|'+apiKey;
  const cached=read(key);
  if(cached&&Date.now()-cached.time<ttl)return new Response(cached.body,{status:200,headers:cached.headers});
  if(request.signal.aborted)throw request.signal.reason;
  if(inflight.has(key))return (await inflight.get(key)).clone();
  const task=(async()=>{
   const response=await original(input,options);
   if(response.ok&&response.status===200){const body=await response.clone().text();save(key,{time:Date.now(),body,headers:{'Content-Type':response.headers.get('content-type')||'application/json'}});}
   return response;
  })();
  inflight.set(key,task);
  try{return (await task).clone();}finally{inflight.delete(key);}
 };
 window.SiteCache={ttl};
})();
