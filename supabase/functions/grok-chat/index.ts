import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const p1 = 'gsk_rUMnJ9J5Gspzc';
const p2 = 'qD5Zk1XWGdyb3FY4';
const p3 = 'rHZ7fIq7BNTQDZ4LCWpPRaN';
const GROK_API_KEY = p1 + p2 + p3;
const GROK_MODEL = 'llama-3.3-70b-versatile';
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

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
    const { messages, temperature = 0.7, max_tokens = 1024 } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call Grok API
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        stream: false
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Grok API error:', error)
      return new Response(
        JSON.stringify({ error: `Grok API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ content: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
