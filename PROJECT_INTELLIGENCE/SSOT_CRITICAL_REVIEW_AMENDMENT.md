# SSOT Critical Review Amendment

**Date:** 2026-09-03
**Authority:** Amendment to `MASTER_SINGLE_SOURCE_OF_TRUTH.md`
**Purpose:** Incorporate the independent critical review into the canonical implementation priorities and architectural constraints without prematurely implementing speculative subsystems.

## 1. Review disposition

The critical review is **substantially accepted**. It correctly identifies the highest-risk defects and the major semantic gaps between the current repository and the intended DCA architecture.

Two important qualifications apply:

1. **P0 is a sequence, not a promise to implement every item immediately.** Runtime correctness, data ownership, security and event semantics must be stabilised before building QUORUM or other higher-order cognition.
2. **Tenant-scoped security, bi-temporal semantics and the provenance graph require foundational schema decisions first.** They should not be implemented as isolated patches that create another migration layer of inconsistency.

## 2. Revised P0 — make the existing spine truthful

### P0.1 Runtime correctness

- **IMPLEMENTATION REQUIRED:** Fix `cognitive_engine/app/agent_registry.py` mutation calls so SQL and parameters are both supplied to the database execution abstraction.
- **IMPLEMENTATION REQUIRED:** Fix `cognitive_engine/app/litellm_router.py` method mismatch (`_estimate_cost()` versus `estimate_cost()`).
- **IMPLEMENTATION REQUIRED:** Replace LangGraph world-state, historical-state and episodic-memory mocks with real service/client calls.
- **IMPLEMENTATION REQUIRED:** Implement and test `ConflictDetected` and `FactAsserted` domain-event publication.
- Add integration tests against real PostgreSQL/NATS paths; unit tests alone are insufficient for these defects.

### P0.2 Security boundary

The existing `USING (true)` / `WITH CHECK (true)` policies are explicitly development-only and are unacceptable as a production baseline. The repository confirms this directly. fileciteturn76file0

However, the canonical target is **tenant/project-scoped authorization**, not merely `auth.uid()` checks. Introduce an explicit ownership/tenant boundary first, then apply consistent RLS to world state, evidence, sensors, entities, relationships, goals, agents and task assignments.

Required properties:

- deny by default;
- explicit tenant/project membership;
- least privilege;
- separate user ownership from service/agent authority;
- no client-controlled escalation;
- integration tests for every sensitive table and operation.

### P0.3 Temporal correctness

The review is correct that the current world-state exclusion constraint is semantically too broad: it excludes overlap by `(entity_id, attribute)` regardless of `state_type`. The audited foundation migration confirms that structure. fileciteturn78file0

The canonical correction is:

`entity_id + attribute + state_type + valid_time`

rather than treating fact and belief timelines as mutually exclusive.

Also introduce **transaction/record time** alongside valid time, but do this as a coherent temporal model rather than scattering timestamps across tables. The target model is:

- `valid_from / valid_until` = when the proposition is asserted to be true;
- `recorded_at` (or equivalent transaction-time field) = when the system recorded/learned that assertion;
- immutable historical records;
- explicit supersession/correction semantics.

The architecture should therefore support questions such as:

> What was believed to be true at X?

and separately:

> What did the system know/record at X?

This is a **P0/P1 data-model prerequisite** for genuine cognitive continuity and provenance.

### P0.4 Relationship history

Accept the proposed move away from the current natural composite primary key on `relationships`. The existing schema uses `(source_id, target_id, rel_type)` as the primary key, which is incompatible with clean historical versions. fileciteturn78file0

Use a surrogate relationship-version ID, with a stable logical relationship identity and temporal validity. Do not merely add an ID while retaining ambiguous update semantics.

## 3. P1 — establish the canonical cognitive spine

### P1.1 Canonical event ledger

**ACCEPTED, with an architectural refinement.** NATS JetStream remains the transport/event-distribution mechanism; PostgreSQL becomes the durable domain event ledger.

Target:

`producer -> append event ledger -> publish/dispatch -> materialize state`

The ledger must support:

- immutable append;
- event ID uniqueness/idempotency;
- aggregate/entity correlation;
- causation/correlation IDs;
- tenant/project scope;
- schema version;
- event timestamp and recorded timestamp;
- replay;
- audit;
- deterministic state reconstruction where feasible.

Do not make NATS the sole source of truth.

### P1.2 Provenance-native data model

**ACCEPTED.** Replace `source_event_ids[]` and `evidence_ids[]` as the canonical provenance mechanism with first-class relational links.

Target conceptual graph:

`SOURCE -> EVENT -> CLAIM -> EVIDENCE -> BELIEF/FACT -> DECISION -> ACTION`

and reverse traversal.

Arrays may remain as denormalized/cache fields temporarily, but they must not remain authoritative.

### P1.3 Cognitive Continuity

**ACCEPTED.** Imported histories are raw historical observations about prior interaction, not truth.

Pipeline:

`RAW IMPORT -> SOURCE METADATA -> INTERACTION EVENTS -> ASSERTIONS/CLAIMS -> provenance -> evidence assessment -> candidate memory -> promotion/rejection`

Every imported assertion should preserve:

- source provider;
- conversation/message identity where available;
- speaker/author type;
- original timestamp;
- whether the assertion originated from the user, model or external source;
- extraction model/version;
- confidence;
- promotion status.

No imported LLM statement becomes a fact merely because it appeared in a prior conversation.

## 4. P1/P2 — do not build higher-order cognition on broken foundations

The review correctly identifies missing:

- Epistemic Gap Engine;
- Agent Contribution Ledger;
- QUORUM Deliberation Runtime.

They should remain **specified/proposed until the event, claim, provenance, temporal and authorization foundations are stable**.

### Correct implementation order

`P0 runtime + security + temporal correctness`

`-> P1 canonical event ledger`

`-> P1 provenance/claims/evidence`

`-> P1 cognitive continuity`

`-> P2 epistemic gaps + belief revision`

`-> P2 contribution ledger`

`-> P2 QUORUM deliberation`

This avoids building an impressive-looking multi-agent layer whose outputs cannot be reliably attributed, replayed, challenged or reconstructed.

## 5. QUORUM acceptance criteria

QUORUM must not mean "ask several models and vote".

Before the runtime is considered implemented, it must demonstrate:

- independent hypotheses;
- explicit evidence references;
- preserved disagreement;
- contribution attribution;
- adjudication criteria;
- conflict resolution;
- measurable collective-gain experiments;
- cost/latency accounting;
- reproducible replay;
- human override/governance.

A multi-agent call graph without these properties is an orchestration workflow, not QUORUM.

## 6. Agent Contribution Ledger — canonical requirement

The ledger should be designed before QUORUM implementation because attribution is foundational.

Minimum contribution record:

`contribution_id, agent_id, model_id, provider, model_version, task_id, input_event_ids, output_claim_ids, evidence_ids, tool_calls, decision_id, evaluation, latency, token_usage, cost, timestamp, resulting_state_changes`

The ledger should be append-only and linked to the event/provenance graph.

## 7. Epistemic Gap Engine — canonical requirement

An epistemic gap is not simply a missing database value. It is a machine-recognisable deficiency in knowledge relevant to a belief, goal or decision.

Minimum fields:

- affected claim/belief;
- gap type;
- severity;
- confidence;
- missing evidence;
- contradictory evidence if applicable;
- affected goal/task;
- candidate investigation;
- expected value of information/resolution;
- estimated cost;
- lifecycle/status;
- resolution event.

The engine should prioritise gaps by expected decision value, not by raw count.

## 8. Repository hygiene

Accept as P0 hygiene:

- remove tracked `.DS_Store` artifacts;
- remove tracked `frontend/node_modules` if present;
- strengthen `.gitignore`;
- verify no generated/build artefacts are tracked;
- run repository-wide dependency/reference checks after cleanup.

## 9. Model routing consolidation

**Strongly accepted.** The Supabase Edge Function currently calls OpenRouter directly, while the Python cognitive engine contains LiteLLM routing. The Edge Function's implementation demonstrates direct OpenRouter model selection, pricing and spending controls. fileciteturn72file0

Canonical architecture should become:

`CLIENT / AGENT -> REASONING GATEWAY -> PROVIDER ADAPTER -> MODEL`

with provider-neutral capabilities and policy evaluated before invocation.

The Edge Function should either become a thin authenticated gateway into this service or be explicitly demoted to a client-facing adapter. It must not evolve into a second independent model-routing brain.

## 10. Revised priority table

| Priority | Work | Rationale |
|---|---|---|
| P0 | Fix database mutation bugs | Existing core functions must actually work |
| P0 | Fix LiteLLM router defect | Current routing path is broken |
| P0 | Remove LangGraph mocks | Close implementation/intention gap |
| P0 | Emit domain events | Required for coherent event flow |
| P0 | Establish tenant/project security model + RLS | Prevent unsafe cognitive-state access |
| P0 | Correct temporal constraint | Facts and beliefs need independent timelines |
| P0 | Relationship versioning model | Required for temporal graph integrity |
| P0 | Repository hygiene | Remove tracked generated/junk material |
| P1 | Canonical PostgreSQL event ledger | Durable replay/audit source |
| P1 | Provenance/claim/evidence graph | Make WHY structurally queryable |
| P1 | Bi-temporal cognitive model | Separate truth-time from knowledge-time |
| P1 | Cognitive Continuity pipeline | Convert history into attributable candidate cognition |
| P1 | Unified Reasoning Gateway | Remove provider-routing duplication |
| P2 | Epistemic Gap Engine | Make unknowns actionable |
| P2 | Belief revision | Make cognition updateable without overwriting history |
| P2 | Agent Contribution Ledger | Attribute collective cognition |
| P2 | QUORUM runtime | Only after attribution/evidence foundations exist |
| P3 | UNBOX advanced control plane | Expose the now-trustworthy substrate |
| P4 | Controlled self-improvement | Evaluate before autonomous modification |

## 11. New architectural invariant

**No higher-order cognitive capability may claim implementation status until its inputs, outputs, provenance, temporal semantics, authorization boundary and failure behaviour are represented in the canonical substrate.**

This becomes a governing rule for future coding-agent work.

## 12. Final disposition

The review does **not** overturn the SSOT thesis. It strengthens it.

The central engineering objective is now explicitly:

> **Turn the existing DCA skeleton into a truthful, replayable, temporally coherent, provenance-native and securely governed cognitive substrate before attempting to demonstrate QUORUM-level collective cognition.**

Only then should collective reasoning be judged on whether it creates measurable gain over a strong single-agent baseline.
