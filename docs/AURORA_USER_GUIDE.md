# AURORA User Guide

## What is AURORA?

AURORA is a transparent AI workspace designed to make the context surrounding machine reasoning visible. Instead of treating an answer as the end of the interaction, the MVP records and exposes the workspace, source material, reasoning run, model/provider, claims, evidence, uncertainty and disagreement associated with the interaction.

## First-time workflow

1. **Create an account or sign in.**
2. **Create a workspace.** A workspace is the boundary for your sessions, source material and cognitive records.
3. Open **Knowledge** and add source material. The MVP currently accepts pasted text; give each source a useful document name.
4. Open **Ask AURORA** and ask a question. For the first test, ask something directly answerable from the document you just added.
5. Inspect the response and the **Last reasoning run** panel.
6. Open **Cognition** to inspect persisted claims and confidence.
7. Open **Runs & History** to inspect the recorded run, model/provider, status and latency.
8. Try **QUORUM** mode to compare independent model contributions before synthesis.

## Navigation

### Ask AURORA
The primary workspace. Create/select sessions, ask questions and choose a reasoning mode. Responses are persisted rather than treated as transient chat output.

### Knowledge
The workspace knowledge store. Add source text that can subsequently be used as evidence by AURORA. Each source remains associated with the workspace.

### Cognition
The inspectability surface. View claims extracted from reasoning and the transparency model describing provenance, evidence, uncertainty and multi-model disagreement.

### Runs & History
A chronological record of reasoning runs. Use it to see what was asked, which mode and model were used, whether the run completed, its latency and when it happened.

## Reasoning modes

- **Fast** — prioritises speed.
- **Balanced** — normal starting point for general use.
- **Deep** — intended for more deliberate reasoning.
- **QUORUM** — obtains independent model contributions and synthesises them. Disagreements should remain visible rather than being silently collapsed.

## Provider Lab

`/providers` is an advanced test surface for the keyless Puter.js pathway. AURORA can discover models exposed by Puter and select models advertised with zero input/output cost. QUORUM can use several candidate models before synthesis.

The normal reasoning path first attempts the deployed Supabase `aurora-reason` function and can fall back to Puter when available.

## Understanding the transparency data

**Provenance** tells you which provider/model produced a result and how long the run took.

**Claims** are propositions extracted from the answer. Confidence is model-generated metadata, not a guarantee of truth.

**Evidence** links claims to source material and excerpts where available.

**Uncertainty** records areas where the model reports insufficient confidence or evidence.

**Disagreement** records differences between independent reasoning contributions, particularly in QUORUM mode.

## Important MVP limitation

AURORA's transparency structures are real persisted records, but transparency does not automatically make an answer correct. Treat model claims and confidence as inspectable evidence about the reasoning process, not as proof. Human review remains necessary.

## Troubleshooting

- If authentication fails, verify the email/password and Supabase authentication configuration.
- If no workspace exists, create one from the initial workspace screen.
- If reasoning fails through the normal path, the UI attempts the keyless Puter path when Puter.js is available.
- If the Puter path reports that no free model is available, the currently exposed Puter model catalogue may have changed; retry later or use the configured backend provider.
- Use the floating **?** button in the application to reopen the in-app guide at any time.
