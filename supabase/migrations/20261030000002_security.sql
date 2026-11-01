-- VIOR ATELIER · 0002 · roles, row level security, audit, rate limiting, storage

-- ---------------------------------------------------------------- role helpers
-- SECURITY DEFINER so policies can read user_roles without recursive RLS; search_path pinned.
create or replace function public.current_app_role()
returns public.app_role language sql stable security definer set search_path = '' as $$
  select ur.role from public.user_roles ur where ur.user_id = (select auth.uid())
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()))
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'super_admin')
$$;

revoke execute on function public.current_app_role(), public.is_staff(), public.is_super_admin() from public;
grant execute on function public.current_app_role(), public.is_staff(), public.is_super_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------- new auth user -> profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', null))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- never remove the last super admin
create or replace function public.protect_last_super_admin()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.role = 'super_admin' and (tg_op = 'DELETE' or new.role <> 'super_admin') then
    if (select count(*) from public.user_roles where role = 'super_admin' and id <> old.id) = 0 then
      raise exception 'At least one Super Admin must remain.' using errcode = 'P0001';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

create trigger user_roles_protect_last_super_admin before update or delete on public.user_roles
  for each row execute function public.protect_last_super_admin();

-- ---------------------------------------------------------------- activity log (written only by trigger)
create or replace function public.log_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  label text := coalesce(rec ->> 'title', rec ->> 'name', rec ->> 'client_name', rec ->> 'full_name',
                         rec ->> 'file_name', rec ->> 'label', rec ->> 'role', rec ->> 'brand_name');
  verb text := lower(tg_op);
begin
  if tg_op = 'UPDATE' and (to_jsonb(old) ->> 'status') is distinct from (rec ->> 'status') then
    verb := 'status:' || (rec ->> 'status');
  end if;
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, summary)
  values ((select auth.uid()), verb, tg_table_name, (rec ->> 'id')::uuid, left(label, 200));
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['projects','project_categories','services','inquiries','testimonials','blog_posts',
    'blog_categories','media_assets','site_settings','seo_pages','user_roles']
  loop
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.log_activity()', t || '_activity', t);
  end loop;
end $$;

-- ---------------------------------------------------------------- rate limiting (server-only)
create or replace function public.consume_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = '' as $$
declare r public.rate_limits;
begin
  insert into public.rate_limits (bucket_key, window_start, hits) values (p_key, now(), 0)
  on conflict (bucket_key) do nothing;
  select * into r from public.rate_limits where bucket_key = p_key for update;
  if r.window_start < now() - make_interval(secs => p_window_seconds) then
    update public.rate_limits set window_start = now(), hits = 1 where id = r.id;
    return true;
  end if;
  if r.hits >= p_limit then
    return false;
  end if;
  update public.rate_limits set hits = hits + 1 where id = r.id;
  return true;
end $$;
revoke execute on function public.consume_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, int, int) to service_role;

-- ---------------------------------------------------------------- RLS on
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.project_categories enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_notes enable row level security;
alter table public.testimonials enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;
alter table public.seo_pages enable row level security;
alter table public.activity_logs enable row level security;
alter table public.rate_limits enable row level security;

-- Belt and braces: anonymous visitors can never write through the API, whatever a policy says.
revoke insert, update, delete, truncate on all tables in schema public from anon;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_staff());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_super_admin_all on public.profiles for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

-- user_roles: only a super admin grants or changes roles
create policy user_roles_select on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or public.is_super_admin());
create policy user_roles_insert on public.user_roles for insert to authenticated
  with check (public.is_super_admin());
create policy user_roles_update on public.user_roles for update to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());
create policy user_roles_delete on public.user_roles for delete to authenticated
  using (public.is_super_admin());

-- taxonomy tables: public read, staff write
create policy project_categories_read on public.project_categories for select to anon, authenticated using (true);
create policy project_categories_write on public.project_categories for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy service_categories_read on public.service_categories for select to anon, authenticated using (true);
create policy service_categories_write on public.service_categories for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy blog_categories_read on public.blog_categories for select to anon, authenticated using (true);
create policy blog_categories_write on public.blog_categories for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- projects: public sees published only
create policy projects_public_read on public.projects for select to anon, authenticated
  using (status = 'published' or public.is_staff());
create policy projects_staff_insert on public.projects for insert to authenticated with check (public.is_staff());
create policy projects_staff_update on public.projects for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy projects_staff_delete on public.projects for delete to authenticated using (public.is_staff());

create policy project_images_read on public.project_images for select to anon, authenticated
  using (public.is_staff() or exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));
create policy project_images_write on public.project_images for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- services
create policy services_public_read on public.services for select to anon, authenticated
  using (status = 'published' or public.is_staff());
create policy services_staff_insert on public.services for insert to authenticated with check (public.is_staff());
create policy services_staff_update on public.services for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy services_admin_delete on public.services for delete to authenticated using (public.is_super_admin());

-- inquiries: no public read or direct insert. Submissions arrive only through the server route,
-- which validates, rate-limits and inserts with the server-side key.
create policy inquiries_staff_read on public.inquiries for select to authenticated using (public.is_staff());
create policy inquiries_staff_update on public.inquiries for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy inquiries_admin_delete on public.inquiries for delete to authenticated using (public.is_super_admin());

create policy inquiry_notes_read on public.inquiry_notes for select to authenticated using (public.is_staff());
create policy inquiry_notes_insert on public.inquiry_notes for insert to authenticated
  with check (public.is_staff() and author_id = (select auth.uid()));
create policy inquiry_notes_modify on public.inquiry_notes for update to authenticated
  using (author_id = (select auth.uid()) or public.is_super_admin())
  with check (author_id = (select auth.uid()) or public.is_super_admin());
create policy inquiry_notes_delete on public.inquiry_notes for delete to authenticated
  using (author_id = (select auth.uid()) or public.is_super_admin());

-- testimonials: public sees approved + published only
create policy testimonials_public_read on public.testimonials for select to anon, authenticated
  using ((status = 'published' and is_approved) or public.is_staff());
create policy testimonials_write on public.testimonials for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- blog: public sees published posts whose date has arrived (future date = scheduled)
create policy blog_public_read on public.blog_posts for select to anon, authenticated
  using ((status = 'published' and published_at <= now()) or public.is_staff());
create policy blog_staff_insert on public.blog_posts for insert to authenticated with check (public.is_staff());
create policy blog_staff_update on public.blog_posts for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy blog_staff_delete on public.blog_posts for delete to authenticated using (public.is_staff());

-- media library: staff only (the files themselves are public URLs in the media bucket)
create policy media_staff_all on public.media_assets for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- site settings: everyone reads, only a super admin changes
create policy site_settings_read on public.site_settings for select to anon, authenticated using (true);
create policy site_settings_update on public.site_settings for update to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

-- SEO: everyone reads; editors may edit page SEO, only a super admin adds/removes page rows
create policy seo_pages_read on public.seo_pages for select to anon, authenticated using (true);
create policy seo_pages_update on public.seo_pages for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy seo_pages_insert on public.seo_pages for insert to authenticated with check (public.is_super_admin());
create policy seo_pages_delete on public.seo_pages for delete to authenticated using (public.is_super_admin());

-- activity log: staff read; writes only via trigger
create policy activity_logs_read on public.activity_logs for select to authenticated using (public.is_staff());

-- rate_limits: no policies at all -> unreachable except by the definer function / service role

-- ---------------------------------------------------------------- storage: public "media" bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760,
        array['image/jpeg','image/png','image/webp','image/avif','image/gif','image/svg+xml'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy media_objects_staff_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());
create policy media_objects_staff_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_staff()) with check (bucket_id = 'media' and public.is_staff());
create policy media_objects_staff_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());
create policy media_objects_staff_select on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_staff());
