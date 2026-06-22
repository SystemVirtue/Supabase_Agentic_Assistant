import pytest

from agent_lifecycle_manager.agent_registry import AgentRegistry
from agent_lifecycle_manager.app.db_client import ALMDBClient


class MockDBClient:
    """Mock database client for testing."""

    async def execute_query(self, query, *args):
        return "INSERT 0 1"

    async def fetch_row(self, query, *args):
        return {
            "agent_id": "test-agent-id",
            "agent_name": "test-agent",
            "agent_type": "vision",
            "capabilities": ["object_detection"],
            "trust_score": 0.8,
            "current_load": 0,
            "max_capacity": 10,
            "active": True,
        }

    async def fetch_all(self, query, *args):
        return [
            {
                "agent_id": "agent-1",
                "agent_name": "agent-1",
                "agent_type": "vision",
                "capabilities": ["object_detection"],
                "trust_score": 0.9,
                "current_load": 0,
                "max_capacity": 10,
                "active": True,
            }
        ]


@pytest.fixture
def mock_db():
    return MockDBClient()


@pytest.fixture
def agent_registry(mock_db):
    return AgentRegistry(mock_db)


class TestAgentRegistry:
    @pytest.mark.asyncio
    async def test_register_agent(self, agent_registry):
        """Test registering a new agent."""
        result = await agent_registry.register_agent(
            agent_name="test-agent",
            agent_type="vision",
            capabilities=["object_detection"],
        )
        assert result["agent_name"] == "test-agent"

    @pytest.mark.asyncio
    async def test_get_available_agents(self, agent_registry):
        """Test getting available agents."""
        agents = await agent_registry.get_available_agents()
        assert len(agents) > 0
        assert agents[0]["active"] is True

    @pytest.mark.asyncio
    async def test_update_trust_score_success(self, agent_registry):
        """Test updating trust score on success."""
        await agent_registry.update_trust_score("agent-1", success=True)
        # If no exception, test passes
        assert True

    @pytest.mark.asyncio
    async def test_update_trust_score_failure(self, agent_registry):
        """Test updating trust score on failure."""
        await agent_registry.update_trust_score("agent-1", success=False)
        # If no exception, test passes
        assert True
