begin;
create table public.event_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_url text not null check (image_url ~ '^https?://'),
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
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
