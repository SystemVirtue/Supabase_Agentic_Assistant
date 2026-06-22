# Implementation Roadmap & Phases
**Target Audience:** Development Teams & Autonomous Coding Agents

This document breaks down the V4.0 Master Specification into sequential, logical deployment phases. Each phase requires specific Human-in-the-Loop (HITL) approvals to ensure architectural integrity before proceeding to complex AI reasoning tiers.

---

## Phase 1: Foundation (Event Fabric & Persistence)
**Goal:** Establish the immutable event log and the core database schema.
1.  **Task 1.1: Provision Infrastructure.**
    * Deploy NATS JetStream (Docker Compose/K8s).
    * Deploy PostgreSQL (Supabase local/cloud) with `pgvector` and `btree_gist` extensions.
    * Deploy Redis.
2.  **Task 1.2: DDL & Migrations.**
    * Execute SQL for `world_state`, `evidence`, `sensors`, `entities`, and `relationships`.
    * Implement the `no_overlap` temporal exclusion constraints.
3.  **Task 1.3: The Protobuf Registry.**
    * Define all `.proto` schemas for the Event Envelope and Domain Events (BeliefUpdated, FactAsserted, etc.).
    * Compile bindings for Python and TypeScript.
4.  **Task 1.4: API Gateway Ingestion.**
    * Build FastAPI endpoints to accept external webhooks/sensors and publish raw events to NATS.
    * *HITL CHECKPOINT 1:* Human reviews database constraints and executes a load test on NATS via FastAPI to confirm throughput and persistence.

---

## Phase 2: The World State Service (WSS)
**Goal:** Implement the "Brain's Filter" to turn raw events into temporal facts and beliefs.
1.  **Task 2.1: Event Consumer.**
    * Build the WSS worker that subscribes to `perception.*` and `cognition.*` events.
2.  **Task 2.2: Conflict Resolution Engine.**
    * Implement the Trust Score and Decay algorithms.
    * Handle `CORRECTION` overrides.
3.  **Task 2.3: Temporal Materialization.**
    * Implement the logic to safely `INSERT/UPDATE` the `world_state` table with `valid_from` and `valid_until` timestamps.
4.  **Task 2.4: Time-Travel API.**
    * Expose `GetStateAtTime(entity_id, timestamp)` via gRPC or REST.
    * *HITL CHECKPOINT 2:* Human injects conflicting JSON payloads to verify that the WSS correctly flags conflicts and promotes high-confidence beliefs to facts.

---

## Phase 3: Cognitive Routing & LangGraph Integration
**Goal:** Implement the reasoning layer that interacts with the World State.
1.  **Task 3.1: Meta-Cognitive Controller (MCC).**
    * Implement the complexity classifier (DistilBERT/Heuristics).
    * Integrate `LiteLLM` for routing to Ollama/OpenAI/Anthropic based on budget.
2.  **Task 3.2: LangGraph Scaffold.**
    * Set up the `AsyncPostgresSaver` checkpointer.
    * Create the primary Agent Graph that can query the WSS, fetch episodic memory, and use tools.
3.  **Task 3.3: Mem0 / Memory Tiering.**
    * Implement the nightly/hourly CRON job that converts `sensors`/`episodes` into `pgvector` embeddings.
    * *HITL CHECKPOINT 3:* Human requests a complex task. Verify LangGraph state persists across process reboots and MCC routing decisions are accurately logged.

---

## Phase 4: Perception Edge & Governance
**Goal:** Connect the physical world to the brain and manage internal agent workloads.
1.  **Task 4.1: Edge Daemon (The Body).**
    * Deploy Python script on Raspberry Pi/Desktop.
    * Integrate YOLOv12 / Whisper to extract semantic metadata.
    * Configure WebSocket/REST client to push to the Phase 1 Gateway.
2.  **Task 4.2: Agent Registry & Goals.**
    * Implement the `goals` table and the ALM (Agent Lifecycle Manager) loop.
    * Deploy dummy internal agents to test task allocation.
    * *HITL CHECKPOINT 4 (Final):* Human physically triggers the local daemon (e.g., enters webcam view). Trace the event from Daemon -> NATS -> WSS -> LangGraph -> Action.
