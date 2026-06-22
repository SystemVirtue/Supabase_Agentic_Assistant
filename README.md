# Distributed Cognitive Agent (DCA)

![Version](https://img.shields.io/badge/Version-4.0-blue)
![Architecture](https://img.shields.io/badge/Architecture-Event--Driven-success)
![Status](https://img.shields.io/badge/Status-Prototype_Phase-orange)

## Executive Overview
The Distributed Cognitive Agent (DCA) is a persistent, proactive, and self-governing AI operating system. Moving beyond traditional stateless chatbot wrappers, DCA employs a decoupled "Brain-Body" architecture. 

It utilizes local edge devices (the Body) for high-frequency, privacy-preserving perception (Vision/Audio), and a centralized cloud infrastructure (the Brain) for complex reasoning, temporal world-modeling, and long-term memory management.

## Key Features
* **NATS JetStream Event Fabric:** 100% event-sourced architecture. Every thought, observation, and action is an immutable event.
* **Temporal World State:** The system tracks both *Facts* and *Beliefs* across time using bi-temporal PostgreSQL tables, allowing it to reason about the past accurately.
* **Meta-Cognitive Controller:** Dynamic routing of reasoning tasks. Simple math uses deterministic scripts; moderate logic uses local LLMs (Ollama); complex reasoning escalates to cloud models (Claude 3.5 / GPT-4o), ensuring cost and latency efficiency.
* **Multi-Agent Governance:** Internal workloads are distributed among specialized agents based on trust scores and capabilities.

## Tech Stack
* **Message Broker:** NATS JetStream
* **Database:** PostgreSQL (Supabase) + `pgvector`
* **Cache:** Redis
* **API Gateway:** FastAPI
* **Cognitive Engine:** LangGraph, Mem0, LiteLLM
* **Edge Inference:** Python, OpenCV, YOLOv12, Whisper.cpp

## Project Documentation
Please review the internal documentation before beginning development:
1.  `MASTER_TECHNICAL_SPECIFICATION.md`: The complete architectural rulebook.
2.  `IMPLEMENTATION_PROMPT.md`: The phased rollout strategy and deployment checklist.
3.  `DEVELOPER_AGENT_MASTER_PROMPT.md`: Rules of engagement for AI coding assistants.

## Quick Start (Dev Environment)
Phase 1 provisions the event fabric, persistence services, protobuf registry, and ingestion gateway.

1.  Copy the local environment template:
```bash
cp .env.example .env
```

2.  Start NATS JetStream, PostgreSQL with pgvector, and Redis:
```bash
docker compose up -d nats postgres redis
```

3.  Install Python dependencies and run the gateway:
```bash
python -m pip install -e ".[dev,proto]"
uvicorn gateway.app.main:app --reload --port 8000
```

4.  Publish a test event:
```bash
curl -X POST http://localhost:8000/ingest/events \
  -H "Content-Type: application/json" \
  -d '{"domain":"perception","event_type":"sensor.observed","payload":{"label":"door_open"}}'
```

5.  Generate protobuf bindings when compiler dependencies are installed:
```bash
shared/scripts/generate_protos.sh
```
