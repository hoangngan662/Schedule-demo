(function(root){
  const select='id,title,type,by_name,actor,descr,region,date,budget,target,link,img,gallery,created_at';
  function normalize(row) {
    let gallery=row.gallery;
    for(let i=0;i<2&&typeof gallery==='string';i++){try{gallery=JSON.parse(gallery);}catch{break;}}
    const folderValue=typeof gallery==='string'?gallery:gallery&&!Array.isArray(gallery)?gallery.driveFolder||gallery.drive_folder||gallery.folderUrl||gallery.folder_url||gallery.folder||gallery.url||gallery.link:null;
    const folderId=gallery&&!Array.isArray(gallery)&&typeof gallery==='object'?(gallery.folderId||gallery.folder_id||gallery.id):null;
    const driveFolderUrl=folderValue&&/^https:\/\/drive\.google\.com\//.test(folderValue)?folderValue:folderId?'https://drive.google.com/drive/folders/'+encodeURIComponent(folderId):null;
    if(gallery&&!Array.isArray(gallery)&&typeof gallery==='object')gallery=gallery.items||gallery.images||gallery.gallery||[];
    const seen=new Set();
    gallery=(Array.isArray(gallery)?gallery:[]).map(image=>{
      if(typeof image==='string')return {image_url:image};
      if(image&&typeof image==='object')return {image_url:image.image_url||image.url||image.src||image.img||image.image,caption:image.caption||image.label||image.title||image.name||''};
      return null;
    }).filter(image=>{
      if(!image||typeof image.image_url!=='string'||!/^(https?:\/\/|assets\/)/.test(image.image_url)||seen.has(image.image_url))return false;
      seen.add(image.image_url);return true;
    });
    const description=typeof row.descr==='string'?row.descr:'';
    return {...row,summary:description.length>180?description.slice(0,180)+'…':description,content:description,
      cover_image_url:row.img||gallery[0]?.image_url,website_url:row.link,project_gallery:gallery,drive_folder_url:driveFolderUrl};
  }
  root.ProjectData={select,normalize};
})(globalThis);
