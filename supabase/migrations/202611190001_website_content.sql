-- Supplemental content for the current website. Apply to the Schedule database only.
-- Does not alter events or the separate Projects / Frequency databases.
-- Compatible with the existing brands / brand_campaigns migration in this repo.
begin;
create or replace function public.website_set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create table if not exists public.site_banners (
 id uuid primary key default gen_random_uuid(),
 page text not null check(page in ('home','profile','schedule','gallery','brands','projects','frequency','resources')),
 title text,
 subtitle text,
 image_url text not null check(image_url ~ '^(https?://|assets/)'),
 mobile_image_url text check(mobile_image_url is null or mobile_image_url ~ '^(https?://|assets/)'),
 alt_text text not null default '',
 image_position text not null default 'center',
 starts_at timestamptz,
 ends_at timestamptz,
 check(ends_at is null or starts_at is null or ends_at > starts_at),
 sort_order integer not null default 0,
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.artist_profiles (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 full_name text not null check(length(trim(full_name))>0),
 stage_name text not null,
 birth_date date,
 height_cm numeric(5,2) check(height_cm > 0),
 zodiac text,
 introduction text,
 biography text,
 portrait_url text check(portrait_url is null or portrait_url ~ '^(https?://|assets/)'),
 illustration_url text check(illustration_url is null or illustration_url ~ '^(https?://|assets/)'),
 sort_order integer not null default 0,
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.profile_entries (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid not null references public.artist_profiles(id) on delete restrict,
 section text not null check(section in ('journey','music','film_game','show','press','award')),
 title text not null check(length(trim(title))>0),
 summary text,
 content text,
 cover_image_url text check(cover_image_url is null or cover_image_url ~ '^(https?://|assets/)'),
 timeline_label text,
 starts_on date,
 ends_on date,
 award_result text check(award_result is null or award_result in ('won','nominated')),
 source_url text check(source_url is null or source_url ~ '^https?://'),
 tags text[] not null default '{}',
 check(ends_on is null or starts_on is null or ends_on >= starts_on),
 sort_order integer not null default 0,
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.brands (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(trim(title))>0),
 summary text,
 content text,
 logo_url text check(logo_url is null or logo_url ~ '^(https?://|assets/)'),
 cover_image_url text check(cover_image_url is null or cover_image_url ~ '^(https?://|assets/)'),
 website_url text check(website_url is null or website_url ~ '^https?://'),
 sort_order integer not null default 0,
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.brand_campaigns (
 id uuid primary key default gen_random_uuid(),
 brand_id uuid not null references public.brands(id) on delete restrict,
 title text not null check(length(trim(title))>0),
 description text,
 starts_on date,
 ends_on date,
 cover_image_url text check(cover_image_url is null or cover_image_url ~ '^(https?://|assets/)'),
 website_url text check(website_url is null or website_url ~ '^https?://'),
 check(ends_on is null or starts_on is null or ends_on >= starts_on),
 sort_order integer not null default 0,
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.campaign_images (
 id uuid primary key default gen_random_uuid(),
 campaign_id uuid not null references public.brand_campaigns(id) on delete cascade,
 image_url text not null check(image_url ~ '^(https?://|assets/)'),
 caption text,
 alt_text text not null default '',
 sort_order integer not null default 0,
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.campaign_links (
 id uuid primary key default gen_random_uuid(),
 campaign_id uuid not null references public.brand_campaigns(id) on delete cascade,
 title text not null check(length(trim(title))>0),
 url text not null check(url ~ '^https?://'),
 sort_order integer not null default 0,
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.resources (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null check(length(trim(title))>0),
 category text not null check(category in ('guide','analysis','sharing')),
 summary text,
 content text not null default '',
 cover_image_url text check(cover_image_url is null or cover_image_url ~ '^(https?://|assets/)'),
 author_name text,
 tags text[] not null default '{}',
 published_at timestamptz,
 source_url text check(source_url is null or source_url ~ '^https?://'),
 sort_order integer not null default 0,
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.resource_images (
 id uuid primary key default gen_random_uuid(),
 resource_id uuid not null references public.resources(id) on delete cascade,
 image_url text not null check(image_url ~ '^(https?://|assets/)'),
 caption text,
 alt_text text not null default '',
 sort_order integer not null default 0,
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

alter table public.brands add column if not exists logo_url text
 check(logo_url is null or logo_url ~ '^(https?://|assets/)');
alter table public.brand_campaigns add column if not exists participation_type text
 check(participation_type is null or participation_type in ('individual','group'));
alter table public.brand_campaigns add column if not exists credit text;
alter table public.brand_campaigns add column if not exists tags text[] not null default '{}';

alter table public.site_banners enable row level security;
revoke all on public.site_banners from anon, authenticated;
grant select on public.site_banners to anon, authenticated;
grant all on public.site_banners to service_role;
drop trigger if exists website_updated_at on public.site_banners;
create trigger website_updated_at before update on public.site_banners
 for each row execute function public.website_set_updated_at();
drop policy if exists website_public_read on public.site_banners;
create policy website_public_read on public.site_banners for select to anon, authenticated using (is_published and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
create index if not exists site_banners_website_public_order_idx on public.site_banners(sort_order,created_at desc) where is_published;

alter table public.artist_profiles enable row level security;
revoke all on public.artist_profiles from anon, authenticated;
grant select on public.artist_profiles to anon, authenticated;
grant all on public.artist_profiles to service_role;
drop trigger if exists website_updated_at on public.artist_profiles;
create trigger website_updated_at before update on public.artist_profiles
 for each row execute function public.website_set_updated_at();
drop policy if exists website_public_read on public.artist_profiles;
create policy website_public_read on public.artist_profiles for select to anon, authenticated using (is_published);
create index if not exists artist_profiles_website_public_order_idx on public.artist_profiles(sort_order,created_at desc) where is_published;

alter table public.profile_entries enable row level security;
revoke all on public.profile_entries from anon, authenticated;
grant select on public.profile_entries to anon, authenticated;
grant all on public.profile_entries to service_role;
drop trigger if exists website_updated_at on public.profile_entries;
create trigger website_updated_at before update on public.profile_entries
 for each row execute function public.website_set_updated_at();
drop policy if exists website_public_read on public.profile_entries;
create policy website_public_read on public.profile_entries for select to anon, authenticated using (is_published and exists(select 1 from public.artist_profiles p where p.id = profile_id and p.is_published));
create index if not exists profile_entries_website_public_order_idx on public.profile_entries(sort_order,created_at desc) where is_published;

alter table public.brands enable row level security;
revoke all on public.brands from anon, authenticated;
grant select on public.brands to anon, authenticated;
grant all on public.brands to service_role;
drop trigger if exists website_updated_at on public.brands;
create trigger website_updated_at before update on public.brands
 for each row execute function public.website_set_updated_at();
drop policy if exists website_public_read on public.brands;
create policy website_public_read on public.brands for select to anon, authenticated using (is_published);
create index if not exists brands_website_public_order_idx on public.brands(sort_order,created_at desc) where is_published;

alter table public.brand_campaigns enable row level security;
revoke all on public.brand_campaigns from anon, authenticated;
grant select on public.brand_campaigns to anon, authenticated;
grant all on public.brand_campaigns to service_role;
drop trigger if exists website_updated_at on public.brand_campaigns;
create trigger website_updated_at before update on public.brand_campaigns
 for each row execute function public.website_set_updated_at();
drop policy if exists website_public_read on public.brand_campaigns;
create policy website_public_read on public.brand_campaigns for select to anon, authenticated using (is_published and exists(select 1 from public.brands b where b.id = brand_id and b.is_published));
create index if not exists brand_campaigns_website_public_order_idx on public.brand_campaigns(sort_order,created_at desc) where is_published;

alter table public.campaign_images enable row level security;
revoke all on public.campaign_images from anon, authenticated;
grant select on public.campaign_images to anon, authenticated;
grant all on public.campaign_images to service_role;
drop trigger if exists website_updated_at on public.campaign_images;
create trigger website_updated_at before update on public.campaign_images
 for each row execute function public.website_set_updated_at();
drop policy if exists website_public_read on public.campaign_images;
create policy website_public_read on public.campaign_images for select to anon, authenticated using (is_published and exists(select 1 from public.brand_campaigns c join public.brands b on b.id=c.brand_id where c.id=campaign_id and c.is_published and b.is_published));
create index if not exists campaign_images_website_public_order_idx on public.campaign_images(sort_order,created_at desc) where is_published;

alter table public.campaign_links enable row level security;
revoke all on public.campaign_links from anon, authenticated;
grant select on public.campaign_links to anon, authenticated;
grant all on public.campaign_links to service_role;
drop trigger if exists website_updated_at on public.campaign_links;
create trigger website_updated_at before update on public.campaign_links
 for each row execute function public.website_set_updated_at();
drop policy if exists website_public_read on public.campaign_links;
create policy website_public_read on public.campaign_links for select to anon, authenticated using (is_published and exists(select 1 from public.brand_campaigns c join public.brands b on b.id=c.brand_id where c.id=campaign_id and c.is_published and b.is_published));
create index if not exists campaign_links_website_public_order_idx on public.campaign_links(sort_order,created_at desc) where is_published;

alter table public.resources enable row level security;
revoke all on public.resources from anon, authenticated;
grant select on public.resources to anon, authenticated;
grant all on public.resources to service_role;
drop trigger if exists website_updated_at on public.resources;
create trigger website_updated_at before update on public.resources
 for each row execute function public.website_set_updated_at();
drop policy if exists website_public_read on public.resources;
create policy website_public_read on public.resources for select to anon, authenticated using (is_published);
create index if not exists resources_website_public_order_idx on public.resources(sort_order,created_at desc) where is_published;

alter table public.resource_images enable row level security;
revoke all on public.resource_images from anon, authenticated;
grant select on public.resource_images to anon, authenticated;
grant all on public.resource_images to service_role;
drop trigger if exists website_updated_at on public.resource_images;
create trigger website_updated_at before update on public.resource_images
 for each row execute function public.website_set_updated_at();
drop policy if exists website_public_read on public.resource_images;
create policy website_public_read on public.resource_images for select to anon, authenticated using (is_published and exists(select 1 from public.resources r where r.id=resource_id and r.is_published));
create index if not exists resource_images_website_public_order_idx on public.resource_images(sort_order,created_at desc) where is_published;

create index if not exists site_banners_page_idx on public.site_banners(page,sort_order);
create index if not exists profile_entries_section_idx on public.profile_entries(profile_id,section,sort_order);
create index if not exists campaign_images_parent_idx on public.campaign_images(campaign_id,sort_order);
create index if not exists campaign_links_parent_idx on public.campaign_links(campaign_id,sort_order);
create index if not exists brand_campaigns_parent_idx on public.brand_campaigns(brand_id,sort_order);
create index if not exists resource_images_parent_idx on public.resource_images(resource_id,sort_order);
create index if not exists resources_category_idx on public.resources(category,published_at desc);
create index if not exists resources_tags_idx on public.resources using gin(tags);
comment on column public.resources.content is 'Plain text; render as text, never as untrusted HTML.';
commit;
