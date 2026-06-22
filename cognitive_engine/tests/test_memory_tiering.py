import pytest

from cognitive_engine.app.memory_tiering import MemoryTiering


class MockDBClient:
    """Mock database client for testing."""

    async def execute_query(self, query, *args):
        return "OK"

    async def fetch_all(self, query, *args):
        return []


@pytest.fixture
def mock_db():
    return MockDBClient()


@pytest.fixture
def memory_tiering(mock_db):
    return MemoryTiering(mock_db)


class TestMemoryTiering:
    @pytest.mark.asyncio
    async def test_get_recent_sensor_data(self, memory_tiering):
        """Test fetching recent sensor data."""
        data = await memory_tiering.get_recent_sensor_data(hours=24)
        assert data == []

    @pytest.mark.asyncio
    async def test_get_recent_evidence(self, memory_tiering):
        """Test fetching recent evidence."""
        data = await memory_tiering.get_recent_evidence(hours=24)
        assert data == []

    @pytest.mark.asyncio
    async def test_get_recent_world_state_changes(self, memory_tiering):
        """Test fetching recent world state changes."""
        data = await memory_tiering.get_recent_world_state_changes(hours=24)
        assert data == []

    @pytest.mark.asyncio
    async def test_create_episodes_table(self, memory_tiering):
        """Test creating episodes table."""
        await memory_tiering.create_episodes_table()
        # If no exception, test passes
        assert True

    @pytest.mark.asyncio
    async def test_run_tiering_job(self, memory_tiering):
        """Test running the tiering job."""
        stats = await memory_tiering.run_tiering_job(hours=24)
        assert 'sensor_episodes' in stats
        assert 'evidence_episodes' in stats
        assert 'total_episodes' in stats
