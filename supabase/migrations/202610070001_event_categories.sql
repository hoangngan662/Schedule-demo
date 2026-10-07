begin;
-- Handles both schema.sql installations and the previous migration chain.
alter table public.events drop constraint if exists events_types_valid;
alter table public.events drop constraint if exists events_event_types_check;
update public.events set event_types=array_replace(event_types,'TV Show','Gameshow')
where 'TV Show'=any(event_types);
alter table public.events add constraint events_types_valid check (
 cardinality(event_types)>0
 and array_position(event_types,null) is null
 and event_types <@ array['Concert','Event','Livestream','Gameshow','Brand','Campaign','Khác']::text[]
);
commit;
