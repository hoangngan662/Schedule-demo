(function(root){
  const select='id,title,type,by_name,actor,status,descr,region,date,budget,target,link,img,gallery,created_at';
  function normalize(row) {
    let gallery=row.gallery;
    for(let i=0;i<2&&typeof gallery==='string';i++){try{gallery=JSON.parse(gallery);}catch{gallery=[];}}
    const seen=new Set();
    gallery=(Array.isArray(gallery)?gallery:[]).map(image=>{
      if(typeof image==='string')return {image_url:image};
      if(image&&typeof image==='object')return {image_url:image.image_url||image.url||image.src,caption:image.caption||image.name||''};
      return null;
    }).filter(image=>{
      if(!image||typeof image.image_url!=='string'||!/^(https?:\/\/|assets\/)/.test(image.image_url)||seen.has(image.image_url))return false;
      seen.add(image.image_url);return true;
    });
    const description=typeof row.descr==='string'?row.descr:'';
    return {...row,summary:description.length>180?description.slice(0,180)+'…':description,content:description,
      cover_image_url:row.img,website_url:row.link,project_gallery:gallery};
  }
  root.ProjectData={select,normalize};
})(globalThis);
