# AURORA MVP — Test Runbook

## Current target
The repository now contains the navigable AURORA MVP UI and its Supabase-backed cognitive substrate. The primary UI is at `/`.

## Local run
```bash
cd frontend
npm ci
npm run dev
```

The frontend has safe public Supabase defaults for the AURORA project. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` may still be supplied explicitly.

Never add a Supabase service-role key or `OPENROUTER_API_KEY` to frontend environment variables.

## Acceptance path
1. Open `/`.
2. Create an account or sign in.
3. Create an AURORA workspace.
4. Open **Knowledge** and ingest a small text document.
5. Open **Ask AURORA** and ask a question answerable from that document.
6. Confirm the response, model/provider, latency, claims and evidence counts are visible.
7. Open **Cognition** and inspect persisted claims.
8. Open **Runs & History** and confirm the reasoning run is persisted.
9. Repeat using **QUORUM** mode.
10. Open `/providers` to explicitly test the keyless Puter.js pathway and Puter QUORUM. Puter dynamically selects models advertised with zero input/output cost.

## Reasoning providers
- Supabase Edge Function `aurora-reason` is the OpenRouter path and dynamically discovers free OpenRouter models.
- If that backend path is unavailable, the frontend automatically falls back to the keyless Puter.js pathway when Puter.js is available.
- `/providers` provides an explicit Puter test surface.

## MVP boundary
The old DCA/agent/world-state/cost screens remain under `/legacy` as historical/secondary implementation. They are not presented as completed AURORA MVP capabilities.
