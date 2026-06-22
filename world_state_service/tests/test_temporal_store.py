from datetime import UTC, datetime

import pytest

from world_state_service.app.temporal_store import TemporalStore


class MockDatabaseClient:
    """Mock database client for testing."""

    def __init__(self):
        self._data = []

    async def get_connection(self):
        return self

    async def release_connection(self, conn):
        pass

    async def execute(self, query, *args):
        # Mock execute - just track calls
        pass

    async def fetch(self, query, *args):
        # Mock fetch - return empty list
        return []

    async def fetchrow(self, query, *args):
        # Mock fetchrow - return None
        return None


@pytest.fixture
def mock_db():
    return MockDatabaseClient()


@pytest.fixture
def temporal_store(mock_db):
    return TemporalStore(mock_db)


class TestTemporalStore:
    @pytest.mark.asyncio
    async def test_insert_belief(self, temporal_store):
        """Test inserting a belief."""
        await temporal_store.insert_belief(
            entity_id="entity-1",
            attribute="color",
            value="red",
            confidence=0.8,
            source_event_id="event-1",
            evidence_ids=["ev-1"],
            update_type="INITIAL",
        )
        # If no exception, test passes
        assert True

    @pytest.mark.asyncio
    async def test_insert_fact(self, temporal_store):
        """Test inserting a fact."""
        await temporal_store.insert_fact(
            entity_id="entity-1",
            attribute="color",
            value="red",
            source_event_id="event-1",
            evidence_ids=["ev-1", "ev-2"],
        )
        # If no exception, test passes
        assert True

    @pytest.mark.asyncio
    async def test_get_state_at_time(self, temporal_store):
        """Test querying state at a specific time."""
        timestamp = datetime.now(UTC)
        state = await temporal_store.get_state_at_time(
            entity_id="entity-1", timestamp=timestamp
        )
        assert state == []

    @pytest.mark.asyncio
    async def test_get_state_at_time_with_attribute(self, temporal_store):
        """Test querying state at a specific time with attribute filter."""
        timestamp = datetime.now(UTC)
        state = await temporal_store.get_state_at_time(
            entity_id="entity-1", timestamp=timestamp, attribute="color"
        )
        assert state == []

    @pytest.mark.asyncio
    async def test_get_current_state(self, temporal_store):
        """Test querying current state."""
        state = await temporal_store.get_current_state(entity_id="entity-1")
        assert state == []

    @pytest.mark.asyncio
    async def test_get_current_state_with_attribute(self, temporal_store):
        """Test querying current state with attribute filter."""
        state = await temporal_store.get_current_state(
            entity_id="entity-1", attribute="color"
        )
        assert state == []
