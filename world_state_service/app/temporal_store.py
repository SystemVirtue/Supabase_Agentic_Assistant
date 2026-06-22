import json
import logging
from datetime import UTC, datetime
from typing import Any

import asyncpg

from world_state_service.app.db_client import DatabaseClient

logger = logging.getLogger(__name__)


class TemporalStore:
    """Handles temporal materialization with safe INSERT/UPDATE logic."""

    def __init__(self, db_client: DatabaseClient):
        self._db = db_client

    async def insert_belief(
        self,
        entity_id: str,
        attribute: str,
        value: Any,
        confidence: float,
        source_event_id: str,
        evidence_ids: list[str],
        update_type: str = "INITIAL",
    ) -> None:
        """
        Insert a new belief into the world_state table.

        Uses advisory lock to prevent race conditions during temporal updates.
        """
        conn = await self._db.get_connection()
        try:
            # Acquire advisory lock for this entity/attribute combination
            lock_id = hash(f"{entity_id}:{attribute}")
            await conn.execute(f"SELECT pg_advisory_lock({lock_id})")

            try:
                now = datetime.now(UTC)

                if update_type == "CORRECTION":
                    # For corrections, invalidate all existing beliefs
                    await self._invalidate_existing_beliefs(conn, entity_id, attribute, now)
                else:
                    # For normal updates, only invalidate if there's a current belief
                    await self._invalidate_current_belief(conn, entity_id, attribute, now)

                # Insert new belief
                query = """
                    INSERT INTO world_state (
                        entity_id, attribute, value, confidence, state_type,
                        valid_from, valid_until, source_event_ids, evidence_ids, updated_at
                    ) VALUES ($1, $2, $3, $4, 'belief', $5, NULL, $6, $7, $8)
                """
                await conn.execute(
                    query,
                    entity_id,
                    attribute,
                    json.dumps(value) if not isinstance(value, str) else value,
                    confidence,
                    now,
                    [source_event_id],
                    evidence_ids,
                    now,
                )

                logger.info(f"Inserted belief: {entity_id}.{attribute}")

            finally:
                # Release advisory lock
                await conn.execute(f"SELECT pg_advisory_unlock({lock_id})")

        finally:
            await self._db.release_connection(conn)

    async def _invalidate_current_belief(
        self, conn: asyncpg.Connection, entity_id: str, attribute: str, now: datetime
    ) -> None:
        """Set valid_until on current belief to now."""
        query = """
            UPDATE world_state
            SET valid_until = $1, updated_at = $1
            WHERE entity_id = $2 AND attribute = $3
              AND state_type = 'belief'
              AND valid_until IS NULL
        """
        result = await conn.execute(query, now, entity_id, attribute)
        logger.debug(f"Invalidated current belief: {result}")

    async def _invalidate_existing_beliefs(
        self, conn: asyncpg.Connection, entity_id: str, attribute: str, now: datetime
    ) -> None:
        """Set valid_until on all beliefs (for corrections)."""
        query = """
            UPDATE world_state
            SET valid_until = $1, updated_at = $1
            WHERE entity_id = $2 AND attribute = $3
              AND state_type = 'belief'
              AND valid_until IS NULL
        """
        result = await conn.execute(query, now, entity_id, attribute)
        logger.debug(f"Invalidated all beliefs for correction: {result}")

    async def insert_fact(
        self,
        entity_id: str,
        attribute: str,
        value: Any,
        source_event_id: str,
        evidence_ids: list[str],
    ) -> None:
        """
        Insert a new fact into the world_state table.

        Facts are immutable - they cannot be overwritten, only superseded by new facts.
        """
        conn = await self._db.get_connection()
        try:
            # Acquire advisory lock
            lock_id = hash(f"{entity_id}:{attribute}")
            await conn.execute(f"SELECT pg_advisory_lock({lock_id})")

            try:
                now = datetime.now(UTC)

                # Invalidate any existing fact
                await self._invalidate_current_fact(conn, entity_id, attribute, now)

                # Insert new fact
                query = """
                    INSERT INTO world_state (
                        entity_id, attribute, value, confidence, state_type,
                        valid_from, valid_until, source_event_ids, evidence_ids, updated_at
                    ) VALUES ($1, $2, $3, 1.0, 'fact', $4, NULL, $5, $6, $7)
                """
                await conn.execute(
                    query,
                    entity_id,
                    attribute,
                    json.dumps(value) if not isinstance(value, str) else value,
                    now,
                    [source_event_id],
                    evidence_ids,
                    now,
                )

                logger.info(f"Inserted fact: {entity_id}.{attribute}")

            finally:
                await conn.execute(f"SELECT pg_advisory_unlock({lock_id})")

        finally:
            await self._db.release_connection(conn)

    async def _invalidate_current_fact(
        self, conn: asyncpg.Connection, entity_id: str, attribute: str, now: datetime
    ) -> None:
        """Set valid_until on current fact to now."""
        query = """
            UPDATE world_state
            SET valid_until = $1, updated_at = $1
            WHERE entity_id = $2 AND attribute = $3
              AND state_type = 'fact'
              AND valid_until IS NULL
        """
        result = await conn.execute(query, now, entity_id, attribute)
        logger.debug(f"Invalidated current fact: {result}")

    async def get_state_at_time(
        self, entity_id: str, timestamp: datetime, attribute: str | None = None
    ) -> list[dict]:
        """
        Query world state as of a specific timestamp.

        Args:
            entity_id: The entity to query
            timestamp: The point in time to query
            attribute: Optional attribute filter

        Returns:
            List of state records valid at the given timestamp
        """
        conn = await self._db.get_connection()
        try:
            if attribute:
                query = """
                    SELECT entity_id, attribute, value, confidence, state_type,
                           valid_from, valid_until, source_event_ids, evidence_ids
                    FROM world_state
                    WHERE entity_id = $1
                      AND attribute = $2
                      AND valid_from <= $3
                      AND (valid_until IS NULL OR valid_until > $3)
                    ORDER BY attribute
                """
                results = await conn.fetch(query, entity_id, attribute, timestamp)
            else:
                query = """
                    SELECT entity_id, attribute, value, confidence, state_type,
                           valid_from, valid_until, source_event_ids, evidence_ids
                    FROM world_state
                    WHERE entity_id = $1
                      AND valid_from <= $2
                      AND (valid_until IS NULL OR valid_until > $2)
                    ORDER BY attribute
                """
                results = await conn.fetch(query, entity_id, timestamp)

            return [dict(row) for row in results]

        finally:
            await self._db.release_connection(conn)

    async def get_current_state(
        self, entity_id: str, attribute: str | None = None
    ) -> list[dict]:
        """
        Query current world state for an entity.

        Args:
            entity_id: The entity to query
            attribute: Optional attribute filter

        Returns:
            List of current state records
        """
        now = datetime.now(UTC)
        return await self.get_state_at_time(entity_id, now, attribute)
