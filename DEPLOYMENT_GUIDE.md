# Supabase Agentic Assistant - Deployment Guide

## Overview
This guide covers deploying the Supabase Agentic Assistant with OpenRouter integration for internal testing.

## Prerequisites
- Supabase project: https://zgelhzaeoaxhpubalyvz.supabase.co
- OpenRouter API key (user-provided)
- Node.js 18+
- Supabase CLI

## Phase 1: Supabase Setup ✅ COMPLETED

### Database Migrations
All migrations have been applied to the remote Supabase project:
- `202606130001_phase_1_foundation.sql` - Core tables (world_state, evidence, sensors, entities, relationships)
- `202606130002_rls_policies.sql` - Row Level Security policies
- `202606130003_phase_4_goals.sql` - Goals and agents tables
- `202606170001_frontend_ui_state.sql` - Frontend UI state tables
- `202606230001_conversation_storage.sql` - Conversation and message storage for MVP

### Edge Functions Deployed ✅
- `gateway` - Conversation management API
- `cognitive-engine` - OpenRouter integration with model routing

## Phase 2: Configuration Required

### 1. Set OpenRouter API Key
The Edge Functions need your OpenRouter API key to function:

```bash
supabase secrets set OPENROUTER_API_KEY=your-actual-openrouter-api-key
```

To get your OpenRouter API key:
1. Sign up at https://openrouter.ai/
2. Navigate to API Keys section
3. Copy your API key
4. Run the command above with your actual key

### 2. Update Frontend Environment Variables
The frontend `.env` file needs the actual Supabase anon key. Currently it has a placeholder.

Get the anon key from:
- Supabase Dashboard → Project Settings → API → anon public key

Update `frontend/.env`:
```
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

## Phase 3: Frontend Deployment (OnRender)

### Option 1: Deploy via Render Dashboard
1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Use the `render.yaml` configuration in the project root
5. Set environment variables:
   - `VITE_SUPABASE_ANON_KEY` (from Supabase dashboard)
   - Other variables are pre-configured in render.yaml

### Option 2: Deploy via Render CLI
```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Deploy
render deploy
```

### Manual Deployment (Alternative)
If Render doesn't work, deploy to Vercel:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

## Phase 4: Testing

### 1. Test Edge Functions Locally
```bash
# Start local Supabase
supabase start

# Test gateway function
curl -X POST http://127.0.0.1:54321/functions/v1/gateway/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Conversation"}'
```

### 2. Test Frontend Locally
```bash
cd frontend
npm run dev
```

Visit http://localhost:5173 to test the chat interface.

### 3. Test OpenRouter Integration
The system uses FREE models by default:
- `google/gemma-7b-it:free`
- `meta-llama/llama-3-8b-instruct:free`
- `mistralai/mistral-7b-instruct:free`

To test paid models, users must:
1. Enable "allow_paid_models" in their model_preferences
2. Set a spending_cap
3. Select a paid model when sending messages

## Phase 5: Data Import (Conversation Histories)

### Import Script
Create a script to import conversation histories from various platforms:

```typescript
// Example import structure
const importConversation = async (platform: string, rawData: any) => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/gateway/import-history`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      platform,
      raw_data: rawData,
    }),
  });
}
```

### Supported Platforms
- Grok
- ChatGPT
- DeepSeek
- Gemini
- Claude

## Architecture Overview

### Simplified Architecture (MVP)
- **Frontend**: React/Vite deployed to OnRender
- **Backend**: Supabase Edge Functions (gateway, cognitive-engine)
- **Database**: Supabase PostgreSQL with pgvector
- **Auth**: Supabase Auth
- **Models**: OpenRouter (FREE models by default, optional paid models)

### Removed for MVP
- NATS JetStream (replaced with direct Edge Function calls)
- Redis (using Supabase caching)
- Local Docker backend (fully serverless)
- Complex temporal world state (simplified to conversation storage)

## Cost Management

### FREE Models (Default)
- No cost to user
- Limited capabilities
- Good for testing

### Paid Models (Optional)
- User must explicitly enable
- Spending cap enforcement
- Cost tracking per conversation
- Models available:
  - `anthropic/claude-3-haiku`: $0.25/1M input, $1.25/1M output
  - `anthropic/claude-3.5-sonnet`: $3/1M input, $15/1M output
  - `openai/gpt-4o-mini`: $0.15/1M input, $0.6/1M output
  - `openai/gpt-4o`: $2.5/1M input, $10/1M output

## Monitoring

### Supabase Dashboard
- Edge Function logs: https://supabase.com/dashboard/project/zgelhzaeoaxhpubalyvz/functions
- Database logs: https://supabase.com/dashboard/project/zgelhzaeoaxhpubalyvz/logs
- Auth logs: https://supabase.com/dashboard/project/zgelhzaeoaxhpubalyvz/auth/logs

### Cost Tracking
- View current spend in `model_preferences` table
- Per-conversation costs in `messages` table
- Set spending caps per user

## Troubleshooting

### Edge Function Errors
1. Check Supabase Function logs
2. Verify OPENROUTER_API_KEY is set
3. Check Supabase service role key permissions

### Frontend Build Errors
1. Verify Node.js version (18+)
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check environment variables

### Authentication Issues
1. Verify Supabase Auth is enabled
2. Check RLS policies
3. Verify anon key is correct

## Next Steps

1. **Set OpenRouter API Key** - Required for Edge Functions to work
2. **Update Frontend Anon Key** - Get from Supabase dashboard
3. **Deploy to OnRender** - Using render.yaml configuration
4. **Test Chat Interface** - Verify FREE models work
5. **Import Conversation Histories** - For testing data
6. **Enable Paid Models** - If needed for testing (with spending caps)

## Security Notes

- All Edge Functions use Supabase Service Role Key for database access
- Frontend uses Anon Key with RLS policies
- User-specific data isolated via RLS
- OpenRouter API key stored as Supabase secret
- Spending caps enforced at Edge Function level

## Support

For issues:
1. Check Supabase Dashboard logs
2. Review Edge Function logs
3. Verify environment variables
4. Check OpenRouter API status
