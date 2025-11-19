# Supabase Database Setup

This directory contains SQL migration files for the CollabNote application.

## Setup Instructions

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your Supabase credentials.

3. **Run Migrations**:
   - Open your Supabase Dashboard
   - Go to SQL Editor
   - Run the files in this order:
     1. `schema.sql` - Core tables and RLS policies
     2. `vector-search.sql` - Enable semantic search (optional but recommended)
     3. `cron-jobs.sql` - Schedule automated tasks (optional)

4. **Enable Realtime**:
   - Go to Database > Replication
   - Enable replication for the `notes` table
   - This allows real-time subscriptions

5. **Setup Storage**:
   - Go to Storage
   - Create a new bucket called `note-images`
   - Set it to Public
   - Add RLS policies (see below)

## Storage Policies

For the `note-images` bucket:

```sql
-- Allow authenticated users to upload
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'note-images');

-- Allow anyone to view images
create policy "Anyone can view images"
on storage.objects for select
to public
using (bucket_id = 'note-images');

-- Allow users to delete their own images
create policy "Users can delete their own images"
on storage.objects for delete
to authenticated
using (bucket_id = 'note-images' and auth.uid()::text = (storage.foldername(name))[1]);
```

## Features Demonstrated

- ✅ **PostgreSQL** with extensions (uuid-ossp, pgcrypto, vector)
- ✅ **Row Level Security (RLS)** for data protection
- ✅ **Triggers** for auto-creating profiles
- ✅ **Vector Search** using pgvector for AI-powered search
- ✅ **Cron Jobs** for scheduled tasks
- ✅ **Realtime** subscriptions (configured via dashboard)
- ✅ **Storage** with RLS policies
