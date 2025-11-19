// Follow steps below to deploy this function:
// 1. Install Supabase CLI: https://supabase.com/docs/guides/cli
// 2. Run: supabase functions new summarize-note
// 3. Replace the generated index.ts with this code
// 4. Deploy: supabase functions deploy summarize-note

import { serve } from 'std/http/server.ts'
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { noteId } = await req.json()

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

    // Get the note
    const { data: note, error } = await supabaseClient
      .from('notes')
      .select('content, title')
      .eq('id', noteId)
      .single()

    if (error) throw error

    // In a real implementation, you would call OpenAI API here
    // For demo purposes, we'll create a simple summary
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const content = note.content || ''
    const wordCount = content.split(/\s+/).length
    const lineCount = content.split('\n').length
    const charCount = content.length

    // Simple keyword extraction (mock)
    const words = content.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    const frequency: Record<string, number> = {}
    words.forEach(w => {
      if (w.length > 4) frequency[w] = (frequency[w] || 0) + 1
    })
    const keywords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word)

    const summary = {
      title: note.title,
      stats: {
        words: wordCount,
        lines: lineCount,
        characters: charCount,
      },
      keywords,
      summary: `**AI Analysis**: This note titled "${note.title}" contains ${wordCount} words. Key topics appear to be: ${keywords.join(', ')}. ${
        wordCount > 100 ? 'It provides a comprehensive overview of the subject.' : 'It is a concise set of points.'
      }`,
    }

    // Example: If you want to call OpenAI
    /*
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes notes.',
          },
          {
            role: 'user',
            content: `Please summarize this note:\n\n${content}`,
          },
        ],
      }),
    })
    const aiSummary = await openAIResponse.json()
    */

    return new Response(JSON.stringify(summary), {
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
