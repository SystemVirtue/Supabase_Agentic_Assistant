import logging
from datetime import UTC, datetime

import asyncpg

from world_state_service.app.config import get_settings

logger = logging.getLogger(__name__)


class DatabaseClient:
    """PostgreSQL client for world state operations."""

    def __init__(self):
        self._settings = get_settings()
        self._pool = None

    async def connect(self) -> None:
        """Create connection pool."""
        self._pool = await asyncpg.create_pool(self._settings.database_url)
        logger.info("Connected to PostgreSQL")

    async def close(self) -> None:
        """Close connection pool."""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("PostgreSQL connection closed")

    async def get_connection(self) -> asyncpg.Connection:
        """Get a connection from the pool."""
        if self._pool is None:
            raise RuntimeError("Database pool is not initialized")
        return await self._pool.acquire()

    async def release_connection(self, conn: asyncpg.Connection) -> None:
        """Release a connection back to the pool."""
        if self._pool:
            await self._pool.release(conn)

    async def execute_query(self, query: str, *args) -> str:
        """Execute a query and return the result."""
        conn = await self.get_connection()
        try:
            result = await conn.execute(query, *args)
            return result
        finally:
            await self.release_connection(conn)

    async def fetch_row(self, query: str, *args):
        """Fetch a single row from the database."""
        conn = await self.get_connection()
        try:
            result = await conn.fetchrow(query, *args)
            return result
        finally:
            await self.release_connection(conn)

    async def fetch_all(self, query: str, *args):
        """Fetch all rows from the database."""
        conn = await self.get_connection()
        try:
            result = await conn.fetch(query, *args)
            return result
        finally:
            await self.release_connection(conn)

    async def get_sensor_trust_weight(self, sensor_id: str) -> float:
        """Get trust weight for a sensor."""
        query = "SELECT trust_weight FROM sensors WHERE sensor_id = $1 AND active = true"
        result = await self.fetch_row(query, sensor_id)
        if result:
            return float(result["trust_weight"])
        return 1.0  # Default trust weight

    async def get_current_belief(self, entity_id: str, attribute: str) -> dict | None:
        """Get current belief for an entity attribute."""
        query = """
            SELECT entity_id, attribute, value, confidence, source_event_ids, evidence_ids
            FROM world_state
            WHERE entity_id = $1 AND attribute = $2 AND state_type = 'belief' AND valid_until IS NULL
        """
        result = await self.fetch_row(query, entity_id, attribute)
        if result:
            return dict(result)
        return None

    async def get_current_fact(self, entity_id: str, attribute: str) -> dict | None:
        """Get current fact for an entity attribute."""
        query = """
            SELECT entity_id, attribute, value, source_event_ids, evidence_ids
            FROM world_state
            WHERE entity_id = $1 AND attribute = $2 AND state_type = 'fact' AND valid_until IS NULL
        """
        result = await self.fetch_row(query, entity_id, attribute)
        if result:
            return dict(result)
        return None
