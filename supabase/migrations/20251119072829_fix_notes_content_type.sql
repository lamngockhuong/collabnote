-- Change content column to text instead of jsonb for simplicity
ALTER TABLE public.notes ALTER COLUMN content TYPE text;
ALTER TABLE public.notes ALTER COLUMN content SET DEFAULT '';
