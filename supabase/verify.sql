-- SQL Editor: run after migration. Test fixtures are rolled back.
begin;
insert into public.events(id,name,event_date,event_types,is_published)
values ('00000000-0000-0000-0000-000000000001','Public fixture','2026-10-01',ARRAY['Event','Livestream'],true),
       ('00000000-0000-0000-0000-000000000002','Draft fixture','2026-10-01',ARRAY['Event','Livestream'],false);
insert into public.event_hashtags(event_id,platform,hashtag)
values ('00000000-0000-0000-0000-000000000001','Facebook','#PublicFixture'),
       ('00000000-0000-0000-0000-000000000002','Facebook','#DraftFixture');
insert into public.event_links(event_id,title,url)
values ('00000000-0000-0000-0000-000000000001','fixture','https://example.com/public'),
       ('00000000-0000-0000-0000-000000000002','fixture','https://example.com/draft');

insert into public.event_images(event_id,image_url) values
('00000000-0000-0000-0000-000000000001','https://example.com/public.jpg'),
('00000000-0000-0000-0000-000000000002','https://example.com/draft.jpg');
set local role anon;
do $$
begin
  if (select count(*) from public.events where id in
    ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002')) <> 1
  then raise exception 'anon visibility failed'; end if;
  if exists(select 1 from public.event_hashtags where hashtag='#DraftFixture')
    or exists(select 1 from public.event_links where url='https://example.com/draft')
  or exists(select 1 from public.event_images where image_url='https://example.com/draft.jpg')
  then raise exception 'draft children exposed'; end if;
  if not exists(select 1 from public.event_hashtags where hashtag='#PublicFixture')
    or not exists(select 1 from public.event_links where url='https://example.com/public')
  or not exists(select 1 from public.event_images where image_url='https://example.com/public.jpg')
  then raise exception 'published children unreadable'; end if;
end;
$$;
reset role;
set local role authenticated;
do $$
begin
  if exists(select 1 from public.events where id='00000000-0000-0000-0000-000000000002')
  then raise exception 'authenticated draft exposed'; end if;
end;
$$;
reset role;
do $$
declare r text; t text; p text;
begin
  foreach r in array array['anon','authenticated'] loop
    foreach t in array array['events','event_hashtags','event_links','event_images'] loop
      foreach p in array array['INSERT','UPDATE','DELETE','TRUNCATE'] loop
        if has_table_privilege(r,'public.'||t,p) then
          raise exception 'Unexpected % on % for %',p,t,r;
        end if;
      end loop;
    end loop;
  end loop;
end;
$$;
rollback;
select 'PASS: visibility and write grants' as result;
