import asyncio
import logging
import signal
import sys

from world_state_service.app.config import get_settings
from world_state_service.app.db_client import DatabaseClient
from world_state_service.app.event_processor import EventProcessor
from world_state_service.app.nats_subscriber import EventConsumer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class WorldStateService:
    def __init__(self):
        self._settings = get_settings()
        self._db_client = DatabaseClient()
        self._processor = EventProcessor(self._db_client)
        self._consumer = EventConsumer(processor_callback=self._processor.process)
        self._shutdown_event = asyncio.Event()

    async def start(self) -> None:
        """Start the world state service worker."""
        logger.info("Starting World State Service...")

        # Connect to database
        await self._db_client.connect()

        # Connect to NATS
        await self._consumer.connect()

        # Subscribe to event streams
        await self._consumer.subscribe()

        logger.info("World State Service started successfully")

    async def stop(self) -> None:
        """Stop the world state service worker gracefully."""
        logger.info("Stopping World State Service...")
        await self._consumer.close()
        await self._db_client.close()
        logger.info("World State Service stopped")

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
    service = WorldStateService()
    try:
        await service.run()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
