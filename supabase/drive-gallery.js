const GOOGLE_DRIVE_API_KEY = 'AIzaSyCZkRafUsjUWDjcB6HlhQBXgD9tVZUo4so';

function driveFolderInfo(value){
 try{
  const url=new URL(value);
  if(url.hostname!=='drive.google.com') return null;
  const id=url.pathname.match(/\/folders\/([\w-]+)/)?.[1]||url.searchParams.get('id');
  if(!id||!/^[-\w]+$/.test(id)) return null;
  return {id,resourceKey:url.searchParams.get('resourcekey')||''};
 }catch{return null}
}
async function fetchDriveImages(folder,fetcher=fetch){
 const files=[];
 let pageToken='';
 do{
  const params=new URLSearchParams({key:GOOGLE_DRIVE_API_KEY,
   q:`'${folder.id}' in parents and trashed=false and mimeType contains 'image/'`,
   fields:'nextPageToken,files(id,name,mimeType,resourceKey)',pageSize:'1000',orderBy:'name'});
  if(pageToken) params.set('pageToken',pageToken);
  const headers={};
  if(folder.resourceKey) headers['X-Goog-Drive-Resource-Keys']=`${folder.id}/${folder.resourceKey}`;
  const response=await fetcher('https://www.googleapis.com/drive/v3/files?'+params,{headers,signal:AbortSignal.timeout(15000)});
  if(!response.ok) throw new Error(`Drive request failed (${response.status})`);
  const data=await response.json();
  files.push(...(data.files||[]).filter(file=>file.mimeType?.startsWith('image/')));
  pageToken=data.nextPageToken||'';
 }while(pageToken);
 return files.map((file,index)=>{
  const params=new URLSearchParams({id:file.id,sz:'w1600'});
  if(file.resourceKey) params.set('resourcekey',file.resourceKey);
  return {image_url:'https://drive.google.com/thumbnail?'+params,caption:file.name,
   file_name:file.name,drive_file_id:file.id,sort_order:index};
 });
}
async function resolveDriveImages(event,folderCache){
 const folder=driveFolderInfo(event.drive_folder_url);
 if(!folder) return event;
 try{
  const cacheKey=folder.id+'/'+folder.resourceKey;
  if(!folderCache.has(cacheKey)) folderCache.set(cacheKey,fetchDriveImages(folder));
  const images=await folderCache.get(cacheKey);
  if(images.length){
   const cover=images.find(image=>/main/i.test(image.file_name))||images[0];
   event.drive_fallback_images=event.event_images;
   event.drive_fallback_thumb=event.thumb;
   event.event_images=images;
   event.thumb=cover.image_url;
  }
 }catch(error){console.warn('Không tải được folder Drive của sự kiện '+event.id+': '+error.message)}
 return event;
}