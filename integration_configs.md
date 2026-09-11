# AURORA Integration Configurations

**Status:** MVP testing configuration
**Policy:** FREE-TIER / NO-COST RESOURCES ONLY
**Last updated:** 2026-09-11

> This file records public/browser-safe integration configuration only. Never store Supabase service-role keys, OpenRouter API keys, Render secrets, passwords, or other credentials here.

## Render

- Workspace name: `My Workspace`
- Workspace ID: `tea-d02uct3e5dus73c5qvcg`
- Deployment target: **Render Static Site — FREE tier only**
- Repository: `SystemVirtue/Supabase_Agentic_Assistant`
- Branch: `main`
- Frontend root: `frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `frontend/dist`
- Paid Render services permitted for AURORA MVP: **NO**
- Render Postgres / Redis / Key Value required: **NO**

## Supabase

- Project name: AURORA
- Project ID: `kvgdpugqgtdxpxgyrvlz`
- Project URL: `https://kvgdpugqgtdxpxgyrvlz.supabase.co`
- Region: `ap-northeast-2`
- Browser-safe publishable key:
  `sb_publishable_Mua9NoPXf-UKUABdpmUcRg_c7XJFStf`
- Backend role: authentication, PostgreSQL persistence, RLS, and Edge Functions
- Supabase paid resources permitted for AURORA MVP: **NO**

## Frontend environment

The following values are safe to expose to the browser and should be configured in the Render frontend environment:

```text
VITE_SUPABASE_URL=https://kvgdpugqgtdxpxgyrvlz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Mua9NoPXf-UKUABdpmUcRg_c7XJFStf
```

Do **not** place `OPENROUTER_API_KEY` or a Supabase service-role key in frontend environment variables.

## AURORA reasoning integration

- Supabase Edge Function: `aurora-reason`
- Function ID: `d701e502-a30f-4917-ad5c-c31750555d33`
- OpenRouter: server-side only; free models only for MVP testing
- Puter.js: keyless/user-account pathway; free-model discovery and QUORUM support
- Puter.js frontend script: `https://js.puter.com/v2/`

## MVP cost boundary

AURORA MVP deployment/testing must remain within free/no-cost resource tiers. Do not upgrade Render, Supabase, model providers, databases, storage, or other infrastructure to paid plans without explicit user approval.

## Security boundary

This file is intentionally limited to public configuration identifiers and URLs. Secrets belong in the appropriate provider's secret/environment-variable store and must never be committed to GitHub.
