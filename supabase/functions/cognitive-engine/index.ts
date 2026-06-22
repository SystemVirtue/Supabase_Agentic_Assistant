import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')!

// FREE models from OpenRouter (default)
const FREE_MODELS = [
  'google/gemma-7b-it:free',
  'meta-llama/llama-3-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
]

// Model pricing (approximate per 1M tokens)
const MODEL_PRICING: Record<string, { input: number, output: number }> = {
  'google/gemma-7b-it:free': { input: 0, output: 0 },
  'meta-llama/llama-3-8b-instruct:free': { input: 0, output: 0 },
  'mistralai/mistral-7b-instruct:free': { input: 0, output: 0 },
  'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
  'anthropic/claude-3.5-sonnet': { input: 3, output: 15 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  'openai/gpt-4o': { input: 2.5, output: 10 },
}

interface Message {
  role: string
  content: string
}

interface OpenRouterResponse {
  id: string
  model: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

Deno.serve(async (req: Request) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { messages, model, user_id } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get user's model preferences
    let { data: preferences, error: prefError } = await supabase
      .from('model_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (prefError || !preferences) {
      // Create default preferences if not exist
      const { data: newPrefs, error: createError } = await supabase
        .from('model_preferences')
        .insert({
          user_id,
          preferred_models: FREE_MODELS,
          spending_cap: 10.00,
          allow_paid_models: false,
          current_spend: 0.00,
        })
        .select()
        .single()

      if (createError) {
        return new Response(JSON.stringify({ error: 'Failed to create preferences' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      preferences = newPrefs
    }

    // Determine which model to use
    let selectedModel = model

    if (!selectedModel) {
      // Use first preferred model
      selectedModel = preferences.preferred_models[0] || FREE_MODELS[0]
    }

    // Check if model is paid and user has allowed it
    const isPaidModel = !selectedModel.includes(':free')
    if (isPaidModel && !preferences.allow_paid_models) {
      return new Response(JSON.stringify({ 
        error: 'Paid model not allowed. Please enable paid models in settings or select a free model.',
        suggested_models: FREE_MODELS,
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check spending cap for paid models
    if (isPaidModel) {
      const pricing = MODEL_PRICING[selectedModel] || { input: 1, output: 1 }
      const estimatedCost = (pricing.input + pricing.output) / 1000000 // rough estimate
      
      if (preferences.current_spend + estimatedCost > preferences.spending_cap) {
        return new Response(JSON.stringify({ 
          error: 'Spending cap exceeded. Please increase your spending cap or select a free model.',
          current_spend: preferences.current_spend,
          spending_cap: preferences.spending_cap,
          suggested_models: FREE_MODELS,
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
        'X-Title': 'Supabase Agentic Assistant',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text()
      return new Response(JSON.stringify({ 
        error: 'OpenRouter API error',
        details: errorText,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data: OpenRouterResponse = await openRouterResponse.json()

    // Calculate cost
    const pricing = MODEL_PRICING[selectedModel] || { input: 0, output: 0 }
    const inputCost = (data.usage.prompt_tokens * pricing.input) / 1000000
    const outputCost = (data.usage.completion_tokens * pricing.output) / 1000000
    const totalCost = inputCost + outputCost

    return new Response(JSON.stringify({
      content: data.choices[0].message.content,
      model: data.model,
      tokens: data.usage.total_tokens,
      cost_usd: totalCost,
      input_tokens: data.usage.prompt_tokens,
      output_tokens: data.usage.completion_tokens,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/cognitive-engine' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
