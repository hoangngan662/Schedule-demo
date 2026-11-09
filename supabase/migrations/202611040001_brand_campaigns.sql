-- Run after brands exists. Keep existing brand titles and cover images.
begin;

alter table public.brands add column logo_url text
  check (logo_url is null or logo_url ~ '^(https?://|assets/)');

create table public.brand_campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  description text,
  starts_on date,
  ends_on date,
  cover_image_url text check (cover_image_url is null or cover_image_url ~ '^(https?://|assets/)'),
  website_url text check (website_url is null or website_url ~ '^https?://'),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create index brand_campaigns_brand_order_idx
  on public.brand_campaigns(brand_id, sort_order, starts_on desc);

create trigger brand_campaigns_updated before update on public.brand_campaigns
  for each row execute function public.content_set_updated_at();

alter table public.brand_campaigns enable row level security;
revoke all on public.brand_campaigns from anon, authenticated;
grant select on public.brand_campaigns to anon, authenticated;
grant all on public.brand_campaigns to service_role;

create policy brand_campaigns_published_read on public.brand_campaigns
  for select to anon, authenticated using (
    is_published and exists (
      select 1 from public.brands b where b.id = brand_id and b.is_published
    )
  );

commit;
