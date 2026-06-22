# Phase Four Verification Guide

This guide provides steps to verify the Edge Daemon and Agent Lifecycle Manager implementation.

## Prerequisites

1. Ensure Phase One, Phase Two, and Phase Three infrastructure is running:
```bash
docker compose up -d nats postgres redis world_state_service cognitive_engine agent_lifecycle_manager
```

2. Install dependencies:
```bash
python -m pip install -e ".[dev]"
python -m pip install -e "./edge_daemon[vision]"
python -m pip install -e "./agent_lifecycle_manager[dev]"
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. For vision processing, install YOLO (optional - mock detection will work without it):
```bash
pip install ultralytics
```

## Verification Steps

### Step 1: Start Agent Lifecycle Manager

Run the ALM service:
```bash
python -m agent_lifecycle_manager.app.main
```

Expected output:
- "Connected to PostgreSQL"
- "Agent Lifecycle Manager started successfully"

### Step 2: Register Dummy Agents

Create a test script to register dummy agents:

```python
import asyncio
from uuid import uuid4
from agent_lifecycle_manager.app.db_client import ALMDBClient
from agent_lifecycle_manager.app.agent_registry import AgentRegistry

async def register_agents():
    db = ALMDBClient()
    await db.connect()

    registry = AgentRegistry(db)

    # Register vision agent
    await registry.register_agent(
        agent_name="vision-agent-1",
        agent_type="vision",
        capabilities=["object_detection", "face_recognition"],
        max_capacity=5,
    )

    # Register reasoning agent
    await registry.register_agent(
        agent_name="reasoning-agent-1",
        agent_type="reasoning",
        capabilities=["text_analysis", "logical_reasoning"],
        max_capacity=3,
    )

    # Register planning agent
    await registry.register_agent(
        agent_name="planning-agent-1",
        agent_type="planning",
        capabilities=["task_planning", "goal_decomposition"],
        max_capacity=2,
    )

    print("Registered 3 dummy agents")

    # List agents
    agents = await registry.list_agents()
    for agent in agents:
        print(f"  - {agent['agent_name']} ({agent['agent_type']}, trust: {agent['trust_score']})")

    await db.close()

asyncio.run(register_agents())
```

Expected output:
- 3 agents registered successfully
- Agents listed with their types and trust scores

### Step 3: Create Test Goals

Create a test script to create goals:

```python
import asyncio
from uuid import uuid4
from agent_lifecycle_manager.app.db_client import ALMDBClient
from agent_lifecycle_manager.app.goal_manager import GoalManager
from agent_lifecycle_manager.app.agent_registry import AgentRegistry

async def create_goals():
    db = ALMDBClient()
    await db.connect()

    registry = AgentRegistry(db)
    goal_manager = GoalManager(db, registry)

    user_id = uuid4()

    # Create high priority goal
    await goal_manager.create_goal(
        user_id=user_id,
        title="Monitor living room for intruders",
        description="Continuous monitoring of living room camera feed",
        priority=9,
    )

    # Create medium priority goal
    await goal_manager.create_goal(
        user_id=user_id,
        title="Analyze daily activity patterns",
        description="Aggregate and analyze sensor data from the past 24 hours",
        priority=5,
    )

    # Create low priority goal
    await goal_manager.create_goal(
        user_id=user_id,
        title="Generate weekly report",
        description="Compile weekly summary of all detected events",
        priority=3,
    )

    print("Created 3 test goals")

    # List pending goals
    goals = await goal_manager.get_pending_goals(user_id)
    for goal in goals:
        print(f"  - {goal['title']} (priority: {goal['priority']})")

    await db.close()

asyncio.run(create_goals())
```

Expected output:
- 3 goals created successfully
- Goals listed by priority (highest first)

### Step 4: Test Auto-Assignment

Run the auto-assignment manually:

```python
import asyncio
from agent_lifecycle_manager.app.db_client import ALMDBClient
from agent_lifecycle_manager.app.agent_registry import AgentRegistry
from agent_lifecycle_manager.app.goal_manager import GoalManager

async def test_assignment():
    db = ALMDBClient()
    await db.connect()

    registry = AgentRegistry(db)
    goal_manager = GoalManager(db, registry)

    # Auto-assign pending goals
    assigned = await goal_manager.auto_assign_goals()
    print(f"Auto-assigned {assigned} goals")

    # Check task assignments
    query = """
        SELECT g.title, a.agent_name, ta.status
        FROM task_assignments ta
        JOIN goals g ON ta.goal_id = g.id
        JOIN agents a ON ta.agent_id = a.agent_id
    """
    assignments = await db.fetch_all(query)
    for assignment in assignments:
        print(f"  - {assignment['title']} -> {assignment['agent_name']} ({assignment['status']})")

    await db.close()

asyncio.run(test_assignment())
```

Expected output:
- Goals assigned to appropriate agents
- Task assignments show goal -> agent mappings

### Step 5: Start Edge Daemon (Mock Mode)

Run the edge daemon without camera (will use mock detection):
```bash
python -m edge_daemon.app.main
```

Expected output:
- "Connected to Gateway"
- "Loaded YOLO model" (or warning about mock detection)
- "Camera initialized"
- "Edge Daemon started successfully"

### Step 6: Verify Event Flow

With all services running:
1. Edge daemon sends mock detections to Gateway
2. Gateway publishes events to NATS
3. World State Service processes events and creates beliefs
4. Check WSS logs for belief creation

Check WSS logs:
```bash
docker compose logs world_state_service -f
```

Expected: Log entries showing "Processed event: perception.v1.sensor.observed"

### Step 7: Query World State

Query the WSS API for edge daemon state:
```bash
curl http://localhost:8001/state/edge-daemon-001
```

Expected response showing beliefs created from edge daemon observations.

### Step 8: Test Agent Heartbeat

Create a test script to simulate agent heartbeat:

```python
import asyncio
from uuid import uuid4
from agent_lifecycle_manager.app.db_client import ALMDBClient
from agent_lifecycle_manager.app.agent_registry import AgentRegistry

async def test_heartbeat():
    db = ALMDBClient()
    await db.connect()

    registry = AgentRegistry(db)

    # Get an agent
    agents = await registry.get_available_agents()
    if agents:
        agent_id = agents[0]['agent_id']

        # Update heartbeat
        await registry.update_heartbeat(agent_id)
        print(f"Updated heartbeat for {agents[0]['agent_name']}")

        # Verify agent is still available
        available = await registry.get_available_agents()
        print(f"Available agents: {len(available)}")

    await db.close()

asyncio.run(test_heartbeat())
```

Expected output:
- Heartbeat updated successfully
- Agent remains available

### Step 9: Test Trust Score Updates

Create a test script to test trust score updates:

```python
import asyncio
from uuid import uuid4
from agent_lifecycle_manager.app.db_client import ALMDBClient
from agent_lifecycle_manager.app.agent_registry import AgentRegistry

async def test_trust_scores():
    db = ALMDBClient()
    await db.connect()

    registry = AgentRegistry(db)

    # Get an agent
    agents = await registry.get_available_agents()
    if agents:
        agent_id = agents[0]['agent_id']
        initial_trust = agents[0]['trust_score']

        # Boost trust on success
        await registry.update_trust_score(agent_id, success=True)
        print(f"Trust after success: {agents[0]['trust_score'] + 0.1}")

        # Penalize trust on failure
        await registry.update_trust_score(agent_id, success=False)
        print(f"Trust after failure: {agents[0]['trust_score']}")

    await db.close()

asyncio.run(test_trust_scores())
```

Expected output:
- Trust score increases on success
- Trust score decreases on failure

### Step 10: Verify Database Tables

Connect to PostgreSQL and verify Phase 4 tables:
```bash
docker exec -it supabase-agentic-assistant-postgres-1 psql -U postgres -d postgres
```

Run queries:
```sql
-- Check goals table
SELECT * FROM goals LIMIT 5;

-- Check agents table
SELECT * FROM agents;

-- Check task_assignments table
SELECT * FROM task_assignments;
```

Expected: All tables exist with test data.

### Step 11: Run Unit Tests

Execute the test suite:
```bash
pytest edge_daemon/tests/ -v
pytest agent_lifecycle_manager/tests/ -v
```

Expected: All tests should pass.

### Step 12: Test Docker Deployment

Build and run the ALM in Docker:
```bash
docker compose up -d agent_lifecycle_manager
```

Check logs:
```bash
docker compose logs agent_lifecycle_manager
```

Expected: Service starts successfully and connects to dependencies.

## Full End-to-End Test

### Complete Event Flow Test

1. Start all services:
```bash
docker compose up -d
```

2. Register agents and create goals (using scripts from Steps 2-3)

3. Start edge daemon locally (mock mode):
```bash
python -m edge_daemon.app.main
```

4. Observe the complete flow:
   - Edge daemon generates mock detections
   - Gateway receives and publishes to NATS
   - WSS processes events and creates beliefs
   - ALM assigns goals to agents
   - Check logs for each service

5. Trace a specific event:
   - Note the event_id from edge daemon logs
   - Check NATS stream: `curl http://localhost:8222/streamz?config=dca_events`
   - Query WSS for the entity state
   - Verify agent assignment in database

## Success Criteria

- [ ] ALM starts and connects to PostgreSQL
- [ ] Dummy agents register successfully
- [ ] Goals create and auto-assign to agents
- [ ] Edge daemon starts and connects to Gateway
- [ ] Mock detections sent to Gateway successfully
- [ ] Events flow through NATS to WSS
- [ ] WSS creates beliefs from edge daemon observations
- [ ] Agent heartbeats update correctly
- [ ] Trust scores update on success/failure
- [ ] Database tables (goals, agents, task_assignments) exist with data
- [ ] Unit tests pass
- [ ] Docker deployment works

## Troubleshooting

**Edge daemon won't connect to Gateway:**
- Verify Gateway is running: `docker compose ps` (check for gateway service or run locally)
- Check GATEWAY_URL in .env file
- Ensure Gateway is accessible from edge daemon

**ALM won't connect to PostgreSQL:**
- Verify PostgreSQL is running: `docker compose ps postgres`
- Check DATABASE_URL in .env file
- Ensure Phase 4 migration ran: check docker logs for postgres

**Agents not auto-assigning:**
- Verify agents are registered and active
- Check agent heartbeat timestamps
- Verify agents have available capacity
- Check ALM logs for assignment errors

**Goals not creating:**
- Verify goals table exists in database
- Check database connection
- Ensure migration ran successfully

**YOLO model not loading:**
- Install ultralytics: `pip install ultralytics`
- Model will fall back to mock detection if not installed
- Check YOLO_MODEL path in .env

**Camera not initializing:**
- Verify camera index in .env (0 for default webcam)
- Check camera permissions
- Camera will fall back to mock mode if unavailable

## Advanced Testing

### Test with Real Camera

If you have a webcam available:
1. Set `CAMERA_INDEX=0` in .env
2. Install ultralytics: `pip install ultralytics`
3. Run edge daemon: `python -m edge_daemon.app.main`
4. Move in front of camera
5. Verify detections are sent to Gateway

### Test with Real Audio

If you want to test audio processing:
1. Set `AUDIO_ENABLED=true` in .env
2. Install dependencies: `pip install openai-whisper pyaudio`
3. Run edge daemon
4. Speak into microphone
5. Verify transcriptions are sent to Gateway

### Test Agent Failure Simulation

Simulate agent failure:
```python
# Mark a goal as failed
await goal_manager.fail_goal(goal_id, agent_id)
```

Verify:
- Agent trust score decreases
- Agent load decreases
- Goal status updates to "failed"

### Test Goal Completion

Complete a goal:
```python
# Mark a goal as completed
await goal_manager.complete_goal(goal_id, agent_id, result={"status": "success"})
```

Verify:
- Agent trust score increases
- Agent load decreases
- Goal status updates to "completed"
