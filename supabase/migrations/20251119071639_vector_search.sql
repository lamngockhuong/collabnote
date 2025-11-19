-- Enable pgvector extension for AI/Semantic Search
create extension if not exists vector;

-- Add embedding column to notes table
alter table public.notes add column embedding vector(1536);

-- Create index for vector similarity search
create index on public.notes using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Function to search notes by semantic similarity
create or replace function match_notes(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  content jsonb,
  similarity float
)
language sql stable
as $$
  select
    notes.id,
    notes.title,
    notes.content,
    1 - (notes.embedding <=> query_embedding) as similarity
  from notes
  where 1 - (notes.embedding <=> query_embedding) > match_threshold
    and (notes.owner_id = auth.uid() or notes.is_public = true)
  order by notes.embedding <=> query_embedding
  limit match_count;
$$;
