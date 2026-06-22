# Phase Two Verification Guide

This guide provides steps to verify the World State Service implementation.

## Prerequisites

1. Ensure Phase One infrastructure is running:
```bash
docker compose up -d nats postgres redis
```

2. Install dependencies:
```bash
python -m pip install -e ".[dev,proto]"
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

## Verification Steps

### Step 1: Start World State Service Worker

Run the worker in one terminal:
```bash
python -m world_state_service.app.main
```

Expected output:
- "Connected to PostgreSQL"
- "Connected to NATS"
- "Subscribed to stream 'dca_events'"
- "World State Service started successfully"

### Step 2: Start World State Service API Server

Run the API server in another terminal:
```bash
uvicorn world_state_service.app.api_server:app --reload --port 8001
```

Expected output:
- "Connected to PostgreSQL"
- "Connected to Redis"
- "World State Service API started"

### Step 3: Publish Test Events via Gateway

Ensure the gateway is running:
```bash
uvicorn gateway.app.main:app --reload --port 8000
```

Publish a sensor observation event:
```bash
curl -X POST http://localhost:8000/ingest/sensors/camera-001/observations \
  -H "Content-Type: application/json" \
  -d '{
    "sensor_type": "camera",
    "payload": {
      "person_detected": true,
      "location": "living_room"
    }
  }'
```

Expected response:
```json
{
  "event_id": "...",
  "subject": "perception.v1.sensor.observed",
  "stream": "dca_events",
  "sequence": 1
}
```

### Step 4: Query Current State

Query the current state via the API:
```bash
curl http://localhost:8001/state/camera-001
```

Expected response should show the beliefs created from the sensor observation.

### Step 5: Publish Conflicting Belief Updates

Publish a belief update with high confidence:
```bash
curl -X POST http://localhost:8000/ingest/events \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "cognition",
    "event_type": "belief.updated",
    "payload": {
      "entity_id": "camera-001",
      "attribute": "location",
      "value": "kitchen",
      "confidence": 0.95,
      "update_type": "UPDATE",
      "evidence_ids": ["ev-1", "ev-2", "ev-3"]
    }
  }'
```

### Step 6: Verify Conflict Detection

Check the world state service logs for:
- "Conflict detected" warning (if conflicting values exist)
- "Promoted to fact" message (if confidence > 0.9 with sufficient evidence)

### Step 7: Query Historical State

Query state at a specific timestamp:
```bash
curl "http://localhost:8001/state/camera-001/at/2024-06-13T12:00:00Z"
```

### Step 8: Verify Database Constraints

Connect to PostgreSQL and verify temporal constraints:
```bash
docker exec -it supabase-agentic-assistant-postgres-1 psql -U postgres -d postgres
```

Run queries:
```sql
-- Check for overlapping records (should return none)
SELECT * FROM world_state WHERE entity_id = 'camera-001' AND attribute = 'location';

-- Check valid_from/valid_until logic
SELECT entity_id, attribute, value, valid_from, valid_until, state_type
FROM world_state
WHERE entity_id = 'camera-001'
ORDER BY valid_from DESC;
```

### Step 9: Run Unit Tests

Execute the test suite:
```bash
pytest world_state_service/tests/ -v
```

Expected: All tests should pass.

## Success Criteria

- [ ] Worker starts and connects to NATS, PostgreSQL, and Redis
- [ ] API server starts and responds to health checks
- [ ] Sensor observations create beliefs in the database
- [ ] Conflict detection logs warnings for conflicting values
- [ ] High-confidence beliefs promote to facts
- [ ] Time-travel queries return correct historical state
- [ ] Database temporal constraints prevent overlapping records
- [ ] Unit tests pass

## Troubleshooting

**Worker won't connect to NATS:**
- Verify NATS is running: `docker compose ps nats`
- Check NATS URL in .env file

**Worker won't connect to PostgreSQL:**
- Verify PostgreSQL is running: `docker compose ps postgres`
- Check DATABASE_URL in .env file
- Ensure migrations ran: check docker logs for postgres

**API server returns 500 errors:**
- Check logs for detailed error messages
- Verify Redis is running: `docker compose ps redis`
- Check REDIS_URL in .env file

**No events being processed:**
- Verify events are being published to NATS
- Check NATS stream exists: `curl http://localhost:8222/varz`
- Verify subject patterns match: `perception.v1.>` and `cognition.v1.>`
