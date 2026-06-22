import logging
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID, uuid4

from agent_lifecycle_manager.app.config import get_settings
from agent_lifecycle_manager.app.db_client import ALMDBClient

logger = logging.getLogger(__name__)


class AgentRegistry:
    """Manages agent registration, heartbeat, and trust scores."""

    def __init__(self, db_client: ALMDBClient):
        self._db = db_client
        self._settings = get_settings()

    async def register_agent(
        self,
        agent_name: str,
        agent_type: str,
        capabilities: list[str],
        max_capacity: int = 10,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Register a new agent in the registry.

        Args:
            agent_name: Unique agent name
            agent_type: Type of agent (e.g., "vision", "reasoning", "planning")
            capabilities: List of capabilities the agent provides
            max_capacity: Maximum concurrent tasks the agent can handle
            metadata: Additional metadata about the agent

        Returns:
            Agent registration record
        """
        agent_id = uuid4()

        query = """
            INSERT INTO agents (agent_id, agent_name, agent_type, capabilities, max_capacity, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        """

        result = await self._db.fetch_row(
            query,
            agent_id,
            agent_name,
            agent_type,
            capabilities,
            max_capacity,
            metadata or {},
        )

        logger.info(f"Registered agent: {agent_name} ({agent_type})")
        return dict(result)

    async def update_heartbeat(self, agent_id: UUID) -> None:
        """
        Update agent heartbeat timestamp.

        Args:
            agent_id: Agent UUID
        """
        query = """
            UPDATE agents
            SET last_heartbeat = $1, updated_at = $1
            WHERE agent_id = $2
        """

        await self._db.execute_query(datetime.now(UTC), agent_id)

    async def get_available_agents(
        self, agent_type: str | None = None, required_capabilities: list[str] | None = None
    ) -> list[dict[str, Any]]:
        """
        Get available agents that can handle tasks.

        Args:
            agent_type: Optional filter by agent type
            required_capabilities: Optional filter by required capabilities

        Returns:
            List of available agents sorted by trust score and load
        """
        timeout_threshold = datetime.now(UTC) - timedelta(seconds=self._settings.agent_timeout)

        if agent_type and required_capabilities:
            query = """
                SELECT * FROM agents
                WHERE active = true
                  AND last_heartbeat > $1
                  AND agent_type = $2
                  AND capabilities @> $3
                  AND current_load < max_capacity
                ORDER BY trust_score DESC, current_load ASC
            """
            results = await self._db.fetch_all(query, timeout_threshold, agent_type, required_capabilities)
        elif agent_type:
            query = """
                SELECT * FROM agents
                WHERE active = true
                  AND last_heartbeat > $1
                  AND agent_type = $2
                  AND current_load < max_capacity
                ORDER BY trust_score DESC, current_load ASC
            """
            results = await self._db.fetch_all(query, timeout_threshold, agent_type)
        else:
            query = """
                SELECT * FROM agents
                WHERE active = true
                  AND last_heartbeat > $1
                  AND current_load < max_capacity
                ORDER BY trust_score DESC, current_load ASC
            """
            results = await self._db.fetch_all(query, timeout_threshold)

        return [dict(row) for row in results]

    async def increment_agent_load(self, agent_id: UUID) -> None:
        """Increment agent current load."""
        query = """
            UPDATE agents
            SET current_load = current_load + 1, updated_at = $1
            WHERE agent_id = $2
        """

        await self._db.execute_query(datetime.now(UTC), agent_id)

    async def decrement_agent_load(self, agent_id: UUID) -> None:
        """Decrement agent current load."""
        query = """
            UPDATE agents
            SET current_load = GREATEST(0, current_load - 1), updated_at = $1
            WHERE agent_id = $2
        """

        await self._db.execute_query(datetime.now(UTC), agent_id)

    async def update_trust_score(self, agent_id: UUID, success: bool) -> None:
        """
        Update agent trust score based on task success/failure.

        Args:
            agent_id: Agent UUID
            success: Whether the task was successful
        """
        if success:
            boost = self._settings.trust_boost_on_success
            query = """
                UPDATE agents
                SET trust_score = LEAST(1.0, trust_score + $1), updated_at = $2
                WHERE agent_id = $3
            """
            await self._db.execute_query(boost, datetime.now(UTC), agent_id)
        else:
            penalty = self._settings.trust_penalty_on_failure
            query = """
                UPDATE agents
                SET trust_score = GREATEST(0.0, trust_score - $1), updated_at = $2
                WHERE agent_id = $3
            """
            await self._db.execute_query(penalty, datetime.now(UTC), agent_id)

    async def deactivate_stale_agents(self) -> int:
        """
        Deactivate agents that haven't sent heartbeat within timeout.

        Returns:
            Number of agents deactivated
        """
        timeout_threshold = datetime.now(UTC) - timedelta(seconds=self._settings.agent_timeout)

        query = """
            UPDATE agents
            SET active = false, updated_at = $1
            WHERE active = true
              AND last_heartbeat < $2
        """

        result = await self._db.execute_query(datetime.now(UTC), timeout_threshold)
        count = int(result.split()[-1]) if result else 0

        if count > 0:
            logger.info(f"Deactivated {count} stale agents")

        return count

    async def get_agent(self, agent_id: UUID) -> dict[str, Any] | None:
        """Get agent by ID."""
        query = "SELECT * FROM agents WHERE agent_id = $1"
        result = await self._db.fetch_row(query, agent_id)
        return dict(result) if result else None

    async def list_agents(self, active_only: bool = True) -> list[dict[str, Any]]:
        """List all agents."""
        if active_only:
            query = "SELECT * FROM agents WHERE active = true ORDER BY trust_score DESC"
        else:
            query = "SELECT * FROM agents ORDER BY trust_score DESC"

        results = await self._db.fetch_all(query)
        return [dict(row) for row in results]
