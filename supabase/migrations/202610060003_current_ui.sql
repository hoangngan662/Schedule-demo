begin;
alter table public.events add column event_types text[];
update public.events set event_types=array[event_type];
alter table public.events alter column event_types set not null;
alter table public.events alter column event_types set default array['Event']::text[];
alter table public.events add constraint events_types_valid check (
  cardinality(event_types)>0
  and array_position(event_types,null) is null
  and event_types <@ array['Concert','Event','Livestream','TV Show','Brand','Khác']::text[]
);
drop index public.events_category_idx;
alter table public.events drop column event_type;
create index events_types_idx on public.events using gin(event_types) where is_published;
alter table public.event_images drop constraint event_images_image_url_check;
alter table public.event_images add constraint event_images_url_valid
check (image_url ~ '^https?://' or image_url ~ '^assets/[^[:space:]]+$');
comment on column public.events.event_types is 'Nhiều loại cho một sự kiện. Lọc theo phần tử trong mảng.';
comment on column public.event_images.caption is 'Mô tả ảnh cho trợ năng; giao diện không hiện chú thích.';
commit;
