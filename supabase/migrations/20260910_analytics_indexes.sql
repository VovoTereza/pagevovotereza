create index if not exists analytics_events_name_created_at_idx
  on public.analytics_events(name, created_at desc);

create index if not exists analytics_events_session_created_at_idx
  on public.analytics_events(session_id, created_at desc);

create index if not exists site_settings_updated_at_idx
  on public.site_settings(updated_at desc);
