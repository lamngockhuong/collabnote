import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDelete() {
  console.log('🧪 Testing Delete Functionality...\n')

  // 1. Sign up a test user
  const email = `test_delete_${Date.now()}@test.com`
  const password = 'password123'

  console.log('1. Creating test user...')
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError || !authData.user) {
    console.error('❌ Failed to create user:', signUpError)
    return
  }

  console.log(`✅ User created: ${authData.user.id}`)

  // 2. Sign in
  console.log('\n2. Signing in...')
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.error('❌ Failed to sign in:', signInError)
    return
  }

  console.log('✅ Signed in successfully')

  // 3. Create a note
  console.log('\n3. Creating a test note...')
  const { data: note, error: createError } = await supabase
    .from('notes')
    .insert({
      title: 'Test Delete Note',
      content: 'This note will be deleted',
      is_public: false,
      owner_id: authData.user.id,
    })
    .select()
    .single()

  if (createError || !note) {
    console.error('❌ Failed to create note:', createError)
    return
  }

  console.log(`✅ Note created with ID: ${note.id}`)

  // 4. Try to delete the note
  console.log('\n4. Attempting to delete the note...')
  const { error: deleteError } = await supabase
    .from('notes')
    .delete()
    .eq('id', note.id)

  if (deleteError) {
    console.error('❌ Delete failed:', deleteError)
    return
  }

  console.log('✅ Delete command executed successfully')

  // 5. Verify the note is gone
  console.log('\n5. Verifying note is deleted...')
  const { data: checkNote, error: checkError } = await supabase
    .from('notes')
    .select('*')
    .eq('id', note.id)
    .single()

  if (checkNote) {
    console.error('❌ Note still exists! Delete did not work.')
  } else if (checkError && checkError.code === 'PGRST116') {
    console.log('✅ Note successfully deleted (not found in database)')
  } else {
    console.error('❌ Unexpected error:', checkError)
  }

  // Cleanup
  console.log('\n6. Cleaning up test user...')
  await supabase.auth.signOut()
  console.log('✅ Test complete!')
}

testDelete().catch(console.error)
