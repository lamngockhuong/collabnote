import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NoteEditor from './note-editor'

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching note:', error)
  }

  if (!note) {
    redirect('/dashboard')
  }

  return <NoteEditor note={note} user={user} />
}
