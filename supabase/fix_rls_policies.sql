-- Fixes: app connects fine but gets 0 rows back, due to RLS blocking
-- the anon (not-logged-in) role. This opens read access to everyone
-- for now - tighten this later once real login/auth is added.

drop policy if exists "Authenticated users can read projects" on projects;
drop policy if exists "Authenticated users can insert/update projects" on projects;
drop policy if exists "Authenticated users can read audit log" on audit_log;
drop policy if exists "Authenticated users can write audit log" on audit_log;

create policy "Public can read projects"
  on projects for select
  to public
  using (true);

create policy "Public can insert/update projects"
  on projects for all
  to public
  using (true)
  with check (true);

create policy "Public can read audit log"
  on audit_log for select
  to public
  using (true);

create policy "Public can write audit log"
  on audit_log for insert
  to public
  with check (true);
