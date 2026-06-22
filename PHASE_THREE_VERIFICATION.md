# Phase Three Verification Guide

This guide provides steps to verify the Cognitive Engine implementation.

## Prerequisites

1. Ensure Phase One and Phase Two infrastructure is running:
```bash
docker compose up -d nats postgres redis world_state_service
```

2. Install dependencies:
```bash
python -m pip install -e ".[dev,proto]"
python -m pip install -e "./cognitive_engine[dev]"
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. Configure LLM provider (choose one):
   - **Ollama (local):** Install Ollama and run `ollama pull llama3.2`
   - **Anthropic:** Set `ANTHROPIC_API_KEY` in .env
   - **OpenAI:** Set `OPENAI_API_KEY` in .env

## Verification Steps

### Step 1: Start Cognitive Engine Service

Run the cognitive engine service:
```bash
python -m cognitive_engine.app.main
```

Expected output:
- "Connected to PostgreSQL"
- "LangGraph AsyncPostgresSaver initialized"
- "LangGraph agent graph built successfully"
- "Cognitive Engine Service started successfully"

### Step 2: Test Complexity Classification

Create a test script to verify the MCC complexity classifier:

```python
import asyncio
from cognitive_engine.app.meta_cognitive_controller import MetaCognitiveController

async def test_classification():
    mcc = MetaCognitiveController()

    # Test simple query
    simple = await mcc.classify_only("What is the weather?")
    print(f"Simple query classified as: {simple.value}")

    # Test moderate query
    moderate = await mcc.classify_only("Explain how the system works")
    print(f"Moderate query classified as: {moderate.value}")

    # Test complex query
    complex = await mcc.classify_only("Analyze the multi-step reasoning process")
    print(f"Complex query classified as: {complex.value}")

asyncio.run(test_classification())
```

Expected output:
- Simple query: SIMPLE
- Moderate query: MODERATE
- Complex query: COMPLEX

### Step 3: Test MCC Routing with LiteLLM

Create a test script to verify LiteLLM routing:

```python
import asyncio
from cognitive_engine.app.meta_cognitive_controller import MetaCognitiveController

async def test_routing():
    mcc = MetaCognitiveController()

    routing_decision, response = await mcc.process_request(
        query="What is 2 + 2?",
    )

    print(f"Model selected: {routing_decision.model_selected}")
    print(f"Complexity: {routing_decision.complexity_class.value}")
    print(f"Estimated cost: ${routing_decision.estimated_cost_usd:.4f}")
    print(f"Response: {response}")

asyncio.run(test_routing())
```

Expected output:
- Model selected based on complexity
- Routing decision logged
- LLM response received

### Step 4: Test LangGraph Agent with State Persistence

Create a test script to verify LangGraph state persistence:

```python
import asyncio
from cognitive_engine.app.db_client import CognitiveDBClient
from cognitive_engine.app.langgraph_agent import LangGraphAgent
from cognitive_engine.app.meta_cognitive_controller import MetaCognitiveController

async def test_langgraph_persistence():
    db = CognitiveDBClient()
    await db.connect()

    mcc = MetaCognitiveController()
    agent = LangGraphAgent(db, mcc)
    agent.build_graph()

    thread_id = "test-thread-1"

    # First query
    result1 = await agent.invoke("My name is Alice", thread_id)
    print(f"First query result: {result1}")

    # Second query (should remember context)
    result2 = await agent.invoke("What is my name?", thread_id)
    print(f"Second query result: {result2}")

    # Verify state persistence
    history = await db.fetch_state_history(thread_id)
    print(f"State history entries: {len(history)}")

    await db.close()

asyncio.run(test_langgraph_persistence())
```

Expected output:
- First query processes successfully
- Second query remembers context from first query
- State history shows multiple checkpoints

### Step 5: Test State Persistence Across Reboot

1. Run the LangGraph test above to create state
2. Stop the cognitive engine service
3. Restart the cognitive engine service
4. Run the test again with the same thread_id

Expected: State should be retrieved from PostgreSQL and conversation context preserved.

### Step 6: Test Memory Tiering Job

Create a test script to verify memory tiering:

```python
import asyncio
from cognitive_engine.app.db_client import CognitiveDBClient
from cognitive_engine.app.memory_tiering import MemoryTiering

async def test_memory_tiering():
    db = CognitiveDBClient()
    await db.connect()

    tiering = MemoryTiering(db)

    # Run tiering job for last 24 hours
    stats = await tiering.run_tiering_job(hours=24)
    print(f"Memory tiering stats: {stats}")

    # Verify episodes table was created
    query = "SELECT COUNT(*) as count FROM episodes"
    result = await db.fetch_row(query)
    print(f"Episodes in database: {result['count']}")

    await db.close()

asyncio.run(test_memory_tiering())
```

Expected output:
- Episodes table created
- Episodes created from sensor data and evidence
- Stats show number of episodes created

### Step 7: Verify LangGraph Checkpointer Tables

Connect to PostgreSQL and verify LangGraph checkpointer tables:
```bash
docker exec -it supabase-agentic-assistant-postgres-1 psql -U postgres -d postgres
```

Run queries:
```sql
-- Check for LangGraph checkpointer tables
\dt

-- Verify checkpoints exist
SELECT * FROM checkpoints LIMIT 5;

-- Verify checkpoint writes
SELECT * FROM checkpoint_writes LIMIT 5;
```

Expected: LangGraph tables (checkpoints, checkpoint_writes) should exist and contain data.

### Step 8: Verify pgvector Episodes Table

```sql
-- Check episodes table
SELECT * FROM episodes LIMIT 5;

-- Verify vector index exists
SELECT indexname FROM pg_indexes WHERE tablename = 'episodes';
```

Expected: Episodes table exists with vector index.

### Step 9: Run Unit Tests

Execute the test suite:
```bash
pytest cognitive_engine/tests/ -v
```

Expected: All tests should pass.

### Step 10: Test Docker Deployment

Build and run the cognitive engine in Docker:
```bash
docker compose up -d cognitive_engine
```

Check logs:
```bash
docker compose logs cognitive_engine
```

Expected: Service starts successfully and connects to dependencies.

## Success Criteria

- [ ] Cognitive engine starts and connects to PostgreSQL
- [ ] LangGraph AsyncPostgresSaver initializes successfully
- [ ] Complexity classifier correctly categorizes queries
- [ ] LiteLLM routes to appropriate models based on complexity
- [ ] LangGraph agent processes queries with context
- [ ] State persists across service restarts (same thread_id)
- [ ] Memory tiering job creates episodes from sensor/evidence data
- [ ] Episodes table created with pgvector embeddings
- [ ] Unit tests pass
- [ ] Docker deployment works

## Troubleshooting

**Cognitive engine won't connect to PostgreSQL:**
- Verify PostgreSQL is running: `docker compose ps postgres`
- Check DATABASE_URL in .env file
- Ensure LangGraph checkpointer tables can be created

**LiteLLM routing fails:**
- Verify API keys are set in .env (for cloud models)
- For Ollama: Verify Ollama is running and model is pulled
- Check OLLAMA_BASE_URL in .env

**LangGraph state not persisting:**
- Verify AsyncPostgresSaver is initialized
- Check PostgreSQL for checkpoints table
- Ensure thread_id is consistent across queries

**Memory tiering job fails:**
- Verify evidence and sensor data exists in database
- Check pgvector extension is enabled
- Verify LiteLLM embedding works with your model

**Docker build fails:**
- Ensure all dependencies are in pyproject.toml
- Check Dockerfile.ce syntax
- Verify base image is accessible

## Advanced Testing

### Test Budget Enforcement

Set a very low budget in .env:
```
MAX_COST_USD=0.001
```

Run a complex query and verify it falls back to simple model or is rejected.

### Test Vision Classification

Run a query with `has_images=True`:
```python
complexity = await mcc.classify_only("Describe this image", has_images=True)
```

Expected: Should classify as VISION complexity.

### Test Token-based Classification

```python
complexity = await mcc.classify_only("short query", input_tokens=15000)
```

Expected: Should classify as COMPLEX due to high token count.
