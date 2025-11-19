import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()

    if (!query) throw new Error('Query is required')

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Generate mock embedding (1536 dimensions)
    // For demo purposes, we use random values. In production, use OpenAI.
    const embedding = Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 2)

    // Call the match_notes RPC function
    // We use a very low threshold (-1) to ensure we get results back for the demo
    // since random vectors won't match well.
    const { data: notes, error } = await supabaseClient.rpc('match_notes', {
      query_embedding: embedding,
      match_threshold: -1.0,
      match_count: 5,
    })

    if (error) throw error

    return new Response(JSON.stringify({ notes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
