-- Drop the function first to allow return type change
DROP FUNCTION IF EXISTS match_notes(vector(1536), float, int);

-- Update match_notes function to return content as text
create or replace function match_notes(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  content text,
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
