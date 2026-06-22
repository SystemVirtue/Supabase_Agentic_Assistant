import logging

import asyncpg
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from cognitive_engine.app.config import get_settings

logger = logging.getLogger(__name__)


class CognitiveDBClient:
    """Database client for cognitive engine with LangGraph checkpointer support."""

    def __init__(self):
        self._settings = get_settings()
        self._pool = None
        self._checkpointer = None

    async def connect(self) -> None:
        """Create connection pool and initialize LangGraph checkpointer."""
        self._pool = await asyncpg.create_pool(self._settings.database_url)
        logger.info("Connected to PostgreSQL")

        # Initialize LangGraph AsyncPostgresSaver
        self._checkpointer = AsyncPostgresSaver.from_conn_string(self._settings.database_url)
        await self._checkpointer.setup()
        logger.info("LangGraph AsyncPostgresSaver initialized")

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

    def get_checkpointer(self) -> AsyncPostgresSaver:
        """Get the LangGraph checkpointer."""
        if self._checkpointer is None:
            raise RuntimeError("Checkpointer is not initialized")
        return self._checkpointer

    async def fetch_state_history(self, thread_id: str) -> list[dict]:
        """Fetch state history for a LangGraph thread."""
        if self._checkpointer is None:
            raise RuntimeError("Checkpointer is not initialized")

        config = {"configurable": {"thread_id": thread_id}}
        history = await self._checkpointer.aget_tuple(config)

        if history is None:
            return []

        return [history.checkpoint]

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
