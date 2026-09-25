-- AcquiPredict Supabase schema
-- Run this in Supabase SQL Editor (SQL Editor > New Query > Run)

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text default 'Telangana',
  district text,
  infrastructure_type text default 'National Highway',
  acquisition_stage text default 'Land Verification',
  approval_delay_days int default 0,
  compensation_pct numeric default 0,
  legal_disputes int default 0,
  land_dispute_flag int default 0,
  rr_completion_pct numeric default 0,
  avg_response_days int default 0,
  land_area_acres numeric default 0,
  affected_families int default 0,
  ownership_doc int default 1,
  land_record int default 1,
  compensation_doc int default 1,
  approval_doc int default 1,
  notification_doc int default 1,
  legal_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  ts timestamptz default now(),
  role text,
  action text,
  detail text
);

-- Seed a few sample projects so the dashboard isn't empty on first run
insert into projects (name, state, district, infrastructure_type, acquisition_stage,
  approval_delay_days, compensation_pct, legal_disputes, land_dispute_flag,
  rr_completion_pct, avg_response_days, land_area_acres, affected_families,
  ownership_doc, land_record, compensation_doc, approval_doc, notification_doc)
values
  ('NH-44 Widening', 'Maharashtra', 'Nagpur', 'National Highway', 'Compensation Processing',
   20, 80, 0, 0, 90, 5, 45, 120, 1,1,1,1,1),
  ('Metro Rail Phase 2', 'Maharashtra', 'Pune', 'Metro / Rail', 'Legal Review',
   95, 30, 3, 1, 40, 25, 12, 890, 0,1,0,0,1),
  ('Irrigation Canal Ext.', 'Maharashtra', 'Solapur', 'Water Infrastructure', 'Land Verification',
   150, 15, 5, 1, 20, 38, 200, 1500, 0,0,0,1,1);

-- Row Level Security: enable it, then allow authenticated users to read/write for now.
-- Tighten these policies later by role once Supabase Auth roles are set up.
alter table projects enable row level security;
alter table audit_log enable row level security;

create policy "Authenticated users can read projects"
  on projects for select
  to authenticated
  using (true);

create policy "Authenticated users can insert/update projects"
  on projects for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can read audit log"
  on audit_log for select
  to authenticated
  using (true);

create policy "Authenticated users can write audit log"
  on audit_log for insert
  to authenticated
  with check (true);
