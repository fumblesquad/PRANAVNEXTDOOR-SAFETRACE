create table sos_alerts (
  id uuid default gen_random_uuid() primary key,
  alert_id text unique not null,
  location_lat numeric,
  location_lng numeric,
  status text default 'active',
  created_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by text
);

alter table sos_alerts enable row level security;

create policy "Anyone can insert SOS" on sos_alerts
for insert
with check (true);

create policy "Anyone can read SOS" on sos_alerts
for select
using (true);

create policy "Anyone can update SOS" on sos_alerts
for update
using (true)
with check (true);

alter publication supabase_realtime add table sos_alerts;
