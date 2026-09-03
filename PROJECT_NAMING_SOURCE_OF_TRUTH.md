# PROJECT NAMING SOURCE OF TRUTH — AURORA

**Project:** `SystemVirtue/Supabase_Agentic_Assistant`  
**Document:** `PROJECT_NAMING_SOURCE_OF_TRUTH.md`  
**Purpose:** Canonical declaration of the project name, its rationale, and the official acronym expansion.  
**Status:** CANONICAL & RATIFIED  
**Audit Reference:** MASTER_SINGLE_SOURCE_OF_TRUTH.md — Commit `ed12bfbb3c8ba8957ed01b79436449930c1af752`

---

## 1. EXECUTIVE NAMING SUMMARY

**AURORA** is the official project name for the DCA/QUORUM/UNBOX cognitive infrastructure.

### The Name
In Roman mythology, Aurora is the goddess of dawn—she dispels darkness and brings light to the world. In this project, **AURORA** is the system that dispels the *opacity* of artificial intelligence, bringing radical visibility, accountability, and trust to machine cognition.

### The Rationale
The repository currently treats LLM interactions as transient transactions. AURORA redefines this paradigm: every inference, every belief, and every decision becomes a **durable, inspectable, replayable artifact**. Where traditional AI is a black box, AURORA is a transparent cognitive window—a dawn that reveals the full lifecycle of machine thought.

### The Mythological Resonance
Aurora was not merely a passive dawn; she was a herald, a revealer. Each morning she opened the gates of the sky so that the sun could illuminate the world. AURORA the system performs the same function for machine cognition—it opens the gates of the black box so that every belief, every inference, and every governance decision is brought into the light. Like her mythological counterpart, AURORA is relentless, cyclical, and essential—she does not bring cognition into existence, but she makes it *visible*.

---

## 2. OFFICIAL ACRONYM EXPANSION

| Letter | Expansion | Canonical Mapping |
| :---: | :--- | :--- |
| **A** | **Autonomous Agentic Context & Adaptive Personalisation** | Agent registry, goals, trust scores, load balancing, and persistent session memory. |
| **U** | **Unified Substrate (DCA) & Explicit Uncertainty** | PostgreSQL/Supabase as the canonical persistence layer; epistemic gaps, unknowns, and contradictions tracked as first-class objects. |
| **R** | **Replayable Event Sourcing & Rigorous Reasoning** | Immutable event ledger (NATS JetStream); LangGraph checkpoint persistence; temporal state-at-time queries (`get_state_at_time`). |
| **O** | **Observability (UNBOX) & Orchestration (QUORUM)** | The human control plane (WHY/provenance/timeline); collective deliberation, disagreement preservation, and adjudication. |
| **R** | **Relational Provenance & Retrieval-Augmented Memory** | W3C PROV-inspired claim/evidence graph; tiered memory (working/episodic/semantic/procedural) with pgvector retrieval. |
| **A** | **Auditable Governance & Model-Agnostic Adaptability** | Permission lattice (RLS/human approvals); LiteLLM/OpenRouter adapters; MCP interoperability; provider neutrality. |

---

## 3. PROJECT SCOPE DEFINED BY AURORA

### A — Autonomous Agentic Context & Adaptive Personalisation
AURORA owns the `agent_lifecycle_manager`, giving every agent a stable identity, capability set, trust score, and load/capacity fingerprint. Agents autonomously pursue goals (`goals` and `task_assignments` tables) while adapting to each user's preferences, imported history, and conversational style—all without sacrificing governance. Agent cognition may remain private or be contributed to shared world-state, but every contribution is attributed and auditable.

### U — Unified Substrate (DCA) & Explicit Uncertainty
AURORA is the **DCA**—a single, authoritative cognitive persistence layer. It explicitly separates:
- **Observations** (raw ingress from sensors/webhooks),
- **Evidence** (provenance-bearing support objects),
- **Claims** (propositions asserted by any source),
- **Beliefs** (currently accepted propositions with confidence/uncertainty), and
- **Facts** (beliefs promoted under explicit governance rules).

Crucially, AURORA tracks what is *unknown* via `epistemic_gap` objects. The system can distinguish "we have never observed X" from "we observed X but the evidence is contradictory" from "we believe X but with low confidence." This prevents the system from hallucinating certainty and enables principled investigation planning.

### R — Replayable Event Sourcing & Rigorous Reasoning
Every consequential cognitive change becomes an immutable event (UUIDv7, causation/correlation IDs, schema version, actor attribution). These events are published to NATS JetStream and materialized into PostgreSQL projections. AURORA guarantees that you can:
- **Replay** the complete cognitive history,
- Answer **"What did we believe at 3:14 PM last Tuesday?"** (`get_state_at_time`),
- Trace exactly **which agent/model/tool** caused a given state change,
- **Reconstruct** the system's state from the event log alone.

LangGraph reasoning workflows are checkpointed via `AsyncPostgresSaver`, making them fully replayable and time-travel capable.

### O — Observability (UNBOX) & Orchestration (QUORUM
- **UNBOX**: The human-facing control plane. 2D (and optional 3D) interfaces for WHY queries, provenance traversal, timeline scrubbing, conflict visualisation, epistemic gap exploration, agent contribution inspection, and cognitive-state search. Every operation available in 3D is also available in 2D—the 3D layer is a visualisation, never the source of truth.
- **QUORUM**: The collective reasoning engine. Not a simple majority vote—AURORA orchestrates independent hypotheses, allocates specialist agents, preserves disagreements as valuable data, adjudicates through explicit governance rules, and measures *Collective Gain* before committing additional cost or latency.

### R — Relational Provenance & Retrieval-Augmented Memory
AURORA builds a traversable provenance graph inspired by W3C PROV, tracking:
```text
SOURCE → EVENT → EVIDENCE → CLAIM → BELIEF/FACT → DECISION → ACTION
```

and in reverse:

```text
ACTION → DECISION → BELIEF → CLAIM → EVIDENCE → EVENT → SOURCE
```

Every assertion is citable. Memory is rigorously tiered:

- Working: LangGraph state (ephemeral within a reasoning episode)
- Episodic: Session-level experiences with vector embeddings (pgvector)
- Semantic: World-state facts and beliefs (relational)
- Procedural: Task patterns and action sequences (specified; awaiting canonical schema)

Retrieval is augmented by pgvector (HNSW/IVFFlat approximate indexes) but is never the source of truth—retrieved items always link back to their originating evidence, preserving provenance.

### A — Auditable Governance & Model-Agnostic Adaptability

AURORA enforces a strict permission lattice:

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

Human governance actions (confirm, reject, correct, edit, retract, forget, pin, flag) are recorded as immutable events with full actor context and reason.

Meanwhile, the system sits behind a Reasoning Gateway that abstracts all providers:

- OpenAI (GPT-4, o1, etc.)
- Anthropic (Claude 3/4 families)
- Google (Gemini)
- OpenRouter (aggregator)
- Open-source (Llama, Mistral, etc.)
- Future MCP adapters

Providers are adapters, not architecture. AURORA is never locked into a single vendor.

---

## 4. CANONICAL LAYERS SUMMARY

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

- DCA is the concrete persistent cognitive substrate.
- QUORUM is the collective reasoning and governance model operating on DCA.
- UNBOX is the human-facing control/inspection experience over DCA and QUORUM.
- AURORA is the brand identity encompassing all three.

---

## 5. NAMING HIERARCHY

```text
AURORA (Project & Brand Identity)
    |
    +--> DCA (Distributed Cognitive Architecture) — The Substrate
    +--> QUORUM — Collective Reasoning & Governance
    +--> UNBOX — Human Control Plane
```

---

## 6. OFFICIAL CANONICAL DIFFERENTIATOR

AURORA is not another LLM wrapper. She is the cognitive substrate that makes machine reasoning inspectable, replayable, and governable—a dawn that turns opaque inference into transparent, accountable intelligence.

The defensible differentiator is not the use of LLMs, RAG, LangGraph, NATS, Supabase, or multiple agents individually, but the coherent integration of persistent temporal cognition, evidence/provenance, explicit uncertainty, preserved disagreement, attributed agent contribution, measurable collective gain, and human-governed inspection into one coherent cognitive lifecycle.

---

## 7. OFFICIAL PROJECT STATEMENT

AURORA is the open cognitive infrastructure that brings dawn to machine intelligence—unifying autonomous agents, temporal event-sourcing, radical provenance, collective deliberation (QUORUM), and human governance (UNBOX) into a single, inspectable, and auditable cognitive substrate. She does not just generate answers; she makes the entire evolution of machine thought accountable, replayable, and trustworthy.

---

## 8. SOURCE-OF-TRUTH HIERARCHY

```text
THIS NAMING SSOT
   |
   +--> MASTER_SINGLE_SOURCE_OF_TRUTH.md (Architecture SSOT)
   |      |
   |      +--> MASTER_TECHNICAL_SPECIFICATION.md
   |      +--> DCA-Design-Brief.md
   |      +--> deployment/phase guides
   |      +--> implementation documents
   |
   +--> PROJECT_INTELLIGENCE
          +--> UNBOX_CONSOLIDATION.md
          +--> UNCAPTURED_PRIOR_IDEAS.md
```
