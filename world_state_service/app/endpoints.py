import logging
from datetime import UTC, datetime

from fastapi import HTTPException

from world_state_service.app.redis_client import RedisClient
from world_state_service.app.temporal_store import TemporalStore

logger = logging.getLogger(__name__)


class StateEndpoints:
    """REST endpoints for querying world state."""

    def __init__(self, temporal_store: TemporalStore, redis_client: RedisClient):
        self._store = temporal_store
        self._redis = redis_client

    async def get_current_state(self, entity_id: str, attribute: str | None = None) -> dict:
        """
        Get current state for an entity.

        Args:
            entity_id: The entity to query
            attribute: Optional attribute filter

        Returns:
            Current state records
        """
        # Check cache first
        cached = await self._redis.get_cached_state(entity_id, attribute)
        if cached:
            logger.debug(f"Cache hit for {entity_id}")
            return cached

        # Query database
        state = await self._store.get_current_state(entity_id, attribute)

        # Cache result
        await self._redis.cache_state(entity_id, state, attribute)

        return {"entity_id": entity_id, "state": state}

    async def get_state_at_time(
        self, entity_id: str, timestamp: str, attribute: str | None = None
    ) -> dict:
        """
        Get state for an entity at a specific point in time.

        Args:
            entity_id: The entity to query
            timestamp: ISO 8601 timestamp
            attribute: Optional attribute filter

        Returns:
            State records valid at the given timestamp
        """
        try:
            dt = datetime.fromisoformat(timestamp)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid timestamp format")

        state = await self._store.get_state_at_time(entity_id, dt, attribute)

        return {"entity_id": entity_id, "timestamp": timestamp, "state": state}

    async def get_entity_history(
        self, entity_id: str, attribute: str | None = None
    ) -> dict:
        """
        Get full history of state changes for an entity.

        Args:
            entity_id: The entity to query
            attribute: Optional attribute filter

        Returns:
            All state records for the entity
        """
        # This requires a different query that returns all historical records
        # For now, we'll implement a simple version
        conn = await self._store._db.get_connection()
        try:
            if attribute:
                query = """
                    SELECT entity_id, attribute, value, confidence, state_type,
                           valid_from, valid_until, source_event_ids, evidence_ids
                    FROM world_state
                    WHERE entity_id = $1 AND attribute = $2
                    ORDER BY valid_from DESC
                """
                results = await conn.fetch(query, entity_id, attribute)
            else:
                query = """
                    SELECT entity_id, attribute, value, confidence, state_type,
                           valid_from, valid_until, source_event_ids, evidence_ids
                    FROM world_state
                    WHERE entity_id = $1
                    ORDER BY valid_from DESC
                """
                results = await conn.fetch(query, entity_id)

            history = [dict(row) for row in results]
            return {"entity_id": entity_id, "history": history}

        finally:
            await self._store._db.release_connection(conn)
