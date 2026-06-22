# Master Technical Specification
**Version 4.0 | Event‑Sourced, World‑Aware, Self‑Governing Architecture**

## Document Purpose
This specification defines the complete architecture, component responsibilities, data models, event schemas, interaction protocols, and deployment patterns for the DCA Cognitive Operating System. It merges high‑level systems vision with low‑level implementation detail, providing a single source of truth for architects, engineers, and stakeholders.

---

## 1. System Overview

### 1.1 Mission Statement
DCA is a persistent, proactive, and self‑improving cognitive operating system. It understands and acts upon multimodal input (text, image, audio), maintains a coherent, temporally‑accurate world model, pursues user‑defined goals across long time horizons, and governs multiple internal agents to safely and cost‑effectively deliver outcomes.

### 1.2 Core Principles
* **Event Sourcing as Truth:** The event log is the immutable, append‑only source of every state change. Current state is a materialized projection of events.
* **World‑Grounded Memory:** Explicit separation of objective facts, uncertain beliefs, and active goals, all rooted in audit‑trailed evidence.
* **Temporal Awareness:** All state can be queried “as of” any past timestamp, enabling historical reasoning.
* **Cognitive Cost Control:** Every reasoning operation is bounded by explicit budgets (cost, latency, tokens) and routed through a meta‑cognitive controller.
* **Proactive Agency:** Agents schedule tasks, manage plans, and arbitrate competing goals without continuous user prompting.
* **Multi‑Agent Governance:** A registry of specialized agents with trust scores collaborates under a governance layer.
* **Explainability & Audit:** Every conclusion is traceable back to evidence.

### 1.3 Architecture at a Glance
```text
CLIENTS (Web, Mobile, API)
          │
          ▼
    FASTAPI GATEWAY  ──── (auth, ingestion, streaming)
          │
          ▼
   NATS JETSTREAM  ──────────── immutable event fabric
          │
    ┌─────┼───────────────┐
    │     │               │
    │  PERCEPTION (YOLO,  │
    │   Whisper, …)       │
    │                     ▼
    │           WORLD STATE SERVICE (temporal, conflict‑resolving)
    │                     │
    │     ┌───────────────┼───────────────┐
    │     │               │               │
    │  EVIDENCE       BELIEFS          FACTS          GOALS
    │  STORE          STORE            STORE          STORE
    │     │               │               │
    │     └───────┬───────┘               │
    │             ▼                       │
    │       ENTITY GRAPH                  │
    │             │                       │
    │             ▼                       │
    │   COGNITIVE MEMORY HIERARCHY        │
    │  (Working, Episodic, Semantic)      │
    │             │                       │
    │             ▼                       │
    │    META‑COGNITIVE CONTROLLER        │
    │             │                       │
    │             ▼                       │
    │   AGENT LIFECYCLE MANAGER           │
    │             │                       │
    │             ▼                       │
    │  MULTI‑AGENT GOVERNANCE             │
    │             │                       │
    │             ▼                       │
    │    REASONING ROUTER ──► LITELLM ──► Ollama / Cloud LLMs
    │
    ▼
  POSTGRESQL + pgvector  (materialized views, entity graph)
    │
  REDIS  (caches, session state, streaming buffers)
```

---

## 2. Event Store & Schema

### 2.1 Philosophy
Every occurrence that changes knowledge, state, or intention is recorded as an immutable event.

### 2.2 Universal Event Envelope (Protobuf)
```protobuf
message EventEnvelope {
  string event_id       = 1;  // UUID v7 (time‑ordered)
  string event_type     = 2;  // e.g. "perception.person.detected"
  string schema_version = 3;  
  string source         = 4;  // service name
  int64  timestamp      = 5;  // epoch milliseconds (UTC)
  string correlation_id = 6;  // groups events
  string causation_id   = 7;  // direct parent event ID
  string session_id     = 8;  
  string entity_id      = 9;  // primary entity affected (optional)
  map<string,string> tags   = 10; 
  bytes payload              = 11; // serialized domain event
}
```

### 2.3 Subject Naming & Versioning
Pattern: `{domain}.{version}.{event_type}`
Examples: `perception.v1.person.detected`, `cognition.v1.task.completed`, `world.v1.belief.updated`.

### 2.4 Domain Event Definitions (Selected)

**BeliefUpdated:**
```protobuf
message BeliefUpdated {
  string entity_id      = 1;
  string attribute      = 2;   
  google.protobuf.Value value = 3;
  float confidence      = 4;   // 0.0 – 1.0
  string source_event_id = 5;  
  BeliefUpdateType update_type = 6; // INITIAL, UPDATE, DECAY, CORRECTION
  repeated string evidence_ids = 7; 
}
```

**FactAsserted:**
```protobuf
message FactAsserted {
  string fact_id        = 1;
  string entity_id      = 2;
  string attribute      = 3;
  google.protobuf.Value value = 4;
  repeated string evidence_ids = 5;
  google.protobuf.Timestamp valid_from = 6;
}
```

**RoutingDecision:**
```protobuf
message RoutingDecision {
  string request_id      = 1;
  string complexity_class = 2; // SIMPLE, MODERATE, COMPLEX, VISION
  string model_selected   = 3;
  float  routing_confidence = 4;
  int32  estimated_input_tokens = 5;
  float  estimated_cost_usd = 6;
}
```

---

## 3. World State Service (Temporal)

### 3.1 Role
Single authoritative source of “what is true” (facts) and “what is believed” (beliefs). Ingests events, resolves conflicts, maintains bi-temporal tables, and publishes updates back to NATS.

### 3.2 Temporal State Model
```sql
CREATE TABLE world_state (
  entity_id    UUID,
  attribute    TEXT,
  value        JSONB,
  confidence   FLOAT,
  state_type   TEXT,  -- 'fact' or 'belief'
  valid_from   TIMESTAMPTZ,
  valid_until  TIMESTAMPTZ,  -- NULL if currently valid
  source_event_ids TEXT[],
  evidence_ids TEXT[],
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE world_state ADD CONSTRAINT no_overlap
  EXCLUDE USING GIST (entity_id WITH =, attribute WITH =, tstzrange(valid_from, valid_until, '[)') WITH &&);
```

### 3.3 Conflict Resolution Algorithm
1.  **Ingest:** Receive `BeliefUpdated`.
2.  **Decay:** Apply time-based decay to existing beliefs (`confidence = confidence * exp(-λ * time)`).
3.  **Trust Score:** Compute `trust = confidence * source_weight * recency * evidence_factor`.
4.  **Select Best:** Highest trust score becomes active.
5.  **Detect Conflict:** If secondary belief > 0.7 trust and differs, emit `ConflictDetected`.
6.  **Fact Promotion:** If best belief > 0.9 confidence for maturation period, emit `FactAsserted`.

---

## 4. Knowledge & Memory Subsystems

### 4.1 Evidence Store
Provides explainability backbone.
```sql
CREATE TABLE evidence (
  evidence_id   UUID PRIMARY KEY,
  source_event_id UUID,
  inference_method TEXT,
  entity_id     UUID,
  attribute     TEXT,
  raw_value     JSONB,
  confidence    FLOAT,
  observed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 Entity Graph
Materialized view populated by WSS.
```sql
CREATE TABLE entities (id UUID PRIMARY KEY, type TEXT, name TEXT, attributes JSONB);
CREATE TABLE relationships (source_id UUID, target_id UUID, rel_type TEXT, properties JSONB, valid_from TIMESTAMPTZ, valid_until TIMESTAMPTZ, PRIMARY KEY (source_id, target_id, rel_type));
```

### 4.3 Memory Hierarchy
* **Working Memory:** Redis scratchpad + LangGraph state.
* **Episodic Memory:** `episodes` table (vectorized summaries of event sequences).
* **Semantic Memory:** Facts and beliefs in `world_state`.
* **Procedural Memory:** Reusable skill templates in `procedures` table.

---

## 5. Meta‑Cognitive Controller & Routing

### 5.1 Decision Loop
1.  **Cache Check:** Redis hash check for identical previous answers.
2.  **Procedural Match:** Vector search over `procedures` table.
3.  **Symbolic Fallback:** Execute deterministic logic without LLM if applicable.
4.  **LLM Router:** Classify complexity via DistilBERT -> Route to Ollama (Simple), Claude Sonnet (Moderate), GPT-4o (Complex/Vision).

### 5.2 Budget Enforcement
Abort tasks exceeding `max_cost_usd`, `max_latency_ms`, or `max_input_tokens`.

---

## 6. Agent Lifecycle Manager & Governance

### 6.1 Goal Management
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  user_id UUID,
  title TEXT,
  priority INTEGER,
  status TEXT,
  parent_goal_id UUID,
  desired_deadline TIMESTAMPTZ
);
```

### 6.2 Governance
* **Registry:** Agents register capabilities and `trust_score`.
* **Allocation:** Tasks assigned based on load, trust, and capability affinity.
* **Arbitration:** Conflicting agent facts are weighted by trust score; user overrides win.

---

## 7. Infrastructure & Deployment

* **Event Log:** NATS JetStream
* **DB:** PostgreSQL (Supabase) + pgvector
* **Cache:** Redis
* **Gateway:** FastAPI
* **Edge/Perception:** Python Daemon (YOLOv12, Whisper) - NO REASONING AT EDGE.

