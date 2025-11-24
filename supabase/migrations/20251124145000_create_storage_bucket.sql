-- Create the storage bucket for note images
insert into storage.buckets (id, name, public)
values ('note-images', 'note-images', true)
on conflict (id) do nothing;

-- Policy: Allow public read access to all images in the bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'note-images' );

-- Policy: Allow authenticated users to upload images
-- They can upload to any path, but typically we structure it as userId/filename
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'note-images'
    and auth.role() = 'authenticated'
  );

-- Policy: Users can update their own images
create policy "Users can update their own images"
  on storage.objects for update
  using (
    bucket_id = 'note-images'
    and auth.uid() = owner
  );

-- Policy: Users can delete their own images
create policy "Users can delete their own images"
  on storage.objects for delete
  using (
    bucket_id = 'note-images'
    and auth.uid() = owner
  );
