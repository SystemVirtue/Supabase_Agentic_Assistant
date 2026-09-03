# AURORA MVP Architecture

**Project:** AURORA — Dawn for Transparent AI  
**Document status:** CANONICAL MVP DESIGN  
**Date:** 2026-09-03  
**Predecessor:** DCA / Supabase_Agentic_Assistant  

---

## 1. Purpose

AURORA is the successor implementation of the DCA concept. This document freezes the scope and architectural boundary for the first playable, real-data MVP so that implementation does not expand faster than evidence of value.

The predecessor repository remains an architectural/R&D archive. AURORA is a clean implementation rather than a wholesale refactor of that codebase.

The MVP objective is:

> Build a persistent, inspectable cognitive workspace in which AI reasoning leaves an evidence trail, can incorporate real human and model history, preserves uncertainty and disagreement, and can be exported and reconstructed on another deployment.

AURORA must be useful before it is complete.

---

## 2. Product thesis

AURORA is not primarily a chatbot, coding assistant, agent swarm, database wrapper, or model router.

It is a **transparent cognitive environment**.

The distinctive unit of value is not merely an answer. It is an answer that can expose:

- what was considered;
- which claims were made;
- what evidence supports them;
- which model or actor contributed them;
- what remains uncertain;
- where disagreement exists;
- how the current understanding evolved;
- and what should persist into the next session.

The central loop is:

`ASK -> RETRIEVE -> INVESTIGATE -> REASON -> EXPLAIN -> REMEMBER`

---

## 3. MVP success test

AURORA MVP is successful when the following complete workflow works with real, non-simulated data:

1. User starts a conversation.
2. AURORA records the interaction as durable history.
3. User imports documents and/or previous LLM conversations.
4. AURORA extracts attributable claims and evidence candidates.
5. AURORA retrieves relevant historical material.
6. AURORA answers a question using one or more real models.
7. AURORA exposes provenance, model attribution, uncertainty and disagreement.
8. AURORA records the reasoning outcome and resulting cognitive state.
9. User can inspect why a conclusion exists.
10. User can export the cognitive state.
11. A fresh deployment can import it, validate it, rebuild derived indexes and continue.

If this workflow is not reliable, additional orchestration or visualisation is not MVP progress.

---

## 4. MVP scope

### MUST IMPLEMENT

#### Interaction
- persistent conversations;
- streaming responses;
- model selection and model metadata;
- reasoning-run records;
- durable interaction events.

#### Real-world ingestion
- text/Markdown/TXT;
- PDF and common document formats where practical;
- structured conversation imports;
- provider-specific import adapters beginning with the most useful export formats;
- generic import format for future providers.

#### Cognitive substrate
- events;
- sessions/messages;
- sources/documents;
- claims;
- evidence;
- entities;
- relationships;
- memories;
- beliefs/facts distinction;
- decisions;
- goals.

#### Transparency
- source references;
- claim provenance;
- model/provider attribution;
- confidence/epistemic status;
- disagreement;
- reasoning-run history;
- "why does AURORA believe/say this?" inspection.

#### Reasoning
- provider-neutral Reasoning Gateway;
- retrieval-augmented reasoning;
- capability-aware model selection;
- single-model reasoning;
- lightweight QUORUM deliberation for selected questions;
- structured critique and synthesis;
- contribution attribution.

#### Meta-cognition
- contradiction detection;
- explicit unknowns/epistemic gaps at MVP level;
- belief revision without destructive overwrites;
- goal/decision linkage.

#### Continuity
- export;
- import;
- manifest and schema versioning;
- integrity/checksum validation;
- rebuildable derived data;
- deployment-independent cognitive state.

#### Deployment
- straightforward local development deployment;
- PostgreSQL/Supabase-compatible persistence;
- documented environment configuration;
- repeatable setup.

---

## 5. Explicitly NOT MVP

These may be designed for but must not consume MVP implementation time unless a concrete requirement emerges:

- 3D/WebGL UNBOX environment;
- autonomous agent swarms;
- Kubernetes/distributed production infrastructure;
- NATS as mandatory core dependency;
- enterprise-grade multi-tenancy beyond a sound authorization boundary;
- elaborate ontology engineering;
- autonomous self-modification;
- model training/fine-tuning;
- self-directed code modification;
- marketplace/billing;
- native IDE integrations;
- sophisticated autonomous web browsing;
- complete AGI-style planning;
- perfect formal belief revision;
- comprehensive world modelling.

Architecture must leave extension points for these capabilities without implementing them prematurely.

---

## 6. Canonical architecture

```text
                           AURORA
                             |
                    +--------+--------+
                    |                 |
                 USER/UI          API CLIENTS
                    |                 |
                    +--------+--------+
                             |
                         AURORA API
                             |
              +--------------+--------------+
              |              |              |
          INGESTION      RETRIEVAL       REASONING
              |              |              |
              v              v              v
           SOURCES       KNOWLEDGE      REASONING GATEWAY
              |              |              |
              +--------------+--------------+
                             |
                     COGNITIVE ENGINE
                             |
              +--------------+--------------+
              |              |              |
            CLAIMS         MEMORY        BELIEFS
              |              |              |
              +--------------+--------------+
                             |
                       QUORUM ENGINE
                             |
                    +--------+--------+
                    |                 |
                AGREEMENT          DISSENT
                    |                 |
                    +--------+--------+
                             |
                          SYNTHESIS
                             |
                          DECISION
                             |
                         NEW EVENT
                             |
                      EVENT LEDGER
                             |
                    +--------+--------+
                    |                 |
                POSTGRES          EXPORT
                                      |
                                      v
                                REINCARNATION
```

The architecture is intentionally modular but operationally simple.

---

## 7. Canonical cognitive lifecycle

Every meaningful cognitive operation should be representable as a durable event chain:

`INPUT -> EVENT -> INTERPRETATION -> CLAIM/EVIDENCE -> RETRIEVAL -> REASONING -> EVALUATION -> COGNITIVE STATE CHANGE -> RESPONSE/ACTION -> NEW EVENT`

The database is the durable state substrate. Events provide the historical spine. Derived indexes and caches are rebuildable.

---

## 8. Canonical data model

The first implementation should target approximately these logical domains rather than reproducing the predecessor's larger schema.

### Identity

- `users`
- `workspaces`
- `workspace_members`

### Interaction/history

- `sessions`
- `messages`
- `events`

### Knowledge

- `sources`
- `documents`
- `claims`
- `evidence`
- `entities`
- `relationships`

### Cognition

- `memories`
- `beliefs`
- `goals`
- `decisions`
- `epistemic_gaps`

### Reasoning

- `reasoning_runs`
- `model_contributions`

Tables may be combined where justified by implementation simplicity, but conceptual boundaries must remain explicit.

---

## 9. Event model

The canonical event ledger is append-only and durable.

Minimum event properties:

- event ID;
- event type;
- workspace/tenant scope;
- aggregate/entity reference where applicable;
- actor;
- causation ID;
- correlation ID;
- schema version;
- event time;
- recorded time;
- payload;
- idempotency semantics.

Target flow:

`producer -> append event ledger -> dispatch -> materialize state`

NATS JetStream may be added as a transport/dispatch layer later. It must not be the sole source of truth.

Where external delivery is required, use an outbox/publisher pattern rather than unsafe dual writes.

---

## 10. Claims, facts, beliefs and evidence

AURORA must distinguish:

- **Claim:** an assertion represented by the system.
- **Fact:** a claim currently treated as sufficiently established under defined policy.
- **Belief:** a proposition held provisionally with uncertainty.
- **Evidence:** material that supports, contradicts or contextualises a claim.
- **Source:** the origin of evidence or assertion.

An LLM statement is never a fact merely because an LLM produced it.

Imported historical model statements must be classified as model-originated assertions and evaluated before promotion into memory, belief or fact status.

---

## 11. Provenance

Canonical provenance is relational and traversable:

`SOURCE -> EVENT -> CLAIM -> EVIDENCE -> BELIEF/FACT -> DECISION -> ACTION`

and in reverse.

Denormalised ID arrays may be used for performance, but never as the authoritative provenance representation.

AURORA should be able to answer:

- Where did this claim come from?
- Which evidence supports it?
- Which evidence contradicts it?
- Which model produced it?
- When was it recorded?
- What changed it?
- Which decisions depended on it?

---

## 12. Temporal semantics

AURORA requires two distinct concepts of time:

### Valid time
When a proposition is asserted to be true.

### Record/transaction time
When AURORA recorded or learned the proposition.

The MVP must avoid destructive updates to historical cognition. Corrections should produce new records/events with explicit supersession or revision relationships.

This allows queries such as:

> What did we believe was true on date X?

versus:

> What did AURORA know or have recorded on date X?

---

## 13. Cognitive continuity

Historical AI conversations are first-class source material.

Pipeline:

`RAW IMPORT -> SOURCE METADATA -> INTERACTION EVENTS -> CLAIM EXTRACTION -> PROVENANCE -> EVIDENCE ASSESSMENT -> MEMORY CANDIDATE -> PROMOTION/REJECTION`

Each imported assertion should preserve, where available:

- provider;
- conversation/message identity;
- speaker type;
- original timestamp;
- source location;
- extraction model/version;
- epistemic status;
- confidence;
- promotion state.

User statements and model statements must remain distinguishable.

---

## 14. Reasoning Gateway

All model calls should pass through a provider-neutral gateway:

`CLIENT/AGENT -> REASONING GATEWAY -> PROVIDER ADAPTER -> MODEL`

The gateway owns policy such as:

- capability requirements;
- context requirements;
- modality;
- reliability;
- latency;
- cost;
- task suitability;
- safety/authorization;
- model/provider metadata.

A provider adapter should not become an independent reasoning brain.

---

## 15. Lightweight QUORUM

QUORUM is an AURORA capability, not a separate product in MVP.

Minimum deliberation:

```text
QUESTION
   |
   +-- MODEL A -> HYPOTHESIS
   +-- MODEL B -> HYPOTHESIS
   +-- MODEL C -> HYPOTHESIS
   |
   v
EVIDENCE RETRIEVAL
   |
   v
CROSS-CRITIQUE
   |
   +-- AGREEMENTS
   +-- DISAGREEMENTS
   +-- UNCERTAINTIES
   +-- EVIDENCE CONFLICTS
   |
   v
SYNTHESIS
   |
   v
RECORDED DECISION/CLAIMS
```

QUORUM must preserve independent contributions rather than collapsing them into an opaque final answer.

The MVP must measure at least:

- models used;
- contributions;
- evidence references;
- agreement/disagreement;
- latency;
- token usage where available;
- cost where available;
- final evaluation.

The hypothesis that multiple models create collective gain must be experimentally tested rather than assumed.

---

## 16. Epistemic gaps

MVP epistemic gaps should be simple and actionable.

A gap records:

- affected claim/belief;
- missing or contradictory evidence;
- severity;
- confidence;
- affected goal/decision;
- candidate investigation;
- status;
- resolution event.

The UI should make uncertainty visible without turning every response into a research project.

---

## 17. Cognitive portability / machine reincarnation

AURORA cognitive state must be independent of a particular machine, runtime or provider.

Define a portable state package containing at minimum:

```text
manifest.json
schema metadata
events
sessions/messages
sources/documents
claims
evidence
entities/relationships
memories/beliefs
goals/decisions
epistemic gaps
reasoning runs
model contributions
provenance links
checksums
```

Derived artifacts such as embeddings, indexes and caches should be rebuildable.

External dependencies such as model providers and API credentials must be represented as configuration requirements, never embedded as cognitive state.

Required operations:

`EXPORT -> VERIFY -> TRANSFER -> IMPORT -> MIGRATE -> REINDEX -> RESUME`

A fresh deployment should be able to reconstruct materially equivalent cognitive state from the package.

---

## 18. Developmental memory

AURORA should be designed so that development history can eventually become a source of contextual evidence:

`COMMIT -> CHANGE -> TEST -> FAILURE/SUCCESS -> DECISION -> REVISION`

This is not a full MVP subsystem.

However, the event/provenance design must not prevent later ingestion of repository history, architecture decisions, experiments and test results.

This enables a future AURORA to understand its own developmental lineage without confusing development records with production knowledge.

---

## 19. UNBOX relationship

UNBOX remains the future cognitive control-plane and visualisation layer.

For MVP, implement only the interfaces necessary to expose:

- current cognitive state;
- provenance;
- model contributions;
- uncertainty;
- conflicts;
- reasoning runs;
- goals/decisions.

No 3D control environment is required for MVP.

---

## 20. Repository design

The new AURORA repository should be a clean implementation. Do not copy the predecessor repository wholesale.

Recommended structure:

```text
aurora/
├── README.md
├── LICENSE
├── pyproject.toml
├── docker-compose.yml
├── .env.example
│
├── apps/
│   ├── api/
│   ├── worker/
│   └── web/
│
├── packages/
│   ├── cognitive/
│   │   ├── events/
│   │   ├── claims/
│   │   ├── evidence/
│   │   ├── memory/
│   │   └── provenance/
│   ├── reasoning/
│   │   ├── gateway/
│   │   ├── routing/
│   │   ├── retrieval/
│   │   └── evaluation/
│   ├── quorum/
│   │   ├── council/
│   │   ├── critique/
│   │   ├── consensus/
│   │   └── synthesis/
│   ├── continuity/
│   │   ├── importers/
│   │   ├── exporters/
│   │   ├── checkpoints/
│   │   └── migration/
│   └── common/
│
├── supabase/
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── cognitive/
│   ├── continuity/
│   └── adversarial/
├── fixtures/
├── evals/
├── docs/
└── tools/
```

The repository must remain small enough that a developer can understand the whole MVP.

---

## 21. Development rules

### Rule 1 — Real before simulated
No mocked cognitive capability may be represented as implemented.

### Rule 2 — Traceability before cleverness
A capability that cannot expose its provenance is incomplete.

### Rule 3 — State before orchestration
Do not build higher-order agents on unreliable state semantics.

### Rule 4 — Portable by default
No essential cognition may depend on one machine, provider, model or UI.

### Rule 5 — Derived data is disposable
Embeddings, indexes and caches must be rebuildable.

### Rule 6 — History is append-oriented
Do not erase cognitive history merely to update the current answer.

### Rule 7 — Models are contributors, not authorities
Model output is attributable evidence/claim material, not truth by default.

### Rule 8 — QUORUM must prove its value
Compare deliberation against a strong single-model baseline.

### Rule 9 — Architecture must earn complexity
Introduce infrastructure only when an observed requirement justifies it.

### Rule 10 — Every higher-order capability must have a substrate contract
No feature is considered implemented until its inputs, outputs, provenance, temporal semantics, authorization boundary and failure behaviour are represented.

---

## 22. MVP implementation sequence

### Stage 1 — Skeleton
- repository;
- configuration;
- local deployment;
- database;
- authentication;
- workspace boundary;
- CI;
- basic API/UI.

### Stage 2 — Cognitive spine
- events;
- sessions/messages;
- sources;
- claims;
- evidence;
- provenance;
- temporal fields.

### Stage 3 — Real reasoning
- Reasoning Gateway;
- provider adapters;
- model registry metadata;
- retrieval;
- reasoning runs;
- durable outputs.

### Stage 4 — Memory and continuity
- memory candidates;
- facts/beliefs;
- contradiction detection;
- conversation import;
- document ingestion;
- epistemic gaps.

### Stage 5 — QUORUM
- independent hypotheses;
- evidence sharing;
- critique;
- synthesis;
- contribution ledger;
- evaluation.

### Stage 6 — Reincarnation
- export package;
- validation;
- import;
- migration;
- index rebuild;
- resume.

### Stage 7 — Play with it
Stop expanding the architecture. Use AURORA against real material, deliberately try to break it, measure where it is useful, and let those observations determine the next architecture.

---

## 23. MVP acceptance matrix

| Capability | Acceptance test |
|---|---|
| Conversation | Conversation survives restart and remains attributable |
| Source ingestion | Real document can be ingested and cited |
| History import | Real exported LLM history becomes searchable, attributable source material |
| Claim extraction | Claims retain source and speaker/model provenance |
| Memory | Remembered item can be traced to its origin |
| Retrieval | Relevant evidence is returned with provenance |
| Reasoning | Model call is recorded with provider/model metadata |
| Transparency | User can inspect why a conclusion was produced |
| Conflict | Contradictory claims remain visible rather than silently merged |
| Epistemic gap | Missing knowledge can be represented and surfaced |
| QUORUM | Independent model contributions and disagreements are preserved |
| Decision | Decision links to claims/evidence/reasoning |
| Event history | Significant cognitive transitions are replay/audit capable |
| Security | Workspace isolation is tested at database/API levels |
| Export | Complete state package validates successfully |
| Reincarnation | Fresh deployment can import, rebuild derived state and continue |

---

## 24. Relationship to predecessor

The predecessor `Supabase_Agentic_Assistant` is retained as historical R&D. Its useful architectural material should be mined selectively, especially:

- model discovery/routing concepts;
- multi-model deliberation concepts;
- provenance ideas;
- event/state concepts;
- cognitive architecture experiments;
- failure analysis;
- research and design history.

Its known defects and architectural overreach must not be inherited merely for continuity.

The predecessor is evidence. It is not the implementation template.

---

## 25. Final design principle

AURORA MVP is deliberately ambitious in **capability** but conservative in **infrastructure**.

The goal is not to demonstrate that we can construct a large AI platform.

The goal is to demonstrate that a persistent AI system can become more useful because it has:

- memory;
- provenance;
- temporal continuity;
- evidence;
- uncertainty;
- attributable multi-model reasoning;
- and portable cognitive history.

If those properties prove useful in practice, the architecture can grow around demonstrated value.

If they do not, we will have learned something important before building a much larger system.
