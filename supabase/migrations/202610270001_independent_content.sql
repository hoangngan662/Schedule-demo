begin;

create function public.content_set_updated_at() returns trigger
language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end;
$$;

create table public.projects (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(trim(title))>0),
 summary text,
 content text,
 cover_image_url text check(cover_image_url is null or cover_image_url ~ '^https?://' or cover_image_url ~ '^assets/'),
 website_url text check(website_url is null or website_url ~ '^https?://'),
 sort_order integer not null default 0,
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index projects_public_order_idx on public.projects(sort_order,created_at desc) where is_published;
create trigger projects_updated before update on public.projects
for each row execute function public.content_set_updated_at();
alter table public.projects enable row level security;
revoke all on public.projects from anon,authenticated;
grant select on public.projects to anon,authenticated;
grant all on public.projects to service_role;
create policy projects_published_read on public.projects
for select to anon,authenticated using(is_published);
comment on table public.projects is 'Nội dung độc lập, không tham chiếu bảng lịch trình.';

create table public.brands (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(trim(title))>0),
 summary text,
 content text,
 cover_image_url text check(cover_image_url is null or cover_image_url ~ '^https?://' or cover_image_url ~ '^assets/'),
 website_url text check(website_url is null or website_url ~ '^https?://'),
 sort_order integer not null default 0,
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index brands_public_order_idx on public.brands(sort_order,created_at desc) where is_published;
create trigger brands_updated before update on public.brands
for each row execute function public.content_set_updated_at();
alter table public.brands enable row level security;
revoke all on public.brands from anon,authenticated;
grant select on public.brands to anon,authenticated;
grant all on public.brands to service_role;
create policy brands_published_read on public.brands
for select to anon,authenticated using(is_published);
comment on table public.brands is 'Nội dung độc lập, không tham chiếu bảng lịch trình.';

commit;
