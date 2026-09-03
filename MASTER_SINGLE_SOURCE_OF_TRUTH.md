# MASTER SINGLE SOURCE OF TRUTH

**Project:** `SystemVirtue/Supabase_Agentic_Assistant`  
**Document:** `MASTER_SINGLE_SOURCE_OF_TRUTH.md`  
**Purpose:** Canonical architectural, technical, functional and strategic reference.  
**Repository Commit Audited:** `ed12bfbb3c8ba8957ed01b79436449930c1af752`  
**Audit Date:** 2026-09-03  
**Document Status:** CANONICAL  
**Implementation Status:** PHASED PROTOTYPE / PARTIALLY IMPLEMENTED. The repository contains a working architectural skeleton spanning event ingestion, temporal world-state materialization, cognitive routing, memory tiering, agent lifecycle, edge perception, Supabase functions and a substantial frontend. Several critical paths remain mocked, incomplete or defective and the repository is not presently evidence of a production-ready autonomous cognitive platform.  
**Architectural Confidence:** MEDIUM  

> **Important:** This document distinguishes implemented functionality from specified, proposed, experimental and future functionality. Claims marked **IMPLEMENTED** are supported by repository evidence at the audited commit. Claims marked **INFERENCE**, **PROPOSED**, or **SPECIFIED / NOT IMPLEMENTED** must not be treated as existing runtime capability.

---

## Executive Preface

The repository is not merely a Supabase application and it is not yet a complete cognitive operating system. Its strongest architectural idea is a persistent, event-oriented cognitive substrate in which world state, evidence, beliefs, goals, memory and agent activity can become inspectable and temporally queryable. The latest repository commit explicitly consolidates UNBOX into this direction: **DCA is the cognitive substrate; QUORUM is the collective reasoning/governance paradigm; UNBOX is the human-facing cognitive control plane.** fileciteturn41file0 fileciteturn42file0

The forensic conclusion is therefore deliberately two-part:

1. **What exists:** a credible multi-service prototype foundation with FastAPI/NATS ingestion, PostgreSQL/Supabase state, temporal world-state logic, a LangGraph cognitive worker, LiteLLM routing, memory tiering, agent/goal management, edge perception, Supabase Edge Functions, and a React/Vite control UI.
2. **What does not yet exist:** the full provenance-native, event-sourced cognitive architecture described by the specifications. There is no complete immutable event store in PostgreSQL, no first-class claim graph, no durable epistemic-gap engine, no real QUORUM deliberation layer, no agent contribution ledger, no complete belief-revision system, no production-grade provider abstraction, and no implemented UNBOX 3D control plane.

The project should therefore be developed by **closing the semantic gap between the current skeleton and the intended architecture**, not by adding more disconnected features.

---

# 1. Project Summary

## 1.1 Canonical identity

**DCA / Supabase_Agentic_Assistant** is an open, persistent cognitive infrastructure project intended to give AI agents a durable, inspectable and governable state model rather than treating each LLM interaction as an isolated prompt/response transaction.

The repository currently implements portions of:

- event ingestion;
- event publication through NATS JetStream;
- temporal world-state materialization;
- evidence storage;
- entity and relationship storage;
- belief/conflict handling;
- LLM complexity classification and routing;
- LangGraph checkpoint persistence;
- memory tiering;
- agent registration and goal assignment;
- edge vision/audio ingestion;
- Supabase conversation storage and Edge Functions;
- React/Vite operational UI.

The repository does **not** yet demonstrate the full closed cognitive loop claimed in the high-level specification.

## 1.2 Core problem

Conventional LLM systems are optimized around ephemeral inference:

`INPUT -> CONTEXT -> MODEL -> OUTPUT`

DCA's intended model is:

`INPUT -> EVENT/EVIDENCE -> COGNITIVE STATE -> REASONING -> EVALUATION/GOVERNANCE -> STATE CHANGE -> OBSERVATION -> EVENT`

The critical change is that the **state of cognition becomes a durable system object** rather than an incidental side effect of prompts.

## 1.3 What makes this worth building

The strongest defensible proposition is not "better agents" in the abstract. It is:

> **Make machine cognition persistent, temporal, provenance-bearing, challengeable and governable, then use multiple agents only where measurable collective gain exists.**

That is materially more specific than RAG, a chatbot, or an agent workflow engine.

---

# 2. Project Thesis

### Thesis

A useful autonomous cognitive system needs to know not only **what answer it produced**, but:

- what it currently believes;
- what evidence supports that belief;
- what contradicts it;
- when the belief became valid;
- what the system knew at a previous time;
- which agent/model/tool contributed;
- how confidence was formed;
- what remains unknown;
- what changed the belief;
- who or what is authorized to change it;
- and whether collective reasoning actually improved the result.

The repository already contains several structural prerequisites for this thesis, especially temporal state, evidence, events, agent trust, goals and checkpointed reasoning. The missing work is to make those concepts **first-class, connected, immutable where appropriate, and empirically testable**.

---

# 3. Problem Definition

Current AI systems commonly conflate:

- conversation history with memory;
- model assertions with facts;
- vector similarity with knowledge;
- current state with historical truth;
- explanation text with provenance;
- multiple model calls with collective reasoning;
- confidence scores with calibrated uncertainty;
- database mutation with cognitive revision.

DCA should explicitly separate these concepts.

## 3.1 Design invariant

**A model-generated statement is an assertion, not a fact, until it is supported and promoted according to explicit project rules.**

This is especially important for Cognitive Continuity: imported ChatGPT/Claude/Gemini/Grok/DeepSeek histories must not silently become authoritative knowledge. The repository's project-intelligence documents explicitly identify this requirement. fileciteturn42file0 fileciteturn50file0

---

# 4. Scope / Non-Scope

## 4.1 IN SCOPE — canonical

### Cognitive substrate

- immutable cognitive events;
- temporal world state;
- entities and relationships;
- claims, evidence and provenance;
- facts versus beliefs;
- uncertainty and epistemic gaps;
- memory tiers;
- goals/tasks and outcomes;
- cognitive continuity;
- agent identity and lifecycle;
- model/provider abstraction;
- tools and permissions;
- evaluation and audit;
- human correction/governance.

### Reasoning substrate

- task classification;
- model routing;
- specialist agents;
- private and shared agent cognition;
- deliberation;
- disagreement preservation;
- adjudication;
- investigation/experiment loops;
- measurable collective gain.

### Control plane

- WHY/provenance;
- timeline and state-at-time;
- cognitive-state search;
- conflicts;
- uncertainty/gaps;
- agent/model/tool contribution inspection;
- human correction;
- operational observability;
- 2D and optional 3D visualization.

### Integration

- Supabase/PostgreSQL;
- NATS/JetStream;
- local/cloud model providers;
- MCP;
- multimodal edge clients;
- external application clients.

## 4.2 OUT OF SCOPE — canonical

The following must remain applications, experiments or adapters rather than becoming DCA's core domain model:

- autonomous financial trading;
- ticker-specific trading agents;
- trading profitability logic;
- yfinance or other domain-specific market data as core infrastructure;
- arbitrary consumer SaaS functionality;
- generic chatbot features that do not use the cognitive substrate;
- provider-specific model rankings as architectural constants;
- vendor-specific memory implementations as the canonical abstraction;
- claims of AGI or human-equivalent cognition;
- a 3D interface becoming the underlying architecture.

UNBOX consolidation explicitly excludes trading-specific material from the core architecture. fileciteturn42file0

---

# 5. Project History & Architectural Lineage

The repository contains a progression from an event/world-state architecture toward a broader cognitive operating substrate.

## 5.1 Existing lineage

- **Phase 1:** PostgreSQL world-state/evidence/entity foundation and NATS gateway.
- **Phase 2:** temporal world-state service and conflict resolution.
- **Phase 3:** cognitive engine, LangGraph persistence, memory tiering and LiteLLM routing.
- **Phase 4:** agent lifecycle, goals, assignment, trust and edge perception.
- **Conversation layer:** Supabase conversations, messages, model preferences and imported-history storage.
- **UI layer:** DCA management console and design specification.
- **2026-09-02 consolidation:** UNBOX was explicitly folded into DCA/QUORUM as a cognitive control-plane concept. fileciteturn41file0

## 5.2 Prior-idea lineage

`PROJECT_INTELLIGENCE/UNCAPTURED_PRIOR_IDEAS.md` records prior concepts including multi-LLM history ingestion, negative-space detection, disagreement as data, agent reputation, temporary specialists, controlled self-improvement, Collective Gain benchmarking and multimodal interfaces. These are **architectural intelligence, not proof of implementation**. fileciteturn50file0

---

# 6. DCA / QUORUM / UNBOX Relationship

The three-layer model remains coherent **as an architectural direction**, provided the terms are kept distinct.

```text
                         QUORUM
          collective reasoning / deliberation
             governance / evaluation / gain
                              |
                              v
                         DCA SUBSTRATE
        events / time / world state / evidence / memory
             beliefs / facts / goals / agents / state
                              |
                              v
                    REASONING GATEWAY
             models / providers / tools / routing
                              |
                              v
                          UNBOX
            cognitive control + observability plane
        WHY / provenance / timeline / search / correction
                              |
                +-------------+-------------+
                |                           |
              2D UX                       3D UX
            console                    cognitive world
```

### Canonical interpretation

- **DCA:** concrete persistent cognitive substrate.
- **QUORUM:** collective reasoning and governance model operating on DCA.
- **UNBOX:** human-facing control/inspection experience over DCA and QUORUM.

UNBOX must not create a second cognitive database. Its state is a view/control layer over canonical cognitive state. fileciteturn42file0

---

# 7. Current Implementation Status

| Capability | Status | Evidence / finding |
|---|---|---|
| FastAPI ingestion gateway | **IMPLEMENTED** | `gateway/app/main.py` exposes event, sensor and webhook ingestion. fileciteturn23file0 |
| Event envelope | **IMPLEMENTED** | Pydantic `EventEnvelope`, UUIDv7 IDs, correlation/causation/session metadata. fileciteturn24file0 |
| NATS JetStream publication | **IMPLEMENTED** | `EventPublisher` connects, ensures stream and publishes envelopes. fileciteturn25file0 |
| PostgreSQL world state | **IMPLEMENTED** | `world_state`, `evidence`, `entities`, `relationships`, `sensors`. fileciteturn35file0 |
| Temporal state queries | **IMPLEMENTED** | `TemporalStore.get_state_at_time()` and current-state queries. fileciteturn51file0 |
| Conflict detection | **PARTIALLY IMPLEMENTED** | Trust/decay heuristics exist, but comments acknowledge simplified assumptions and conflict events are TODO. fileciteturn52file0turn53file0 |
| Fact promotion | **PARTIALLY IMPLEMENTED** | Threshold/evidence checks exist; maturation is not actually measured. fileciteturn52file0 |
| LangGraph reasoning | **PARTIALLY IMPLEMENTED** | Graph exists and persists checkpoints, but world-state and memory tools return mocks. fileciteturn54file0 |
| LangGraph persistence | **IMPLEMENTED** | `AsyncPostgresSaver` is initialized and supplied to the graph. fileciteturn57file0 |
| Complexity classifier | **IMPLEMENTED** | Classifier and tests exist. |
| LiteLLM routing | **PARTIALLY IMPLEMENTED / BROKEN PATH** | Router exists, but `route()` calls `_estimate_cost()` while only `estimate_cost()` is defined. fileciteturn55file0 |
| Memory tiering | **PARTIALLY IMPLEMENTED** | Module and tests exist; semantic/episodic architecture remains incomplete. |
| Agent registry | **PARTIALLY IMPLEMENTED / BROKEN MUTATION PATH** | Registration/read queries exist; several mutation methods define SQL but pass incorrect arguments to `execute_query`. fileciteturn65file0 |
| Goal manager | **PARTIALLY IMPLEMENTED** | Creation/assignment/completion/failure methods exist, but depends on broken ALM mutation methods and lacks rich task hierarchy. fileciteturn66file0 |
| Edge vision/audio | **IMPLEMENTED SKELETON** | Camera/audio loops and Gateway client exist; runtime depends on local hardware/models. fileciteturn64file0 |
| Supabase conversation storage | **IMPLEMENTED** | Conversations/messages/preferences/imported histories tables and RLS exist. fileciteturn38file0 |
| Supabase AI Edge Function | **IMPLEMENTED SKELETON** | OpenRouter call, preference checks and cost accounting exist. fileciteturn72file0 |
| Conversation import script | **IMPLEMENTED / LIMITED** | `scripts/import-conversations.ts` exists; full cognitive normalization is not established from current evidence. |
| 2D DCA UI | **IMPLEMENTED / SUBSTANTIAL** | Dashboard, world state, agents, conflicts, memory, cost and chat pages exist. fileciteturn60file0 |
| UNBOX 3D UI | **SPECIFIED / NOT IMPLEMENTED** | Current design material describes 3D direction; no evidence of production 3D implementation was established. |
| MCP | **SPECIFIED / NOT IMPLEMENTED** | Architectural direction exists; no MCP implementation was established in the audited repository. |
| QUORUM deliberation | **PROPOSED / NOT IMPLEMENTED** | Project intelligence defines the paradigm; no complete deliberation runtime exists. |
| Epistemic Gap Engine | **PROPOSED** | Defined in project intelligence; no dedicated runtime/schema established. fileciteturn50file0 |
| Agent Contribution Ledger | **PROPOSED** | Defined in UNBOX consolidation; no dedicated ledger schema/runtime established. fileciteturn42file0 |
| Cognitive Continuity baseline cognition | **PARTIALLY IMPLEMENTED STORAGE** | `imported_histories` exists and import tooling exists; safe claim/evidence/memory extraction pipeline is not established. fileciteturn38file0 |

---

# 8. Complete Repository Inventory

The audited repository contains these principal areas:

```text
/
├── MASTER_TECHNICAL_SPECIFICATION.md
├── MASTER_SINGLE_SOURCE_OF_TRUTH.md          # this document
├── DCA-Design-Brief.md
├── IMPLEMENTATION_PROMPT.md
├── DEVELOPER_AGENT_MASTER_PROMPT.md
├── DEPLOYMENT_GUIDE.md
├── PHASE_TWO_VERIFICATION.md
├── PHASE_THREE_VERIFICATION.md
├── PHASE_FOUR_VERIFICATION.md
├── PROJECT_INTELLIGENCE/
│   ├── UNBOX_CONSOLIDATION.md
│   └── UNCAPTURED_PRIOR_IDEAS.md
├── gateway/
│   ├── app/
│   │   ├── config.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── nats_client.py
│   └── tests/
│       ├── test_gateway.py
│       └── test_models.py
├── world_state_service/
│   ├── app/
│   │   ├── api_server.py
│   │   ├── config.py
│   │   ├── conflict_resolver.py
│   │   ├── db_client.py
│   │   ├── endpoints.py
│   │   ├── event_processor.py
│   │   ├── main.py
│   │   ├── nats_subscriber.py
│   │   ├── redis_client.py
│   │   └── temporal_store.py
│   └── tests/
│       ├── test_conflict_resolver.py
│       └── test_temporal_store.py
├── cognitive_engine/
│   ├── app/
│   │   ├── complexity_classifier.py
│   │   ├── config.py
│   │   ├── db_client.py
│   │   ├── langgraph_agent.py
│   │   ├── litellm_router.py
│   │   ├── main.py
│   │   ├── memory_tiering.py
│   │   └── meta_cognitive_controller.py
│   └── tests/
│       ├── test_complexity_classifier.py
│       └── test_memory_tiering.py
├── agent_lifecycle_manager/
│   ├── app/
│   │   ├── agent_registry.py
│   │   ├── config.py
│   │   ├── db_client.py
│   │   ├── goal_manager.py
│   │   └── main.py
│   └── tests/
├── edge_daemon/
│   ├── app/
│   │   ├── audio_processor.py
│   │   ├── config.py
│   │   ├── gateway_client.py
│   │   ├── main.py
│   │   └── vision_processor.py
│   └── tests/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 202606130001_phase_1_foundation.sql
│   │   ├── 202606130002_rls_policies.sql
│   │   ├── 202606130003_phase_4_goals.sql
│   │   ├── 202606170001_frontend_ui_state.sql
│   │   └── 202606230001_conversation_storage.sql
│   └── functions/
│       ├── gateway/
│       └── cognitive-engine/
├── shared/
│   ├── protos/
│   └── scripts/
├── scripts/
│   └── import-conversations.ts
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── app/
        ├── hooks/
        ├── imports/
        ├── lib/
        ├── services/
        ├── stores/
        └── styles/
```

### Repository hygiene findings

`.DS_Store` files are committed in multiple locations. `frontend/node_modules` is also present in the repository tree. These should be removed from source control and prevented by `.gitignore`.

**NOT ESTABLISHED FROM AVAILABLE EVIDENCE:** complete contents of every nested frontend component and every shared/proto file. The tree and major application modules were inspected, but this SSOT deliberately does not fabricate semantics for files whose implementation was not individually established.

---

# 9. System Architecture

## 9.1 Current end-to-end path

```text
EDGE / CLIENT
     |
     v
FASTAPI GATEWAY
     |
     v
NATS JETSTREAM
     |
     v
WORLD STATE SERVICE
     |
     +--> PostgreSQL world_state/evidence/entities/relationships
     |
     +--> Redis API cache
     |
     v
COGNITIVE ENGINE
     |
     +--> LangGraph checkpoints
     +--> MCC
     +--> LiteLLM
     +--> model provider
     |
     v
AGENT LIFECYCLE MANAGER
     |
     +--> goals
     +--> agents
     +--> task_assignments
     |
     v
FRONTEND / SUPABASE FUNCTIONS
```

This is a **partially realized architecture**, not yet a complete event-sourced closed loop.

## 9.2 Architectural correction

The high-level technical specification calls NATS the immutable event source of truth. fileciteturn68file0 The implementation, however, publishes to JetStream and then materializes state into PostgreSQL; it does not establish a durable PostgreSQL queryable event ledger or demonstrate replay from the complete event history.

Therefore the canonical architecture should define:

> **NATS JetStream is the transport/event-fabric layer; a durable event ledger must become the authoritative cognitive history. Materialized world state is derived state.**

Event sourcing means state can be reconstructed from the domain-event history; this is the architectural property that makes replay and historical reconstruction possible. citeturn1search3turn1search6

---

# 10. Data Architecture

## 10.1 Current core tables

| Table | Purpose | Status |
|---|---|---|
| `world_state` | Temporal fact/belief materialization | IMPLEMENTED |
| `evidence` | Raw observed/inferred evidence | IMPLEMENTED |
| `sensors` | Sensor metadata/trust | IMPLEMENTED |
| `entities` | Entity registry | IMPLEMENTED |
| `relationships` | Entity graph relationships | IMPLEMENTED |
| `goals` | Goal hierarchy | IMPLEMENTED |
| `agents` | Agent registry/trust/load | IMPLEMENTED |
| `task_assignments` | Goal-agent assignments | IMPLEMENTED |
| `conversations` | User conversation containers | IMPLEMENTED |
| `messages` | Conversation messages | IMPLEMENTED |
| `model_preferences` | User model preferences/budget | IMPLEMENTED |
| `imported_histories` | Raw imported LLM histories | IMPLEMENTED |
| `user_preferences` | UI preferences | IMPLEMENTED |
| `dashboard_state` | UI layout/filter state | IMPLEMENTED |
| `notification_logs` | User notifications | IMPLEMENTED |
| `system_health_cache` | Dashboard health projection | IMPLEMENTED |
| `cost_tracking_cache` | Dashboard cost projection | IMPLEMENTED |
| `episodes` | Intended memory tier | SPECIFIED / runtime creation implied by tests, schema not found in audited migrations |
| claims/provenance ledger | Explicit claim graph | NOT ESTABLISHED |
| epistemic gaps | Missing knowledge model | NOT ESTABLISHED |
| contribution ledger | Agent/model/tool attribution | NOT ESTABLISHED |
| event ledger | Durable replayable cognitive history | NOT ESTABLISHED |

## 10.2 Important schema defect

`world_state` uses an exclusion constraint on `(entity_id, attribute, time-range)` without including `state_type`. Therefore a belief and a fact for the same entity/attribute cannot overlap in validity. This conflicts with the conceptual model in which a belief can be promoted into a fact while historical belief lineage remains queryable. PostgreSQL exclusion constraints do enforce non-overlap over the specified expressions, so this is a real schema-level constraint, not merely documentation. fileciteturn35file0 citeturn2search1

**Required correction:** separate state streams or include state class in the exclusion key, while defining explicit promotion/supersession semantics.

## 10.3 Temporal model limitation

The current schema has `valid_from`/`valid_until` and `updated_at`, but does not implement full bi-temporal state. It can represent validity time, but it cannot reliably answer all questions of the form "what did the system believe it knew at ingestion time versus what was later learned about the historical interval?"

**PROPOSED:** maintain both:

- `valid_time`: when the proposition is true/claimed to be true;
- `transaction_time`: when the system recorded/changed the proposition.

---

# 11. Event Architecture

## 11.1 Current envelope

The gateway's envelope contains:

- UUIDv7 event ID;
- event type;
- schema version;
- source;
- timestamp;
- correlation ID;
- causation ID;
- session ID;
- entity ID;
- tags;
- JSON payload.

This is a strong foundation. fileciteturn24file0

## 11.2 Current event types demonstrably handled

| Event | Producer | Consumer | Status |
|---|---|---|---|
| `perception.v1.sensor.observed` | Gateway / edge | WSS | IMPLEMENTED |
| `cognition.v1.belief.updated` | Gateway | WSS | IMPLEMENTED |
| webhook-derived events | Gateway | event fabric | IMPLEMENTED ingestion; downstream handler not established |
| `ConflictDetected` | WSS | NATS | TODO |
| `FactAsserted` | WSS | NATS | TODO |
| routing decision | MCC | reasoning path | local object only; durable event not established |

## 11.3 Required event contract

Every consequential cognitive change should become an immutable event with:

```text
id
schema_version
aggregate/entity
occurred_at
recorded_at
causation_id
correlation_id
actor
actor_type
provider/model/version
payload
provenance
idempotency_key
security_context
```

Events must be:

- immutable;
- versioned;
- causally traceable;
- replayable;
- idempotently consumable;
- tenant/project scoped;
- auditable.

NATS JetStream provides persisted streams and consumer acknowledgement/redelivery semantics, but the project still needs to define its own domain-level idempotency and ledger semantics. citeturn1search8

---

# 12. Cognitive State

Canonical cognitive state should be divided into:

1. **Observation:** what a source actually emitted.
2. **Evidence:** a normalized provenance-bearing observation or derived support object.
3. **Claim:** a proposition asserted about the world.
4. **Belief:** a currently accepted proposition with uncertainty.
5. **Fact:** a proposition promoted under explicit evidence/governance rules.
6. **Hypothesis:** a candidate explanation not currently accepted as belief.
7. **Epistemic gap:** an explicit representation of missing/insufficient knowledge.
8. **Goal:** desired state/outcome.
9. **Decision:** selected action or reasoning outcome.
10. **Action:** externally consequential operation.

The current repository has observations/evidence/facts/beliefs/goals in partial form, but not all ten as first-class objects.

---

# 13. Memory Architecture

## 13.1 Current

The repository describes:

- working memory: LangGraph state / intended Redis scratch space;
- episodic memory: `episodes` with vector embeddings, referenced by memory-tiering tests;
- semantic memory: world-state facts/beliefs;
- procedural memory: specified but no canonical `procedures` table was established.

LangGraph checkpoint persistence is a real implementation capability: checkpoints are saved by thread and can support persistence/time-travel workflows. citeturn1search4

## 13.2 Canonical future model

```text
RAW EVENTS
   |
   +--> WORKING MEMORY
   |
   +--> EPISODIC MEMORY
   |
   +--> CLAIM/EVIDENCE GRAPH
             |
             +--> SEMANTIC MEMORY
             |
             +--> BELIEFS
             |
             +--> FACTS
             |
             +--> PROCEDURAL MEMORY
```

Vector embeddings are an indexing mechanism, not a source of truth. pgvector supports exact nearest-neighbor search plus HNSW/IVFFlat approximate indexes; approximate indexes introduce recall/performance tradeoffs and therefore retrieval quality must be benchmarked. citeturn1search1

## 13.3 Memory anti-pattern

Do not turn the complete imported conversation history into a single embedding corpus and call that "memory". Historical interactions contain user assertions, model assertions, corrections, speculation and errors. The project-intelligence documents explicitly call for separation of raw interaction from derived memory. fileciteturn50file0

---

# 14. Knowledge / Claims / Beliefs

## 14.1 Required graph

```text
SOURCE
  |
EVENT / OBSERVATION
  |
EVIDENCE
  |
CLAIM
  | \
  |  \-- CONTRADICTS --> CLAIM
  |
BELIEF / HYPOTHESIS
  |
DECISION
  |
ACTION
```

The current `evidence` table is a good starting point, but arrays of `source_event_ids` and `evidence_ids` inside `world_state` are not a substitute for a queryable provenance graph.

## 14.2 Belief revision

Belief revision must be an explicit operation. Established belief-revision theory treats belief change as introduction/removal/reorganization of beliefs under rationality constraints; DCA should use that literature as conceptual guidance without pretending to implement formal AGM reasoning in the current code. citeturn1search2

**PROPOSED operations:**

- accept;
- reject;
- supersede;
- merge;
- split;
- correct;
- retract;
- invalidate;
- defer;
- investigate.

Every operation creates an event and preserves prior state.

---

# 15. Evidence & Provenance — WHY

Provenance should be a first-class API and graph, not a generated explanation string.

Canonical traversal:

```text
BELIEF
  -> CLAIM
  -> SUPPORTING / CONTRADICTING EVIDENCE
  -> SOURCE EVENT
  -> AGENT / MODEL / TOOL
  -> ORIGINAL INPUT
```

Reverse traversal:

```text
SOURCE
  -> EVENT
  -> CLAIMS
  -> BELIEFS
  -> DECISIONS
  -> ACTIONS
```

The W3C PROV model is directly relevant because it represents entities, activities and agents involved in producing or influencing information and supports provenance, reproducibility and derivation concepts. citeturn1search0turn1search7

### Canonical confidence decomposition

A confidence value must eventually expose its components:

- source reliability;
- evidence quality;
- corroboration;
- contradiction;
- recency;
- observation vs inference;
- agent/model reliability;
- human confirmation;
- historical calibration.

The current conflict resolver uses a simple multiplicative heuristic and explicitly makes simplifying assumptions. It is not a calibrated epistemic system. fileciteturn52file0

---

# 16. Temporal Cognition

The system should answer:

> What did DCA believe at time X?

and:

> What changed between X and Y, and why?

The current `TemporalStore` provides state-at-time queries using validity intervals. fileciteturn51file0

The next level requires:

- event time;
- ingestion/transaction time;
- correction time;
- supersession links;
- temporal diffs;
- belief confidence trajectories;
- evidence introduction/removal;
- historical state reconstruction from events.

A timeline UI should be a projection of this model, not an independent history database.

---

# 17. Goals & Tasks

## 17.1 Canonical hierarchy

```text
GOAL
  -> OBJECTIVE
      -> PLAN
          -> TASK
              -> SUBTASK
                  -> AGENT ACTION
                      -> TOOL ACTION
                          -> OBSERVATION
                              -> EVALUATION
                                  -> OUTCOME
```

The current database has `goals` and `task_assignments`, including parent goals and statuses, but `task_assignments` is effectively a goal-agent assignment table rather than a general task graph. fileciteturn37file0

## 17.2 Required task model

Tasks need:

- stable ID;
- goal/objective link;
- parent task;
- dependencies;
- owner;
- assigned agent;
- required capabilities;
- status;
- priority;
- deadline;
- attempts;
- retry policy;
- escalation;
- cancellation;
- verification criteria;
- outcome;
- evidence;
- cost/latency;
- causation/correlation.

---

# 18. Agent Architecture

## 18.1 Current

The registry stores:

- agent identity;
- type;
- capabilities;
- trust score;
- load/capacity;
- heartbeat;
- metadata.

Availability is filtered by heartbeat, capability, active state and capacity. fileciteturn65file0

## 18.2 Critical implementation defects

The agent registry contains SQL strings for heartbeat/load/trust operations but several methods call `execute_query` without passing the SQL query itself. Consequently those mutation paths are not trustworthy as implemented. fileciteturn65file0

The goal manager depends on these methods for assignment and completion. fileciteturn66file0

**P0 correction:** fix DB mutation methods and add integration tests that execute them against PostgreSQL rather than only mocking the client.

## 18.3 Canonical agent contract

Every agent must expose:

```text
identity
version
capabilities
input schema
output schema
required tools
permissions
model/provider
cost profile
latency profile
trust/reputation history
evaluation history
failure modes
lifecycle state
```

---

# 19. QUORUM / Multi-Agent Reasoning

QUORUM is **not** "ask five LLMs and take the majority answer."

The intended loop is:

```text
TASK
 |
 +--> independent hypotheses
 |
 +--> specialist allocation
 |
 +--> evidence acquisition
 |
 +--> disagreement preservation
 |
 +--> deliberation
 |
 +--> adjudication OR experiment
 |
 +--> evaluation
 |
 +--> collective outcome
```

Agents should be able to maintain private working cognition while contributing selected claims/evidence to shared state. The promotion path must be explicit and provenance-bearing.

### Disagreement invariant

> **Disagreement is information. Do not destroy it merely to produce a single answer.**

The project-intelligence material identifies disagreement, experiments, reputation and temporary specialists as future differentiators. fileciteturn50file0

No complete QUORUM runtime is currently established.

---

# 20. Model / Provider Routing

## 20.1 Current

The repository uses LiteLLM in the Python cognitive engine and OpenRouter in Supabase Edge Functions. Complexity classes select configured models. fileciteturn55file0 fileciteturn72file0

## 20.2 Architectural correction

OpenRouter must be an adapter, not the architecture.

Canonical stack:

```text
REASONING TASK
    |
CAPABILITY REQUIREMENTS
    |
ROUTING POLICY
    |
MODEL REGISTRY
    |
PROVIDER ADAPTER
    |
MODEL
    |
RESULT + TELEMETRY + PROVENANCE
```

The model registry should contain dynamic capability/performance data, not hard-coded transient rankings/prices.

## 20.3 Current defects

`LiteLLMRouter.route()` calls `_estimate_cost()` even though the class defines `estimate_cost()`. This is a concrete runtime defect. fileciteturn55file0

The cost logic is also hard-coded around historical model families and cannot serve as a durable pricing architecture.

---

# 21. Tool System

**NOT ESTABLISHED FROM AVAILABLE EVIDENCE:** a general-purpose tool registry/executor exists in the current repository.

The LangGraph agent declares world-state, historical-state and episodic-memory tools, but those tools currently return mock strings rather than invoking the actual services. fileciteturn54file0

Therefore the canonical future tool contract must be:

```text
TOOL ID
VERSION
DESCRIPTION
INPUT SCHEMA
OUTPUT SCHEMA
PERMISSIONS
SIDE EFFECT CLASS
TIMEOUT
RETRY POLICY
AUDIT POLICY
SANDBOX POLICY
PROVIDER
```

Tools should be classified at minimum as:

- READ;
- WRITE;
- EXECUTE;
- EXTERNAL_SIDE_EFFECT.

---

# 22. Epistemic Gap Engine

The system must represent absence and insufficiency explicitly.

Canonical gap states:

- unknown;
- missing;
- unobserved;
- uncertain;
- contradictory;
- stale;
- unsupported;
- unresolved;
- inferred.

An `epistemic_gap` should include:

```text
gap_id
severity
confidence
affected entity/claim/belief
affected goal
missing evidence
candidate investigations
expected information gain
estimated cost
risk
status
created_at
resolved_at
resolution_event
```

### Cognitive-cost decision

The Meta-Cognitive Controller should eventually choose investigation when:

`expected value of information > expected cognitive + execution cost + risk`

This is a proposed decision principle, not a current implementation.

---

# 23. Agent Contribution Ledger

The contribution ledger is required for QUORUM to become measurable.

For each meaningful reasoning episode record:

- human actor(s);
- agent/version;
- model/provider/version;
- tools;
- relevant prompt/instruction hashes;
- input events;
- retrieved evidence;
- claims;
- counterclaims;
- confidence;
- disagreements;
- adjudicator;
- outcome;
- evaluation;
- latency;
- token usage;
- cost;
- resulting state changes.

This ledger becomes the basis for:

- provenance;
- agent reputation;
- model benchmarking;
- Collective Gain;
- audit;
- rollback analysis.

**Status: PROPOSED.**

---

# 24. Cognitive Continuity

## 24.1 Current evidence

The repository has an `imported_histories` table storing raw JSON and a conversation import script. fileciteturn38file0

## 24.2 Canonical pipeline

```text
RAW INTERACTION
      |
SOURCE / PROVIDER / MODEL / TIME METADATA
      |
TURN / SESSION / ATTACHMENT NORMALIZATION
      |
USER-ORIGINATED ASSERTIONS
MODEL-ORIGINATED ASSERTIONS
TOOL OBSERVATIONS
CITATIONS
CORRECTIONS
      |
CLAIMS / EVIDENCE / EVENTS
      |
ACCEPT / REJECT / UNKNOWN
      |
DERIVED MEMORY
      |
BASELINE COGNITIVE STATE
```

The import process must preserve source distinctions. A previous LLM hallucination must remain a historical model assertion unless independently supported or explicitly accepted by a trusted actor.

### Sources to support

- ChatGPT;
- Claude;
- Gemini;
- Grok;
- DeepSeek;
- other exported LLM histories;
- PDFs;
- documents;
- transcripts;
- generated artifacts.

The important output is not merely embeddings. It is a **provenance-bearing initial cognitive state**.

---

# 25. Governance

Human governance is a cognitive operation, not a database convenience.

Canonical actions:

- confirm;
- reject;
- correct;
- edit with reason;
- forget/archive;
- add evidence;
- resolve conflict;
- pin/prioritize;
- flag for review;
- approve autonomous action.

Each action creates an event containing actor, authorization context, previous state, resulting state and reason.

---

# 26. Security

## 26.1 Current security finding

The foundation migration enables RLS on core tables, but the development policy migration grants `USING (true)` / `WITH CHECK (true)` for `world_state`, `evidence`, `sensors`, `entities` and `relationships`. The migration itself states that this is for development and must be restricted for production. fileciteturn36file0

The goals/agents/task tables are RLS-enabled but no corresponding production user-scoped policies are established in that migration. fileciteturn37file0

Conversation tables have substantially stronger user-scoped RLS. fileciteturn38file0

## 26.2 Permission lattice

```text
READ
WRITE
EXECUTE
DELEGATE
SPAWN
MODIFY_COGNITIVE_STATE
MODIFY_SYSTEM
DEPLOY
```

Permissions must be explicit per agent, tool, user, project and environment.

## 26.3 Threat model

Required tests include:

- prompt injection;
- tool injection;
- data exfiltration;
- cross-tenant access;
- cross-agent contamination;
- privilege escalation;
- malicious imported history;
- unsafe autonomous actions;
- replay attacks;
- duplicate events;
- forged provenance;
- compromised provider/model.

MCP should be treated as an integration boundary, not a security boundary by itself. The current MCP specification emphasizes consent, data privacy, tool safety and authorization responsibilities for hosts/implementers. citeturn2search3turn2search0

---

# 27. Observability

Observability must be separated from cognitive truth.

Required metrics:

- event throughput;
- consumer lag;
- event failure/retry rate;
- world-state projection latency;
- task latency;
- model latency;
- model/provider error rate;
- token usage;
- cost;
- confidence distribution;
- calibration;
- unresolved conflicts;
- epistemic gaps;
- agent success/failure;
- tool failures;
- database query latency;
- queue depth;
- service health.

Operational telemetry must not silently mutate cognitive state.

---

# 28. APIs / MCP

## Current APIs

### Gateway

- `GET /health`
- `POST /ingest/events`
- `POST /ingest/sensors/{sensor_id}/observations`
- `POST /ingest/webhooks/{source}`

These are demonstrably implemented. fileciteturn23file0

### World State Service

The repository contains an API server/endpoints implementation and verification guide documenting current-state and historical-state routes. Exact endpoint contracts should be treated as implementation evidence only after their source is individually audited.

### Supabase gateway function

Conversation operations include listing/creating conversations, reading messages and posting messages that call the cognitive-engine function. fileciteturn70file0

## Proposed CognitiveProvider interface

UNBOX consolidation proposes a provider abstraction including operations such as:

`getState()`, `getObject(id)`, `search(query)`, `getProvenance(objectId)`, `getTimeline()`, `getStateAtTime(timestamp)`, `confirm()`, `reject()`, `forget()`, `edit()`, `pin()`, `ingest()`. fileciteturn42file0

This should become a stable application-facing interface.

## MCP

MCP is suitable as an external interoperability layer because it standardizes resources, prompts and tools and has explicit capability negotiation/security concepts. citeturn2search3

**Status:** SPECIFIED / NOT IMPLEMENTED.

The MCP specification changed materially in 2026; architecture should therefore target the current protocol while isolating version-specific adapters. citeturn2search8

---

# 29. Supabase Architecture Audit

## Strengths

- PostgreSQL is a strong fit for relational cognitive state.
- JSONB supports flexible evidence/payload structures.
- pgvector can support semantic retrieval.
- RLS is present.
- Supabase Auth is integrated into conversation storage.
- migrations establish repeatable database evolution.
- Realtime is enabled for selected operational tables. fileciteturn73file0

## Weaknesses / risks

1. Development-wide RLS policies are unsafe for production. fileciteturn36file0
2. Core cognitive tables lack a durable explicit event ledger.
3. `world_state` conflates fact/belief temporal exclusion semantics.
4. Full bi-temporal cognition is absent.
5. Claim/provenance graph is represented largely by arrays.
6. Goal/agent RLS policies are incomplete.
7. `relationships` primary key prevents multiple temporal versions of the same relationship unless application logic mutates/supersedes the row; this is weaker than an append-only temporal relation model.
8. UI cache tables risk becoming accidental sources of truth.
9. The Edge Function and Python cognitive engine represent two separate model-routing paths, creating architectural duplication.

## Canonical rule

**Supabase/PostgreSQL is the cognitive persistence substrate. UI cache tables are projections. NATS is the event fabric. No cache or UI state may become canonical cognition.**

---

# 30. Frontend / UNBOX UX

The frontend is a real React/Vite application with pages for dashboard, world state, agents, conflicts, memory, cost monitoring and chat. fileciteturn60file0

The design brief defines a substantial operational console with:

- dashboard;
- temporal world-state viewer;
- agent lifecycle manager;
- conflict resolution;
- memory explorer;
- cost monitoring;
- chat;
- evidence chains;
- confidence visualization;
- timeline scrubbing;
- 2D operational control.

The brief also establishes accessibility requirements including visible focus states, keyboard accessibility and not relying on color alone. fileciteturn31file0

## UNBOX design principle

```text
BLACK BOX
   -> UNBOX
      -> COGNITIVE WORLD
```

The 3D environment should be a visualization layer over the same APIs used by 2D UI.

**3D is never the source of truth.**

Every operation must have a usable 2D equivalent.

## Required 2D parity

Every 3D object must map to:

- searchable object;
- inspectable state;
- provenance;
- timeline;
- confidence;
- contradictions;
- permissions;
- correction actions.

---

# 31. Development Stack

## Recommended canonical stack

| Layer | Recommendation | Rationale |
|---|---|---|
| Database | PostgreSQL/Supabase | Already central; relational + JSONB + vector support |
| Event fabric | NATS JetStream | Already integrated; good durable event transport |
| Backend | Python/FastAPI | Existing service architecture; strong async ecosystem |
| Cognitive workflow | LangGraph where useful | Existing persistence/checkpoint model; do not make it the cognitive database |
| Model abstraction | LiteLLM or equivalent provider adapter | Existing and provider-neutral in principle |
| Routing | DCA Reasoning Gateway | Own policy/provenance boundary rather than vendor lock-in |
| Cache | Redis | Useful for ephemeral/cache workloads, not canonical state |
| Frontend | React + TypeScript + Vite | Existing implementation; sufficient for control plane |
| State | Zustand/local query cache | Appropriate for UI state, not cognitive truth |
| UI components | Radix/Tailwind ecosystem | Already present |
| Visualization | Three.js / React Three Fiber | Optional UNBOX spatial layer |
| Interop | MCP adapter | External control/context interface |
| Deployment | Docker + existing cloud targets | Portable and consistent |

Avoid adding Kafka, another workflow engine, another database or another vector store until measured requirements justify them.

---

# 32. Testing Strategy

## P0 tests

- Gateway event schema validation.
- NATS publish/consume round trip.
- Event idempotency.
- PostgreSQL temporal constraints.
- RLS isolation.
- WSS event-to-state projection.
- historical state queries.
- conflict detection.
- fact promotion.
- cognitive engine model routing.
- ALM mutation paths.

## P1 tests

- provenance traversal;
- belief revision;
- evidence contradiction;
- temporal diff;
- epistemic gap lifecycle;
- cognitive continuity ingestion;
- agent contribution attribution;
- private/shared cognition;
- QUORUM deliberation.

## P2 tests

- adversarial agents;
- prompt/tool injection;
- autonomous action safety;
- collective-gain benchmarks;
- self-improvement sandbox;
- 3D/2D parity;
- full disaster/replay recovery.

### Acceptance criterion

No feature is "implemented" merely because a class/function exists. It is implemented only when a repeatable test demonstrates its intended behavior against the real dependency boundary where appropriate.

---

# 33. Evaluation / Collective Gain

QUORUM must earn its complexity.

Benchmark configurations:

1. Single capable model.
2. Single DCA agent.
3. Multi-agent without deliberation.
4. QUORUM deliberation.
5. Human + QUORUM.

Measure:

- correctness;
- evidence quality;
- calibration;
- uncertainty reduction;
- contradiction resolution;
- completion;
- latency;
- cost;
- robustness;
- reproducibility;
- novelty;
- human acceptance;
- recovery from failure.

The critical metric is **delta over baseline per unit cost/latency**, not number of agents or tokens consumed.

---

# 34. Self-Improvement

Self-improvement is permitted only through controlled experimentation:

```text
PROPOSE
   -> SANDBOX
      -> TEST
         -> EVALUATE
            -> COMPARE
               -> APPROVE
                  -> DEPLOY
                     -> MONITOR
                        -> ROLLBACK
```

The agent cannot define its own success metric without external governance.

Every candidate improvement must have:

- version;
- provenance;
- experiment ID;
- baseline;
- evaluation set;
- result;
- approval actor;
- rollback path.

---

# 35. Technical Debt

| Severity | Finding | Required action |
|---|---|---|
| CRITICAL | ALM mutation methods pass wrong arguments to DB client | Fix immediately + integration tests |
| CRITICAL | LiteLLM router references missing `_estimate_cost()` | Fix immediately + routing tests |
| CRITICAL | Development-wide RLS policies | Replace before production exposure |
| HIGH | No durable canonical event ledger/replay path established | Implement event history and replay |
| HIGH | World-state fact/belief exclusion semantics conflict | Redesign temporal state schema |
| HIGH | LangGraph tools are mocks | Connect to actual WSS/memory APIs |
| HIGH | Conflict/fact events are TODO | Emit durable events |
| HIGH | Trust/conflict heuristics use simplified assumptions | Replace with evidence-backed, calibrated model |
| HIGH | Dual Python/Supabase model-routing paths | Consolidate behind Reasoning Gateway |
| MEDIUM | Goal model is not a true task DAG | Introduce task/dependency model |
| MEDIUM | Provenance arrays instead of graph | Introduce claim/evidence/provenance relations |
| MEDIUM | Bi-temporal semantics incomplete | Add transaction time |
| MEDIUM | `.DS_Store` committed | Remove + ignore |
| MEDIUM | `node_modules` appears tracked | Remove from repository |
| LOW | Naming/phase numbering reflects historical evolution | Normalize terminology without breaking migrations |

---

# 36. External Research Validation

## Event sourcing

Event sourcing derives application state from a durable sequence of domain events and enables replay/reconstruction of past state. This supports DCA's intended temporal/replay architecture but does not imply that NATS alone is automatically a complete domain event store. citeturn1search3turn1search6

## Temporal constraints

PostgreSQL range types and exclusion constraints are appropriate for enforcing non-overlapping intervals, but the constraint must express the exact semantic dimensions that are intended to be mutually exclusive. citeturn2search1turn2search15

## Vector search

pgvector provides exact search and approximate HNSW/IVFFlat indexing. Approximate retrieval has recall/performance tradeoffs and should be benchmarked rather than treated as inherently correct. citeturn1search1

## Provenance

W3C PROV provides a useful standard conceptual vocabulary around entities, activities and agents producing/influencing information. DCA should borrow the conceptual discipline without forcing a particular serialization prematurely. citeturn1search0

## Belief revision

Belief revision is a mature research area concerned with rational changes to belief states. DCA's explicit correction/supersession design should be evaluated against established belief-revision concepts rather than inventing an unexplained confidence heuristic. citeturn1search2

## LangGraph persistence

LangGraph persistence stores graph state as checkpoints organized by thread and can support conversational memory, time travel and fault-tolerant execution. DCA should use this as execution/workflow persistence, not confuse it with canonical world cognition. citeturn1search4

## MCP

MCP standardizes context/tool integration and capability negotiation, with explicit security and consent considerations. It is appropriate as an interoperability boundary for DCA/UNBOX, but DCA's own authorization model must remain authoritative. citeturn2search0turn2search3

---

# 37. Architectural Comparison

| Capability | Chatbot | RAG | Agent workflow | Typical multi-agent | DCA/QUORUM target |
|---|---:|---:|---:|---:|---:|
| Persistent state | Low | Medium | Medium | Medium | High |
| Temporal cognition | Low | Low | Low/Medium | Medium | High |
| Evidence provenance | Low | Medium | Medium | Medium | High |
| Explicit uncertainty | Low | Low/Medium | Medium | Medium | High |
| Disagreement as data | Low | Low | Low | Medium | High |
| Agent attribution | Low | Low | Medium | Medium | High |
| Human correction lineage | Low | Low | Medium | Medium | High |
| Cognitive continuity | Low | Medium | Medium | Medium | High |
| Governance | Low | Low | Medium | Medium | High |
| Replay/audit | Low | Medium | Medium | Medium | High |
| Collective-gain measurement | Low | Low | Low | Low/Medium | High |
| Model independence | Low | Medium | Medium | Medium | High |
| 3D/control-plane inspection | No | No | Rare | Rare | Optional |

These are architectural capability comparisons, not empirical benchmark scores. DCA must not claim superiority until reproducible evaluations exist.

---

# 38. Unique Differentiator Analysis

The project has a potentially defensible unique proposition if it concentrates on the intersection of:

1. persistent cognitive state;
2. event/time lineage;
3. evidence/provenance-native beliefs;
4. explicit epistemic gaps;
5. disagreement preservation;
6. attributed collective reasoning;
7. human governance;
8. inspectable control-plane UX.

None of these individual technologies is unique. The potential differentiation is the **coherent integration and auditability of the cognitive lifecycle**.

The strongest differentiator is therefore not "multi-agent AI". It is:

> **A cognitive system whose evolving state can be inspected, challenged, traced through time and governed at the level of evidence, belief, agent contribution and action.**

That claim is architectural potential today, not a demonstrated market advantage.

---

# 39. Roadmap

## P0 — Foundation

| Capability | Why | Dependencies | Effort | Risk | Acceptance |
|---|---|---|---|---|---|
| Fix ALM DB mutation paths | Current runtime correctness | ALM DB client | S | Low | Real integration tests pass |
| Fix LiteLLM routing bug | Current cognitive path | Router tests | S | Low | route/complete works |
| Production RLS model | Security | Auth/tenant model | M | High | cross-user tests pass |
| Canonical event ledger | Replay/truth | NATS + Postgres | L | High | full replay reproduces state |
| Correct temporal schema | Cognitive correctness | DB migration | L | High | belief/fact histories coexist correctly |
| Real WSS tools | Connect cognition to state | WSS API | M | Medium | LangGraph retrieves real state |

## P1 — Core cognition

- Claim/evidence/provenance graph.
- WHY traversal.
- formal belief revision events.
- confidence decomposition/calibration.
- transaction-time history.
- epistemic gap objects.
- cognitive-state search.
- full Cognitive Continuity normalization.

## P2 — Collective reasoning

- agent contribution ledger;
- private/shared cognition;
- specialist lifecycle;
- disagreement model;
- deliberation/adjudication;
- investigation/experiment loop;
- Collective Gain benchmark.

## P3 — UNBOX control plane

- CognitiveProvider API;
- timeline/diff;
- provenance UI;
- correction UI;
- epistemic-gap UI;
- agent contribution explorer;
- 2D parity hardening;
- 3D spatial layer.

## P4 — Advanced cognition

- controlled self-improvement;
- predictive gap detection;
- dynamic specialist spawning;
- evidence acquisition planning;
- longitudinal reputation;
- model performance learning.

## P5 — Ecosystem

- MCP adapters;
- external cognitive providers;
- domain adapters;
- plugin/agent laboratory;
- portable cognitive-state export/import.

---

# 40. Development Plan

## Milestone 1 — Make the existing spine actually work

**Objective:** obtain one trustworthy end-to-end path.

Sequence:

1. Fix ALM DB mutation methods.
2. Fix LiteLLM routing method mismatch.
3. Verify migrations on a clean PostgreSQL database.
4. Replace mocked WSS LangGraph tools with real API calls.
5. Emit conflict/fact events.
6. Add event correlation/idempotency tests.
7. Add production-shaped RLS tests.
8. Run complete edge -> gateway -> NATS -> WSS -> cognitive -> ALM path.

**Completion:** a fresh clone can run a deterministic end-to-end demonstration with all state changes traceable.

## Milestone 2 — Establish cognitive truth

1. Add durable event ledger.
2. Separate observation/evidence/claim/belief/fact.
3. Correct temporal semantics.
4. Add provenance edges.
5. Implement state-at-time and state-diff.

**Completion:** any belief can be traced to source evidence and historical changes can be reconstructed.

## Milestone 3 — Establish uncertainty

1. Add epistemic gaps.
2. Add confidence decomposition.
3. Add calibration tests.
4. Add contradiction lifecycle.
5. Add investigation tasks.

**Completion:** system can distinguish known/unknown/uncertain/contradictory/stale.

## Milestone 4 — Establish QUORUM

1. Agent contribution ledger.
2. Private/shared agent cognition.
3. Specialist allocation.
4. Deliberation protocol.
5. Adjudication.
6. Collective Gain benchmark.

**Completion:** multi-agent operation is demonstrably better on selected tasks, or the system chooses not to use it.

## Milestone 5 — Establish UNBOX

1. CognitiveProvider API.
2. WHY.
3. Timeline.
4. Cognitive search.
5. correction/governance UI.
6. contribution explorer.
7. 3D view.

**Completion:** a user can inspect an AI result without source-code access and answer the ten core WHY questions.

---

# 41. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Architecture becomes over-engineered | High | Require measurable value for each subsystem |
| Multiple databases become sources of truth | Critical | One canonical cognitive persistence layer |
| Event system becomes transport-only | High | Durable ledger + replay tests |
| LLM hallucinations enter memory | Critical | Source typing + claim/evidence promotion |
| Confidence scores look scientific but are not calibrated | High | Benchmark calibration |
| Multi-agent increases cost without gain | High | Collective Gain benchmark |
| Tool permissions enable unsafe actions | Critical | Capability/permission lattice + approvals |
| 3D distracts from core engineering | Medium | 2D parity first |
| Vendor lock-in | Medium | Provider adapters |
| Rapid model/API churn | Medium | dynamic registry + adapters |
| Imported historical data contaminates cognition | Critical | preserve provenance/source role |

---

# 42. Open Questions

1. What exactly constitutes promotion from belief to fact?
2. Is a "fact" objective truth or simply a high-governance-confidence proposition?
3. Should agent-private beliefs ever enter shared world state automatically?
4. What is the canonical event ledger: PostgreSQL, JetStream-backed archival store, or both with clear roles?
5. What is the exact tenant/project isolation model?
6. How should epistemic gaps be generated without creating endless self-questioning?
7. What measurable threshold justifies QUORUM deliberation?
8. What evidence is sufficient for agent reputation updates?
9. Which actions require human approval?
10. How should imported user assertions differ from model-generated assertions?
11. How should external authoritative sources be ranked?
12. What is the canonical MCP deployment model under the current protocol generation?
13. Which UI operations must be real-time versus eventually consistent?
14. How much state should be retained indefinitely?
15. What is the deletion/forgetting policy for provenance-linked cognition?

---

# 43. Final Canonical Architecture

## Mission

Provide an open cognitive substrate in which AI systems can maintain persistent, temporal, evidence-backed and governable cognitive state across interactions, agents, models and interfaces.

## Problem

Opaque LLM interactions do not provide a durable, inspectable account of what a system knows, believes, remembers, does not know, or why its state changed.

## Thesis

Persistent cognition becomes substantially more useful when events, evidence, beliefs, memory, goals, agents and decisions are first-class auditable objects connected through time and provenance.

## Scope

DCA owns cognitive state and its lifecycle; QUORUM owns collective reasoning/governance; UNBOX owns inspection/control experience; applications own domain-specific business logic.

## Core concepts

`EVENT -> EVIDENCE -> CLAIM -> BELIEF/FACT/HYPOTHESIS -> MEMORY -> GOAL -> TASK -> REASONING -> EVALUATION -> ACTION -> OBSERVATION`

## System layers

1. Clients/edge.
2. Gateway/ingestion.
3. Event fabric.
4. Cognitive persistence.
5. World-state/materialized projections.
6. Memory/provenance.
7. Reasoning Gateway.
8. Agents/QUORUM.
9. Governance.
10. UNBOX control plane.

## Data model

PostgreSQL is the canonical relational substrate. JSONB is used for flexible payloads; pgvector supports retrieval indexes; event history and provenance must remain independently queryable.

## Event model

Immutable, versioned, causally linked, idempotent domain events are the history of cognitive change.

## Agent model

Agents are replaceable specialists with explicit identity, capability, permission, provider/model attribution, reputation and lifecycle.

## Reasoning model

Reasoning is a governed operation that consumes state/evidence and produces claims, decisions or actions, all attributable and evaluable.

## Governance model

Human and policy controls determine what agents can read, write, execute, delegate, spawn and modify.

## Memory model

Working, episodic, semantic and procedural memory are derived from provenance-bearing events rather than treated as interchangeable vector records.

## Provenance model

Every significant belief/decision/action must support forward and reverse provenance traversal.

## Temporal model

The system must distinguish when something was valid from when the system learned/recorded it and preserve superseded state.

## UI model

UNBOX is an inspectable control plane with 2D-first parity and optional 3D spatial visualization.

## Integration model

Provider/model/tool/MCP adapters sit behind explicit contracts. No transient vendor feature becomes the core architecture.

## Security model

Least privilege, tenant isolation, explicit tool permissions, approval gates, audit logs and immutable cognitive history.

## Evaluation model

Every advanced capability must demonstrate measurable benefit over simpler baselines.

---

# 44. Canonical Terminology

| Term | Canonical definition |
|---|---|
| **DCA** | The persistent cognitive substrate and runtime architecture. |
| **QUORUM** | The collective reasoning, deliberation, evaluation and governance paradigm operating over DCA. |
| **UNBOX** | The human-facing cognitive control/inspection plane over DCA/QUORUM. |
| **Cognitive state** | The current derived state of what the system knows, believes, remembers, intends and is doing. |
| **World state** | Time-indexed propositions about entities and their attributes. |
| **Event** | An immutable recorded occurrence that changes or informs cognitive state. |
| **Evidence** | Provenance-bearing information used to support, contradict or qualify a claim. |
| **Claim** | A proposition asserted by a source, agent, model or human. |
| **Fact** | A claim promoted to the system's fact state under explicit rules; not synonymous with metaphysical truth. |
| **Belief** | A currently accepted proposition with uncertainty/confidence and provenance. |
| **Hypothesis** | A candidate proposition/explanation under investigation rather than accepted belief. |
| **Memory** | A durable derived representation of prior events/interactions used by cognition. |
| **Goal** | A desired outcome or target state. |
| **Task** | A bounded unit of work contributing to a goal. |
| **Agent** | A governed computational actor capable of reasoning and/or action. |
| **Model** | A statistical/ML inference engine used by an agent. |
| **Provider** | A service/runtime exposing one or more models or cognitive capabilities. |
| **Tool** | An executable capability available to an agent/model under explicit permission. |
| **Provenance** | The traceable origin and derivation history of information or state. |
| **Confidence** | A numerical/structured estimate attached to a proposition; not automatically calibrated probability. |
| **Uncertainty** | The system's explicit representation of incomplete or unreliable knowledge. |
| **Epistemic gap** | A recognized missing/insufficient/contradictory knowledge condition that may justify investigation. |
| **Deliberation** | Structured comparison of independent hypotheses/evidence by multiple agents. |
| **Adjudication** | A governed process selecting or preserving outcomes after disagreement. |
| **Collective Gain** | Measured improvement of collective reasoning over a defined baseline, normalized for cost/latency where appropriate. |
| **Cognitive Continuity** | Preservation and transformation of prior interactions into provenance-bearing cognitive history and baseline state. |
| **Reasoning Gateway** | Provider-neutral policy/routing/telemetry boundary between agents and model providers. |
| **CognitiveProvider** | Application-facing abstraction for querying/manipulating cognitive state without coupling clients to storage internals. |

---

# 45. Self-Audit

### 1. Entire repository inspected?
**PARTIAL / HIGH COVERAGE.** Principal root directories, architecture documents, migrations, gateway, WSS, cognitive engine, ALM, edge daemon, frontend structure and Supabase functions were inspected. A claim of byte-for-byte semantic inspection of every nested frontend/support file would be unjustified.

### 2. Implementation separated from intention?
**YES.** Status labels are used throughout.

### 3. Obsolete/duplicated architecture identified?
**YES.** Dual model-routing paths, development RLS, cache/source-of-truth risks and historical phase duplication are identified.

### 4. Missing functionality identified?
**YES.** Event ledger, provenance graph, epistemic gaps, QUORUM runtime, contribution ledger, production MCP and 3D control plane are identified.

### 5. Hard scope established?
**YES.** Section 4.

### 6. Major subsystems documented?
**YES, to evidence-supported depth.**

### 7. Actual execution flow traced?
**YES, for the principal implemented spine; several proposed links are explicitly marked.**

### 8. Database documented?
**YES, principal migrations/tables and major defects.**

### 9. Agents/tools documented?
**YES, with mocks/limitations identified.**

### 10. Model routing documented?
**YES.**

### 11. Memory documented?
**YES.**

### 12. Provenance documented?
**YES.**

### 13. Temporal cognition documented?
**YES.**

### 14. Uncertainty documented?
**YES.**

### 15. Epistemic gaps documented?
**YES, as proposed capability.**

### 16. Human governance documented?
**YES.**

### 17. Security documented?
**YES, including concrete RLS findings.**

### 18. Testing documented?
**YES.**

### 19. UI/UNBOX documented?
**YES.**

### 20. Cognitive Continuity documented?
**YES.**

### 21. QUORUM documented?
**YES, explicitly as not yet implemented.**

### 22. External claims validated?
**YES for principal event-sourcing, PostgreSQL temporal constraints, pgvector, provenance, belief revision, LangGraph persistence and MCP assertions.**

### 23. Speculation clearly separated?
**YES.**

### 24. Genuine differentiators identified?
**YES, with the explicit warning that market superiority is not demonstrated.**

### 25. Usable by a coding agent?
**YES as the architectural context; implementation should still begin with the P0 correctness sequence rather than assuming all specifications are runtime contracts.**

---

# 46. Appendices

## Appendix A — Representative current event envelope

The current gateway creates an event subject such as:

`perception.v1.sensor.observed`

and an envelope containing UUIDv7 event ID, source, timestamp, correlation/causation/session metadata, entity ID, tags and payload. fileciteturn24file0

## Appendix B — Representative current world-state transition

Current WSS logic:

```text
incoming sensor.observed
        -> extract sensor observation
        -> create belief(s)
        -> store valid_from / valid_until
        -> query current/history
```

Belief conflict and fact promotion are currently handled through simplified heuristics; conflict/fact events remain TODO. fileciteturn53file0

## Appendix C — Representative current LangGraph flow

```text
query
  -> classify_complexity
  -> fetch_world_state
  -> reason
  -> END
```

The graph is checkpointed, but its state retrieval tools are currently mocked. fileciteturn54file0

## Appendix D — Representative current UI architecture

The frontend uses React/TypeScript/Vite with React Router, Zustand, Supabase JS, Radix UI components, Recharts and related UI dependencies. fileciteturn58file0

## Appendix E — Source-of-truth hierarchy

```text
THIS SSOT
   |
   +--> architecture decisions
   +--> scope/boundaries
   +--> terminology
   +--> implementation status
   |
   +--> specialised specifications
   |      +--> MASTER_TECHNICAL_SPECIFICATION.md
   |      +--> DCA-Design-Brief.md
   |      +--> deployment/phase guides
   |      +--> implementation documents
   |
   +--> PROJECT_INTELLIGENCE
          +--> lineage
          +--> proposals
          +--> historical ideas
```

Specialized documents remain valid and useful, but they must not contradict this SSOT without an explicit architectural decision updating the SSOT.

---

# CANONICAL PROJECT STATEMENT

**DCA / Supabase_Agentic_Assistant is an open cognitive infrastructure project for building AI systems whose persistent cognitive state—events, evidence, claims, beliefs, facts, memory, goals, agents and decisions—is durable, temporal, inspectable and governable across models, providers and interfaces.**

# CANONICAL ARCHITECTURAL STATEMENT

**DCA records consequential cognitive changes as provenance-bearing events, materializes temporal world state and memory in PostgreSQL/Supabase, routes reasoning through a provider-neutral gateway, and governs agents and actions through explicit policies; QUORUM provides collective deliberation/evaluation over that substrate, while UNBOX provides the human control plane for WHY, provenance, timelines, search, uncertainty, correction and inspection.**

# CANONICAL DIFFERENTIATOR

**The defensible differentiator is not the use of LLMs, RAG, LangGraph, NATS, Supabase or multiple agents individually, but the intended integration of persistent temporal cognition, evidence/provenance, explicit uncertainty, preserved disagreement, attributed agent contribution, measurable collective gain and human-governed inspection into one coherent cognitive lifecycle.**

# CANONICAL SCOPE BOUNDARY

**DCA owns general-purpose cognitive infrastructure and governance; QUORUM owns collective reasoning; UNBOX owns inspection and control; domain applications own domain-specific logic. Financial trading, arbitrary SaaS, provider-specific model assumptions and unrelated application behavior are outside the core cognitive substrate.**

# NEXT IMPLEMENTATION PRIORITY

**Make the existing cognitive spine truthful before expanding it: fix the concrete LiteLLM and Agent Lifecycle runtime defects, harden production RLS, correct the fact/belief temporal schema, replace mocked cognitive tools with real WSS/memory calls, and establish a durable replayable event ledger. Only after that foundation passes end-to-end tests should the project implement the provenance/claim graph, epistemic gaps and QUORUM deliberation.**

---

**End of canonical SSOT — audited commit `ed12bfbb3c8ba8957ed01b79436449930c1af752`.**
