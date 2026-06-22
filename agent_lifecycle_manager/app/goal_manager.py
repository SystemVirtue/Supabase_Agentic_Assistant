import logging
from datetime import UTC, datetime
from typing import Any
from uuid import UUID, uuid4

from agent_lifecycle_manager.app.agent_registry import AgentRegistry
from agent_lifecycle_manager.app.db_client import ALMDBClient

logger = logging.getLogger(__name__)


class GoalManager:
    """Manages goal creation, assignment, and tracking."""

    def __init__(self, db_client: ALMDBClient, agent_registry: AgentRegistry):
        self._db = db_client
        self._registry = agent_registry

    async def create_goal(
        self,
        user_id: UUID,
        title: str,
        description: str | None = None,
        priority: int = 5,
        parent_goal_id: UUID | None = None,
        desired_deadline: datetime | None = None,
    ) -> dict[str, Any]:
        """
        Create a new goal.

        Args:
            user_id: User UUID
            title: Goal title
            description: Optional description
            priority: Priority (1-10, higher is more important)
            parent_goal_id: Optional parent goal UUID
            desired_deadline: Optional deadline

        Returns:
            Goal record
        """
        goal_id = uuid4()

        query = """
            INSERT INTO goals (id, user_id, title, description, priority, parent_goal_id, desired_deadline)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        """

        result = await self._db.fetch_row(
            query,
            goal_id,
            user_id,
            title,
            description,
            priority,
            parent_goal_id,
            desired_deadline,
        )

        logger.info(f"Created goal: {title} (priority: {priority})")
        return dict(result)

    async def get_pending_goals(self, user_id: UUID | None = None) -> list[dict[str, Any]]:
        """
        Get pending goals ordered by priority.

        Args:
            user_id: Optional user filter

        Returns:
            List of pending goals
        """
        if user_id:
            query = """
                SELECT * FROM goals
                WHERE status = 'pending' AND user_id = $1
                ORDER BY priority DESC, created_at ASC
            """
            results = await self._db.fetch_all(query, user_id)
        else:
            query = """
                SELECT * FROM goals
                WHERE status = 'pending'
                ORDER BY priority DESC, created_at ASC
            """
            results = await self._db.fetch_all(query)

        return [dict(row) for row in results]

    async def assign_goal_to_agent(
        self, goal_id: UUID, agent_id: UUID
    ) -> dict[str, Any]:
        """
        Assign a goal to an agent.

        Args:
            goal_id: Goal UUID
            agent_id: Agent UUID

        Returns:
            Task assignment record
        """
        assignment_id = uuid4()

        query = """
            INSERT INTO task_assignments (assignment_id, goal_id, agent_id, status)
            VALUES ($1, $2, $3, 'assigned')
            RETURNING *
        """

        result = await self._db.fetch_row(query, assignment_id, goal_id, agent_id)

        # Update goal status
        await self._db.execute_query(
            "UPDATE goals SET status = 'in_progress', updated_at = $1 WHERE id = $2",
            datetime.now(UTC),
            goal_id,
        )

        # Increment agent load
        await self._registry.increment_agent_load(agent_id)

        logger.info(f"Assigned goal {goal_id} to agent {agent_id}")
        return dict(result)

    async def auto_assign_goals(self) -> int:
        """
        Automatically assign pending goals to available agents.

        Returns:
            Number of goals assigned
        """
        pending_goals = await self.get_pending_goals()
        assigned_count = 0

        for goal in pending_goals:
            # Get available agents
            agents = await self._registry.get_available_agents()

            if not agents:
                logger.warning("No available agents to assign goals")
                break

            # Select best agent (highest trust score, lowest load)
            best_agent = agents[0]

            try:
                await self.assign_goal_to_agent(goal["id"], best_agent["agent_id"])
                assigned_count += 1
            except Exception as e:
                logger.error(f"Failed to assign goal {goal['id']}: {e}")

        return assigned_count

    async def complete_goal(
        self, goal_id: UUID, agent_id: UUID, result: dict[str, Any] | None = None
    ) -> None:
        """
        Mark a goal as completed.

        Args:
            goal_id: Goal UUID
            agent_id: Agent UUID
            result: Optional result data
        """
        # Update goal status
        await self._db.execute_query(
            "UPDATE goals SET status = 'completed', completed_at = $1, updated_at = $1 WHERE id = $2",
            datetime.now(UTC),
            goal_id,
        )

        # Update task assignment
        await self._db.execute_query(
            "UPDATE task_assignments SET status = 'completed', completed_at = $1, result = $2 WHERE goal_id = $3 AND agent_id = $4",
            datetime.now(UTC),
            result or {},
            goal_id,
            agent_id,
        )

        # Decrement agent load and boost trust
        await self._registry.decrement_agent_load(agent_id)
        await self._registry.update_trust_score(agent_id, success=True)

        logger.info(f"Completed goal {goal_id} by agent {agent_id}")

    async def fail_goal(self, goal_id: UUID, agent_id: UUID) -> None:
        """
        Mark a goal as failed.

        Args:
            goal_id: Goal UUID
            agent_id: Agent UUID
        """
        # Update goal status
        await self._db.execute_query(
            "UPDATE goals SET status = 'failed', updated_at = $1 WHERE id = $2",
            datetime.now(UTC),
            goal_id,
        )

        # Update task assignment
        await self._db.execute_query(
            "UPDATE task_assignments SET status = 'failed', completed_at = $1 WHERE goal_id = $2 AND agent_id = $3",
            datetime.now(UTC),
            goal_id,
            agent_id,
        )

        # Decrement agent load and penalize trust
        await self._registry.decrement_agent_load(agent_id)
        await self._registry.update_trust_score(agent_id, success=False)

        logger.warning(f"Failed goal {goal_id} by agent {agent_id}")

    async def get_goal(self, goal_id: UUID) -> dict[str, Any] | None:
        """Get goal by ID."""
        query = "SELECT * FROM goals WHERE id = $1"
        result = await self._db.fetch_row(query, goal_id)
        return dict(result) if result else None

    async def list_goals(self, user_id: UUID | None = None) -> list[dict[str, Any]]:
        """List all goals."""
        if user_id:
            query = "SELECT * FROM goals WHERE user_id = $1 ORDER BY priority DESC, created_at DESC"
            results = await self._db.fetch_all(query, user_id)
        else:
            query = "SELECT * FROM goals ORDER BY priority DESC, created_at DESC"
            results = await self._db.fetch_all(query)

        return [dict(row) for row in results]
