// Maps Supabase rows to the existing UI data shape; does not connect to Supabase.
export function toWebEvent(row) {
  const ordered = rows => [...(rows || [])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  return {
    id: row.id,
    name: row.name,
    date: row.event_date,
    endDate: row.end_date,
    start: row.start_time?.slice(0,5),
    end: row.end_time?.slice(0,5),
    event_types: [...row.event_types],
    location: row.location,
    thumb: row.event_images?.find(image => image.is_cover)?.image_url || row.thumbnail_url,
    drive_folder_url: row.drive_folder_url,
    link: row.map_url,
    source: row.source_url,
    sourceLabel: row.source_label,
    desc: row.description,
    notes: row.notes || [],
    threads_topic: row.threads_topic,
    keyword: row.keyword,
    order: row.sort_order,
    event_hashtags: ordered(row.event_hashtags),
    links: ordered(row.event_links),
    event_images: ordered(row.event_images)
  };
}
