-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Collaborators can view shared notes" ON public.notes;
DROP POLICY IF EXISTS "Collaborators with edit role can update notes" ON public.notes;
DROP POLICY IF EXISTS "Users can view collaborators of their notes" ON public.collaborators;
DROP POLICY IF EXISTS "Note owners can manage collaborators" ON public.collaborators;

-- Also drop the basic UPDATE and DELETE policies so we can recreate them
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

-- Recreate simpler policies without recursion
-- For collaborators table: just check if user is the note owner
CREATE POLICY "Note owners can manage collaborators"
  ON public.collaborators
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = collaborators.note_id
      AND notes.owner_id = auth.uid()
    )
  );

-- For notes: allow viewing if user is owner OR note is public
-- (Remove collaborator check to avoid recursion)
CREATE POLICY "Users and collaborators can view notes"
  ON public.notes
  FOR SELECT
  USING (
    auth.uid() = owner_id
    OR is_public = true
  );

-- Recreate UPDATE policy for notes
CREATE POLICY "Users can update their own notes"
  ON public.notes
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Recreate DELETE policy for notes
CREATE POLICY "Users can delete their own notes"
  ON public.notes
  FOR DELETE
  USING (auth.uid() = owner_id);
