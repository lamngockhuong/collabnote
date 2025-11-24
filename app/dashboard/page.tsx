import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's notes
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(9)

  const { count } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  return <DashboardClient initialNotes={notes || []} user={user} totalNotes={count || 0} />
}
