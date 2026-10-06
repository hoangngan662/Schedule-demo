// Public browser configuration. Access to rows is controlled by Supabase RLS.
const SUPABASE_URL = 'https://mcilqfmkchoktjsltiuk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_HkKFAwu6ip37E4f-SH8NsA__ZyrQdV2';

export async function fetchPublishedEvents(fetcher = fetch) {
  const rows = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const url = new URL('/rest/v1/events', SUPABASE_URL);
    url.searchParams.set('select', '*,event_hashtags(*),event_links(*),event_images(*)');
    url.searchParams.set('is_published', 'eq.true');
    url.searchParams.set('order', 'event_date.asc,start_time.asc.nullslast,sort_order.asc,id.asc');
    url.searchParams.set('limit', String(pageSize));
    url.searchParams.set('offset', String(offset));
    const response = await fetcher(url, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
    const page = await response.json();
    if (!Array.isArray(page)) throw new Error('Invalid schedule response');
    rows.push(...page);
    if (page.length === 0) return rows;
  }
}
