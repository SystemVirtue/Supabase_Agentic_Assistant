import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from world_state_service.app.db_client import DatabaseClient
from world_state_service.app.endpoints import StateEndpoints
from world_state_service.app.redis_client import RedisClient
from world_state_service.app.temporal_store import TemporalStore

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    # Initialize clients
    db_client = DatabaseClient()
    await db_client.connect()

    redis_client = RedisClient()
    await redis_client.connect()

    temporal_store = TemporalStore(db_client)
    endpoints = StateEndpoints(temporal_store, redis_client)

    # Store in app state
    app.state.db_client = db_client
    app.state.redis_client = redis_client
    app.state.endpoints = endpoints

    logger.info("World State Service API started")

    try:
        yield
    finally:
        # Cleanup
        await redis_client.close()
        await db_client.close()
        logger.info("World State Service API stopped")


app = FastAPI(
    title="World State Service API",
    version="0.1.0",
    description="Time-travel API for querying temporal world state.",
    lifespan=lifespan,
)


def get_endpoints():
    """Dependency to get endpoints instance."""
    def _get(request):
        return request.app.state.endpoints
    return _get


@app.get("/health")
async def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/state/{entity_id}")
async def get_current_state(entity_id: str, attribute: str | None = None) -> dict:
    """Get current state for an entity."""
    endpoints = get_endpoints()
    return await endpoints.get_current_state(entity_id, attribute)


@app.get("/state/{entity_id}/at/{timestamp}")
async def get_state_at_time(
    entity_id: str, timestamp: str, attribute: str | None = None
) -> dict:
    """Get state for an entity at a specific point in time."""
    endpoints = get_endpoints()
    return await endpoints.get_state_at_time(entity_id, timestamp, attribute)


@app.get("/state/{entity_id}/history")
async def get_entity_history(entity_id: str, attribute: str | None = None) -> dict:
    """Get full history of state changes for an entity."""
    endpoints = get_endpoints()
    return await endpoints.get_entity_history(entity_id, attribute)
