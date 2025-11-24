import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NoteEditor from '../[id]/note-editor'

export default async function NewNotePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Generate a temporary ID for the new note
  const newNoteId = crypto.randomUUID()

  const newNote = {
    id: newNoteId,
    title: 'Untitled Note',
    content: '',
    owner_id: user.id,
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return <NoteEditor note={newNote} user={user} isNew={true} />
}
