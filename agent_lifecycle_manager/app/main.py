import asyncio
import logging
import signal
import sys
from uuid import UUID, uuid4

from agent_lifecycle_manager.agent_registry import AgentRegistry
from agent_lifecycle_manager.app.config import get_settings
from agent_lifecycle_manager.app.db_client import ALMDBClient
from agent_lifecycle_manager.app.goal_manager import GoalManager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class AgentLifecycleManager:
    """Manages agent registration, goal assignment, and task allocation."""

    def __init__(self):
        self._settings = get_settings()
        self._db_client = ALMDBClient()
        self._agent_registry = AgentRegistry(self._db_client)
        self._goal_manager = GoalManager(self._db_client, self._agent_registry)
        self._shutdown_event = asyncio.Event()

    async def start(self) -> None:
        """Start the ALM service."""
        logger.info("Starting Agent Lifecycle Manager...")

        # Connect to database
        await self._db_client.connect()

        logger.info("Agent Lifecycle Manager started successfully")

    async def stop(self) -> None:
        """Stop the ALM service gracefully."""
        logger.info("Stopping Agent Lifecycle Manager...")
        await self._db_client.close()
        logger.info("Agent Lifecycle Manager stopped")

    async def heartbeat_monitor_loop(self) -> None:
        """Monitor agent heartbeats and deactivate stale agents."""
        while not self._shutdown_event.is_set():
            try:
                deactivated = await self._agent_registry.deactivate_stale_agents()
                if deactivated > 0:
                    logger.info(f"Deactivated {deactivated} stale agents")
            except Exception as e:
                logger.error(f"Error in heartbeat monitor: {e}")

            await asyncio.sleep(self._settings.agent_heartbeat_interval)

    async def task_allocation_loop(self) -> None:
        """Automatically assign pending goals to available agents."""
        while not self._shutdown_event.is_set():
            try:
                assigned = await self._goal_manager.auto_assign_goals()
                if assigned > 0:
                    logger.info(f"Auto-assigned {assigned} pending goals")
            except Exception as e:
                logger.error(f"Error in task allocation: {e}")

            await asyncio.sleep(self._settings.task_allocation_interval)

    async def run(self) -> None:
        """Run the service until shutdown signal."""
        await self.start()

        # Setup signal handlers
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, self._shutdown_event.set)

        # Create tasks for monitoring loops
        heartbeat_task = asyncio.create_task(self.heartbeat_monitor_loop())
        allocation_task = asyncio.create_task(self.task_allocation_loop())

        # Wait for shutdown signal
        await self._shutdown_event.wait()

        # Cancel tasks
        heartbeat_task.cancel()
        allocation_task.cancel()

        # Graceful shutdown
        await self.stop()


async def main() -> None:
    service = AgentLifecycleManager()
    try:
        await service.run()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
