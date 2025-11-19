-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Create notes table
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  title text not null default 'Untitled',
  content jsonb default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on notes
alter table public.notes enable row level security;

-- Notes policies
create policy "Users can view their own notes"
  on notes for select
  using ( auth.uid() = owner_id );

create policy "Users can view public notes"
  on notes for select
  using ( is_public = true );

create policy "Users can insert their own notes"
  on notes for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update their own notes"
  on notes for update
  using ( auth.uid() = owner_id );

create policy "Users can delete their own notes"
  on notes for delete
  using ( auth.uid() = owner_id );

-- Create collaborators table (for sharing)
create table public.collaborators (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references public.notes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('view', 'edit')) default 'view',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(note_id, user_id)
);

-- Enable RLS on collaborators
alter table public.collaborators enable row level security;

-- Collaborators policies
create policy "Users can view collaborators of their notes"
  on collaborators for select
  using (
    exists (
      select 1 from notes
      where notes.id = collaborators.note_id
      and notes.owner_id = auth.uid()
    )
  );

create policy "Note owners can manage collaborators"
  on collaborators for all
  using (
    exists (
      select 1 from notes
      where notes.id = collaborators.note_id
      and notes.owner_id = auth.uid()
    )
  );

-- Allow collaborators to view shared notes
create policy "Collaborators can view shared notes"
  on notes for select
  using (
    exists (
      select 1 from collaborators
      where collaborators.note_id = notes.id
      and collaborators.user_id = auth.uid()
    )
  );

-- Allow collaborators with 'edit' role to update notes
create policy "Collaborators with edit role can update notes"
  on notes for update
  using (
    exists (
      select 1 from collaborators
      where collaborators.note_id = notes.id
      and collaborators.user_id = auth.uid()
      and collaborators.role = 'edit'
    )
  );

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_notes_updated_at before update on public.notes
  for each row execute procedure public.handle_updated_at();
