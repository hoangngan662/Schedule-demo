begin;
alter table public.events add column drive_folder_url text
check (drive_folder_url is null or drive_folder_url ~ '^https://drive[.]google[.]com/');
alter table public.event_images add column drive_file_id text;
alter table public.event_images add column file_name text;
alter table public.event_images add column is_cover boolean not null default false;
create unique index event_images_one_cover_idx on public.event_images(event_id) where is_cover;
create unique index event_images_drive_file_idx on public.event_images(event_id,drive_file_id)
where drive_file_id is not null;
comment on column public.events.drive_folder_url is 'Folder Google Drive dùng làm nguồn đồng bộ ảnh.';
comment on column public.event_images.file_name is 'Tên file dùng để nhận diện ảnh bìa chứa main, không phân biệt hoa/thường.';
comment on column public.event_images.is_cover is 'Ảnh bìa do bộ đồng bộ chọn; mỗi sự kiện tối đa một ảnh bìa.';
commit;
