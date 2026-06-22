import asyncio
import logging
import signal
import sys

from cognitive_engine.app.db_client import CognitiveDBClient
from cognitive_engine.app.langgraph_agent import LangGraphAgent
from cognitive_engine.app.meta_cognitive_controller import MetaCognitiveController
from cognitive_engine.app.memory_tiering import MemoryTiering

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class CognitiveEngineService:
    def __init__(self):
        self._db_client = CognitiveDBClient()
        self._mcc = MetaCognitiveController()
        self._agent = None
        self._memory_tiering = None
        self._shutdown_event = asyncio.Event()

    async def start(self) -> None:
        """Start the cognitive engine service."""
        logger.info("Starting Cognitive Engine Service...")

        # Connect to database
        await self._db_client.connect()

        # Initialize LangGraph agent
        self._agent = LangGraphAgent(self._db_client, self._mcc)
        self._agent.build_graph()

        # Initialize memory tiering
        self._memory_tiering = MemoryTiering(self._db_client)

        logger.info("Cognitive Engine Service started successfully")

    async def stop(self) -> None:
        """Stop the cognitive engine service gracefully."""
        logger.info("Stopping Cognitive Engine Service...")
        await self._db_client.close()
        logger.info("Cognitive Engine Service stopped")

    async def run_memory_tiering(self, hours: int = 24) -> dict:
        """Run the memory tiering job."""
        if self._memory_tiering is None:
            raise RuntimeError("Memory tiering not initialized")
        return await self._memory_tiering.run_tiering_job(hours)

    async def process_query(self, query: str, thread_id: str) -> dict:
        """Process a query through the LangGraph agent."""
        if self._agent is None:
            raise RuntimeError("Agent not initialized")
        return await self._agent.invoke(query, thread_id)

    async def run(self) -> None:
        """Run the service until shutdown signal."""
        await self.start()

        # Setup signal handlers
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, self._shutdown_event.set)

        # Wait for shutdown signal
        await self._shutdown_event.wait()

        # Graceful shutdown
        await self.stop()


async def main() -> None:
    service = CognitiveEngineService()
    try:
        await service.run()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
