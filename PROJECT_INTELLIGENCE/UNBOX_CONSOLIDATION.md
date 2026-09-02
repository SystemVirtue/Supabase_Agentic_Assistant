# UNBOX → DCA/QUORUM Consolidation

**Source:** SystemVirtue UNBOX architecture/conversation document, generated 2026-09-02  
**Purpose:** Preserve the useful architectural ideas from UNBOX while explicitly excluding its trading-agent focus.  
**Status:** Incorporated as project intelligence and architectural direction for DCA/QUORUM.

## 1. Executive synthesis

UNBOX is best understood not as a separate competing product, but as the **human-facing cognitive control plane and observability layer** for DCA/QUORUM.

DCA already supplies the deeper event-sourced cognitive substrate: world state, facts, beliefs, evidence, entities, goals, memory, governance, routing and agent lifecycle. UNBOX contributes the missing interaction model that makes that cognition **visible, explorable, explainable, correctable and portable**.

The combined thesis is:

> **AI should not merely produce answers. Its persistent cognitive state should be inspectable, explainable, revisable and governed by the humans and agents operating it.**

Conceptually:

`INPUT → EVENT/EVIDENCE → COGNITIVE STATE ↔ REASONING ↔ HUMAN/AGENT GOVERNANCE → ACTION`

rather than:

`INPUT → BLACK BOX → OUTPUT`

UNBOX therefore becomes a **presentation/control-plane concept within the DCA/QUORUM architecture**, not a second memory system.

## 2. What is worth importing

### A. Cognitive Control Plane

Create a clear separation between:

- **Cognitive substrate:** events, evidence, facts, beliefs, entities, goals, memories, skills and relationships.
- **Reasoning substrate:** agents, models, tools, routing, deliberation and adjudication.
- **Control plane:** inspection, provenance, timelines, corrections, confidence, conflicts, search, governance and human interaction.
- **Experience layer:** 3D/2D visualisation, dashboards, conversational interfaces and external clients.

This gives QUORUM a much stronger identity than a conventional multi-agent framework.

### B. Provider abstraction

Adopt the `CognitiveProvider` idea as an interface boundary for cognitive-state access. The UI/control plane should not depend directly on PostgreSQL tables or a particular memory implementation.

Conceptual operations:

- `getState()`
- `getObject(id)`
- `search(query)`
- `getProvenance(objectId)`
- `getTimeline()`
- `getStateAtTime(timestamp)`
- `confirm()` / `reject()` / `forget()` / `edit()` / `pin()`
- `ingest()`

Backends can include native DCA/Postgres, MCP-connected systems, imported cognitive stores or future adapters.

### C. WHY / provenance as a first-class primitive

The strongest UNBOX concept is the **WHY interaction**:

> Why does the system believe this?

A belief should be traversable through:

`BELIEF → supporting/contradicting claims → evidence → source events → agents/models/tools → original inputs`

The reverse direction should also be possible:

`SOURCE/EVENT → derived claims → beliefs → decisions/actions`

This should be implemented as a graph traversal over the existing DCA provenance/evidence architecture, not as a superficial explanation generated after the fact.

The system should distinguish:

- evidence that directly supports a claim;
- evidence that contradicts it;
- inferred/derived claims;
- model-generated assertions;
- human assertions/corrections;
- external authoritative sources;
- stale or invalidated evidence;
- confidence changes over time.

### D. Confidence explanation

Do not expose confidence as an unexplained scalar. Provide a confidence decomposition showing factors such as:

- evidence quality;
- source reliability;
- corroboration;
- contradiction;
- recency/freshness;
- direct observation vs inference;
- agent/model reliability;
- human confirmation;
- historical revision behaviour.

This directly strengthens DCA's existing belief/conflict machinery and the proposed agent reputation model.

### E. Belief revision

UNBOX reinforces a formal belief-revision layer with explicit operations:

- detect conflict;
- mark conflicted;
- resolve conflict;
- supersede;
- merge compatible beliefs;
- explicitly correct;
- invalidate obsolete information;
- retain historical state.

A correction must create an immutable event. Never silently mutate historical truth.

### F. Timeline / cognitive time travel

Provide the ability to ask:

> What did the system know/believe on date X?

and:

> What changed between X and Y, and why?

This should operate naturally on DCA's event-sourced architecture. A cognitive timeline is therefore a **query/view over the event history**, with optional materialised snapshots for performance rather than a second source of truth.

Useful operations:

- state at time;
- diff between times;
- changes to a belief;
- evidence introduced/removed;
- confidence trajectory;
- contradictions introduced/resolved;
- agent/model contributions over time.

### G. Cognitive-space search

Search should evolve beyond document retrieval. Users should be able to query the cognitive state itself:

- uncertain beliefs;
- recently learned information;
- unresolved contradictions;
- claims with weak evidence;
- things changed this week;
- entities related to X;
- evidence supporting Y;
- beliefs influenced by source Z;
- questions the system cannot currently answer;
- knowledge with high epistemic risk.

This complements the project's proposed negative-space / epistemic-gap detection.

### H. Human correction and governance

Human interaction should be treated as **new cognitive events**, not database edits.

Useful controls:

- confirm;
- reject;
- correct;
- edit with reason;
- forget/archive;
- add evidence;
- resolve conflict;
- pin/priority;
- flag for review.

Every intervention should retain actor, timestamp, previous state, resulting state and reason where available.

## 3. New architectural synthesis: the Agent Contribution Ledger

The UNBOX material also strengthens a previously identified DCA requirement: the system must know **who/what contributed to cognition**.

For every meaningful reasoning episode, record:

- human participants;
- agent identity/version;
- model/provider/version;
- tools used;
- prompts/instructions or relevant hashes;
- input events;
- claims generated;
- evidence retrieved;
- disagreements;
- votes/judgements;
- confidence changes;
- final adjudicator;
- latency;
- token/cost usage;
- resulting state changes.

This becomes a provenance-compatible **agent contribution ledger** and provides the foundation for agent reputation, Collective Gain benchmarking and post-hoc audit.

## 4. LLM Orchestrator → DCA Reasoning Gateway

The source document proposes a reusable LLM Orchestrator between applications and OpenRouter. The useful architectural principle should be retained, but the implementation should be generalized beyond OpenRouter.

DCA should expose a **Reasoning Gateway / Provider Abstraction** that sits between agents and model providers.

Responsibilities:

- task-specific model routing;
- provider abstraction;
- structured output validation;
- retries and failure handling;
- fallback chains;
- model capability matching;
- cost/latency budgets;
- caching where appropriate;
- telemetry;
- provider/model provenance;
- policy/governance checks;
- deterministic/local/cloud routing.

OpenRouter can be one adapter/provider rather than a foundational dependency. The architecture should remain compatible with direct vendor APIs, local Ollama models, other gateways and future providers.

### Important extension

Routing decisions themselves are cognitive/audit events:

`TASK → CAPABILITY REQUIREMENTS → ROUTING DECISION → MODEL/AGENT → RESULT → EVALUATION`

This allows QUORUM to learn which models/agents actually perform well for which classes of work instead of selecting models solely by static configuration.

## 5. Multi-agent cognitive federation

UNBOX's future idea of multiple agents with separate cognitive states is highly relevant to QUORUM.

The architecture should support:

- one shared global world model;
- agent-specific working memory;
- agent-specific hypotheses/beliefs;
- shared evidence;
- explicit disagreement between agents;
- controlled knowledge promotion from private → shared state;
- provenance of every promotion;
- agent reputation based on empirical performance.

This is materially stronger than simply giving multiple LLMs the same prompt and taking a majority vote.

## 6. Negative space / epistemic gaps

The UNBOX cognitive-space concept should connect directly to the project's emerging **epistemic-gap engine**.

The system should represent not only what it believes, but what it has reason to suspect is missing.

Examples:

- expected evidence absent;
- key entity unresolved;
- claim supported by only one weak source;
- contradictory sources without adjudication;
- temporal gap in an otherwise continuous sequence;
- question implied by the current goal but not answered;
- model disagreement without decisive evidence;
- stale evidence;
- unexplored alternative hypotheses.

An epistemic gap should be a first-class object/event with severity, confidence, affected claims/goals, suggested acquisition strategy and lifecycle.

## 7. Initial-state bootstrapping from LLM interaction history

The UNBOX architecture fits directly with the project's new **Cognitive Continuity** concept: importing prior conversations from ChatGPT, Claude, Gemini, Grok, DeepSeek and other systems.

Imported interaction history should not simply become a giant RAG corpus.

Instead, each interaction should be represented as provenance-bearing historical evidence/events containing, where available:

- provider;
- model/version;
- timestamp;
- conversation/session;
- user-originated statements;
- model-originated assertions;
- tool calls/results;
- citations;
- attached files/artifacts;
- user corrections/acceptance/rejection;
- derived memories;
- inferred preferences/goals;
- uncertainty and source type.

The bootstrap pipeline then constructs an **initial cognitive baseline** while preserving uncertainty and provenance. Imported model assertions must never automatically become facts merely because an LLM previously stated them.

## 8. UI direction: UNBOX as QUORUM's control-plane experience

The visual concept is worth retaining almost verbatim as the product metaphor.

### The Black Box → Cognitive World

Landing:

`mysterious black box`

Interaction:

`hover/tap → internal structure becomes visible → unbox`

Then:

`cognitive world → entities / beliefs / evidence / events / goals / agents / gaps`

The 3D environment is not the product's only interface. It is the **spatial visualisation layer** over the same cognitive API.

A complete 2D interface must provide 1:1 functional parity.

### Core interaction loop

1. User encounters a cognitive object.
2. User inspects it.
3. User asks WHY.
4. System traverses provenance.
5. User sees evidence, conflicts and contributing agents/models.
6. User travels through the timeline.
7. User confirms/corrects/rejects/adds evidence.
8. Correction becomes an event.
9. Cognitive state changes.
10. The user can inspect what changed and why.

This is a compelling differentiator for QUORUM.

## 9. What NOT to import

### Trading-specific material

Exclude:

- autonomous trading architecture;
- ticker analysis;
- market-specific agent roles;
- trading profitability claims;
- trading-specific model recommendations;
- yfinance integration;
- trading cost calculations.

Those are domain applications, not core DCA/QUORUM capabilities.

### Static model rankings/pricing

The source document contains model names, benchmark claims and pricing snapshots from 2026. These should **not** become architectural constants. Model capabilities, prices and provider availability change rapidly.

Instead, DCA should maintain a dynamic provider/model registry and evaluate providers empirically.

## 10. Relationship to existing DCA architecture

| UNBOX concept | DCA/QUORUM destination |
|---|---|
| Cognitive State | Existing world state + memory + facts/beliefs/entities/goals |
| Provenance Engine | Evidence graph + event sourcing + claim/evidence lineage |
| WHY | First-class provenance/explanation UX/API |
| Belief Revision | Existing conflict resolution, expanded into formal engine |
| Timeline | Event-sourced temporal world model + snapshots/diffs |
| Search | Cognitive-state search + semantic/hybrid retrieval |
| Correction | Governance events / human feedback |
| Provider Abstraction | CognitiveProvider + Reasoning Gateway |
| LLM Orchestrator | Generalized provider/model routing layer |
| Agent attribution | Agent Contribution Ledger |
| Multi-agent states | QUORUM federation / agent-specific cognition |
| Negative space | Epistemic Gap Engine |
| Chat import | Cognitive Continuity ingestion pipeline |
| 3D Black Box | UNBOX experience/control-plane UI |
| Mock Provider | UI/demo/test adapter |
| MCP integration | External control-plane/cognitive-state interface |

## 11. Revised architectural thesis

The strongest combined direction is therefore:

> **DCA is the cognitive operating substrate. QUORUM is the collective reasoning/governance paradigm. UNBOX is the open cognitive control plane that lets humans and agents inspect, understand, challenge and steer that substrate.**

This avoids three separate products competing for the same architecture.

### Layer model

```text
                    QUORUM
       Collective cognition / deliberation
       governance / evaluation / reputation
                         │
                  ┌──────┴──────┐
                  │     DCA     │
                  │ Cognitive   │
                  │ Substrate   │
                  └──────┬──────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     Events          Knowledge        Reasoning
     & Time          & Memory         Gateway
        │                │                │
        └────────────────┼────────────────┘
                         │
                       UNBOX
             Cognitive Control Plane
      WHY / timeline / search / correction
       provenance / confidence / gaps
                         │
              ┌──────────┴──────────┐
              │                     │
           3D UX                  2D UX
       Black Box → World      Console/Dashboard
```

## 12. Priority additions to the roadmap

### P0

1. CognitiveProvider/control-plane API.
2. First-class provenance traversal and WHY.
3. Human correction as immutable cognitive events.
4. Temporal state inspection and diffs.
5. Agent/model/tool contribution ledger.
6. Generalized Reasoning Gateway/provider abstraction.

### P1

7. Cognitive-state search.
8. Formal belief-revision engine.
9. Epistemic Gap Engine.
10. Multi-agent private/shared cognitive state.
11. Cognitive Continuity import from historical LLM conversations.
12. Confidence decomposition and calibration.

### P2

13. 3D UNBOX environment.
14. Semantic spatial navigation.
15. Cinematic Black Box reveal.
16. External MCP control-plane interface.
17. Provider/backend adapters.
18. Marketplace/plugin/domain visualization ecosystem.

## 13. Success criteria

The architecture succeeds if a user can take an apparently opaque AI result and answer, without reading source code:

1. **What does the system currently believe?**
2. **How confident is it, and why?**
3. **What evidence supports it?**
4. **What evidence contradicts it?**
5. **Where did the belief originate?**
6. **Which agents/models/tools contributed?**
7. **How has the belief changed over time?**
8. **What information is missing or uncertain?**
9. **What happens if I correct it?**
10. **Will that correction remain traceable?**

If those ten questions can be answered reliably, QUORUM has moved substantially beyond the conventional opaque multi-agent/RAG wrapper.

## 14. Bottom line

The valuable idea in UNBOX is not the 3D interface by itself, nor the LLM wrapper, nor any particular provider.

The valuable idea is the **cognitive control plane**: a coherent interface between an agent's persistent cognition and the humans/agents responsible for governing it.

Combined with DCA's event-sourced world model and QUORUM's collective reasoning direction, this gives the project a distinctive architectural centre:

> **Make machine cognition inspectable as a living, temporal, provenance-bearing system — then make collective reasoning governable on top of it.**

That is the part worth building.