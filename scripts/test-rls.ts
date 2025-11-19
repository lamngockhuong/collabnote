import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

// Create a client with service role to manage users
const adminClient = createClient(supabaseUrl, supabaseKey)

async function runTests() {
  console.log('🧪 Starting RLS Policy Tests...\n')

  // 1. Setup Test Users
  console.log('Creating test users...')
  const emailA = `userA_${Date.now()}@test.com`
  const emailB = `userB_${Date.now()}@test.com`
  const password = 'password123'

  const { data: userA, error: errorA } = await adminClient.auth.admin.createUser({ email: emailA, password, email_confirm: true })
  const { data: userB, error: errorB } = await adminClient.auth.admin.createUser({ email: emailB, password, email_confirm: true })

  if (errorA || errorB || !userA.user || !userB.user) {
    console.error('Failed to create users', errorA, errorB)
    return
  }
  console.log(`✅ Created User A (${userA.user.id}) and User B (${userB.user.id})`)

  // Create clients for each user
  const clientA = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const clientB = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  await clientA.auth.signInWithPassword({ email: emailA, password })
  await clientB.auth.signInWithPassword({ email: emailB, password })

  // 2. Test: User A creates a private note
  console.log('\nTest 1: Private Note Access')
  const { data: notePrivate, error: createError } = await clientA.from('notes').insert({
    title: 'Private Note A',
    content: 'Secret content',
    is_public: false,
    owner_id: userA.user.id
  }).select().single()

  if (createError) {
    console.error('❌ User A failed to create note:', createError)
  } else {
    console.log('✅ User A created private note')
  }

  // User B tries to read it
  const { data: readPrivate, error: readError } = await clientB.from('notes').select('*').eq('id', notePrivate.id).single()

  if (!readPrivate && readError) { // Expect error or null
     console.log('✅ User B CANNOT read private note (Expected)')
  } else {
     console.error('❌ User B COULD read private note (Security Breach!)')
  }

  // 3. Test: User A creates a public note
  console.log('\nTest 2: Public Note Access')
  const { data: notePublic } = await clientA.from('notes').insert({
    title: 'Public Note A',
    content: 'Public content',
    is_public: true,
    owner_id: userA.user.id
  }).select().single()

  // User B tries to read it
  const { data: readPublic } = await clientB.from('notes').select('*').eq('id', notePublic.id).single()

  if (readPublic) {
     console.log('✅ User B CAN read public note (Expected)')
  } else {
     console.error('❌ User B CANNOT read public note')
  }

  // 4. Cleanup
  console.log('\nCleaning up...')
  await adminClient.auth.admin.deleteUser(userA.user.id)
  await adminClient.auth.admin.deleteUser(userB.user.id)
  console.log('✅ Test users deleted')
}

runTests().catch(console.error)
