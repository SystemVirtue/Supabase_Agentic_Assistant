import logging

import asyncpg

from agent_lifecycle_manager.app.config import get_settings

logger = logging.getLogger(__name__)


class ALMDBClient:
    """Database client for Agent Lifecycle Manager."""

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
