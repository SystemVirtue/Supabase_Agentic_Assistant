import json
import logging

import redis.asyncio as redis

from world_state_service.app.config import get_settings

logger = logging.getLogger(__name__)


class RedisClient:
    """Redis client for caching world state queries."""

    def __init__(self):
        self._settings = get_settings()
        self._client = None

    async def connect(self) -> None:
        """Connect to Redis."""
        self._client = await redis.from_url(self._settings.redis_url)
        logger.info("Connected to Redis")

    async def close(self) -> None:
        """Close Redis connection."""
        if self._client:
            await self._client.close()
            self._client = None
            logger.info("Redis connection closed")

    def _make_cache_key(self, entity_id: str, attribute: str | None = None) -> str:
        """Generate cache key for state query."""
        if attribute:
            return f"state:{entity_id}:{attribute}"
        return f"state:{entity_id}"

    async def get_cached_state(
        self, entity_id: str, attribute: str | None = None
    ) -> dict | None:
        """Get cached state for entity/attribute."""
        if self._client is None:
            return None

        key = self._make_cache_key(entity_id, attribute)
        try:
            cached = await self._client.get(key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            logger.error(f"Error getting cached state: {e}")
        return None

    async def cache_state(
        self, entity_id: str, state: list[dict], attribute: str | None = None, ttl: int = 300
    ) -> None:
        """Cache state for entity/attribute."""
        if self._client is None:
            return

        key = self._make_cache_key(entity_id, attribute)
        try:
            await self._client.setex(key, ttl, json.dumps(state))
            logger.debug(f"Cached state for {key}")
        except Exception as e:
            logger.error(f"Error caching state: {e}")

    async def invalidate_cache(self, entity_id: str, attribute: str | None = None) -> None:
        """Invalidate cache for entity/attribute."""
        if self._client is None:
            return

        key = self._make_cache_key(entity_id, attribute)
        try:
            await self._client.delete(key)
            logger.debug(f"Invalidated cache for {key}")
        except Exception as e:
            logger.error(f"Error invalidating cache: {e}")
