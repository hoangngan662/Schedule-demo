-- PROJECT MỚI: chạy file này thay cho chuỗi migration, không chạy cả hai.
begin;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null check (length(trim(name)) > 0),
  event_date date not null,
  end_date date,
  start_time time,
  end_time time,
  timezone text not null default 'Asia/Ho_Chi_Minh' check (timezone = 'Asia/Ho_Chi_Minh'),
  event_types text[] not null default array['Event']::text[]
    check (cardinality(event_types)>0 and array_position(event_types,null) is null
      and event_types <@ array['Concert','Event','Livestream','Gameshow','Brand','Campaign','Khác']::text[]),
  location text,
  thumbnail_url text,
  drive_folder_url text check (drive_folder_url is null or drive_folder_url ~ '^https://drive[.]google[.]com/'),
  map_url text check (map_url is null or map_url ~ '^https?://'),
  source_url text check (source_url is null or source_url ~ '^https?://'),
  source_label text,
  description text,
  notes text[] not null default '{}',
  threads_topic text,
  keyword text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= event_date),
  check (end_time is null or start_time is null or
         coalesce(end_date,event_date) > event_date or end_time >= start_time)
);

create table public.event_hashtags (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  platform text not null check (platform in ('Facebook','Threads','TikTok','Khác')),
  hashtag text not null check (hashtag ~ '^#[^[:space:]#]+$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, platform, hashtag)
);

create table public.event_links (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  url text not null check (url ~ '^https?://'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_calendar_idx on public.events(event_date, start_time, sort_order) where is_published;
create index events_types_idx on public.events using gin(event_types) where is_published;
create index event_hashtags_order_idx on public.event_hashtags(event_id,sort_order);
create index event_links_order_idx on public.event_links(event_id,sort_order);

create function public.schedule_set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_updated before update on public.events
for each row execute function public.schedule_set_updated_at();
create trigger event_hashtags_updated before update on public.event_hashtags
for each row execute function public.schedule_set_updated_at();
create trigger event_links_updated before update on public.event_links
for each row execute function public.schedule_set_updated_at();

alter table public.events enable row level security;
alter table public.event_hashtags enable row level security;
alter table public.event_links enable row level security;

revoke all on public.events,public.event_hashtags,public.event_links from anon,authenticated;
grant select on public.events,public.event_hashtags,public.event_links to anon,authenticated;
grant all on public.events,public.event_hashtags,public.event_links to service_role;

create policy published_events_read on public.events
for select to anon,authenticated using (is_published);
create policy published_hashtags_read on public.event_hashtags
for select to anon,authenticated using (
  exists (select 1 from public.events e where e.id = event_id and e.is_published)
);
create policy published_links_read on public.event_links
for select to anon,authenticated using (
  exists (select 1 from public.events e where e.id = event_id and e.is_published)
);

comment on table public.events is 'Lịch trình; bản nháp mặc định ẩn. Quản lý tạm bằng Supabase Dashboard.';
comment on column public.events.threads_topic is 'Topic cho Threads; mỗi sự kiện có một nội dung.';
comment on column public.events.keyword is 'Keyword hỗ trợ sự kiện; văn bản, có thể bỏ trống.';
comment on table public.event_hashtags is 'Hashtag chia theo platform; mỗi dòng là một hashtag.';
comment on column public.events.end_date is 'Ngày kết thúc nếu kéo dài nhiều ngày; để null nếu cùng ngày.';
create table public.event_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_url text not null check (image_url ~ '^https?://' or image_url ~ '^assets/[^[:space:]]+$'),
  caption text,
  drive_file_id text,
  file_name text,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index event_images_one_cover_idx on public.event_images(event_id) where is_cover;
create unique index event_images_drive_file_idx on public.event_images(event_id,drive_file_id) where drive_file_id is not null;
create index event_images_order_idx on public.event_images(event_id,sort_order);
create trigger event_images_updated before update on public.event_images
for each row execute function public.schedule_set_updated_at();
alter table public.event_images enable row level security;
revoke all on public.event_images from anon,authenticated;
grant select on public.event_images to anon,authenticated;
grant all on public.event_images to service_role;
create policy published_images_read on public.event_images
for select to anon,authenticated using (
  exists(select 1 from public.events e where e.id=event_id and e.is_published)
);
comment on table public.event_images is 'Danh sách ảnh sự kiện; URL ảnh, chú thích và thứ tự.';

commit;
