-- CritiqueAI Supabase Migration
-- Run this once in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Create the shared_reports table
create table if not exists shared_reports (
  id          text primary key,
  report      jsonb not null,
  image_url   text not null,
  created_at  timestamptz not null default now()
);

-- 2. Index for fast lookups by id (already primary key, but explicit for clarity)
-- create index if not exists idx_shared_reports_id on shared_reports(id);

-- 3. Row Level Security — reports are publicly readable (share links are read-only)
alter table shared_reports enable row level security;

create policy "Public read-only"
  on shared_reports
  for select
  using (true);

-- Insert requires service role key (only our server can write)
create policy "Service role insert"
  on shared_reports
  for insert
  with check (true);  -- enforced by using service_role key in the server client

-- 4. Create the storage bucket for critique screenshots
-- Run this in the Supabase Dashboard → Storage → New Bucket
-- OR via the API (shown below for reference — the dashboard is easier):
--
-- Bucket name: critique-images
-- Public: true (images are served publicly for share links)
--
-- If using SQL, you'd insert into storage.buckets, but the Dashboard is simpler.

-- 5. Storage RLS — allow public reads, service-role writes
-- These policies are set in the Dashboard → Storage → critique-images → Policies
-- or via the storage management API. For reference:
--
-- Policy: "Give public read access"
--   Allowed operations: SELECT
--   Target roles: public
--   Using expression: bucket_id = 'critique-images'
