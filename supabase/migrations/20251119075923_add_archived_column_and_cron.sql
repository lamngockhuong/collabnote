-- Enable pg_cron extension
create extension if not exists pg_cron;

-- Add is_archived column to notes
alter table public.notes add column is_archived boolean default false;

-- Create a cron job to run every day at midnight
-- This will archive notes that haven't been updated in 30 days
select cron.schedule(
  'archive-old-notes',
  '0 0 * * *', -- Every day at midnight
  $$
    update public.notes
    set is_archived = true
    where updated_at < now() - interval '30 days'
    and is_archived = false
  $$
);
