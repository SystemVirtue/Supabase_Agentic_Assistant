import logging
from datetime import UTC, datetime, timedelta

import asyncpg

from cognitive_engine.app.db_client import CognitiveDBClient

logger = logging.getLogger(__name__)


class MemoryTiering:
    """
    Converts sensor data and episodes into pgvector embeddings for semantic search.
    Runs as a CRON job (hourly/nightly).
    """

    def __init__(self, db_client: CognitiveDBClient):
        self._db = db_client

    async def get_recent_sensor_data(self, hours: int = 24) -> list[dict]:
        """
        Fetch recent sensor data that hasn't been embedded yet.

        Args:
            hours: Lookback period in hours

        Returns:
            List of sensor data records
        """
        cutoff_time = datetime.now(UTC) - timedelta(hours=hours)

        query = """
            SELECT sensor_id, name, sensor_type, location, config, last_seen_at
            FROM sensors
            WHERE last_seen_at > $1
            ORDER BY last_seen_at DESC
        """

        results = await self._db.fetch_all(query, cutoff_time)
        return [dict(row) for row in results]

    async def get_recent_evidence(self, hours: int = 24) -> list[dict]:
        """
        Fetch recent evidence records that haven't been embedded yet.

        Args:
            hours: Lookback period in hours

        Returns:
            List of evidence records
        """
        cutoff_time = datetime.now(UTC) - timedelta(hours=hours)

        query = """
            SELECT evidence_id, source_event_id, inference_method,
                   entity_id, attribute, raw_value, confidence, observed_at
            FROM evidence
            WHERE observed_at > $1
            ORDER BY observed_at DESC
        """

        results = await self._db.fetch_all(query, cutoff_time)
        return [dict(row) for row in results]

    async def get_recent_world_state_changes(self, hours: int = 24) -> list[dict]:
        """
        Fetch recent world state changes for episodic memory.

        Args:
            hours: Lookback period in hours

        Returns:
            List of world state change records
        """
        cutoff_time = datetime.now(UTC) - timedelta(hours=hours)

        query = """
            SELECT entity_id, attribute, value, confidence, state_type,
                   valid_from, valid_until, source_event_ids
            FROM world_state
            WHERE updated_at > $1
            ORDER BY updated_at DESC
        """

        results = await self._db.fetch_all(query, cutoff_time)
        return [dict(row) for row in results]

    async def generate_embedding(self, text: str) -> list[float]:
        """
        Generate embedding for text using LiteLLM.

        Args:
            text: Text to embed

        Returns:
            Embedding vector
        """
        from cognitive_engine.app.litellm_router import LiteLLMRouter

        router = LiteLLMRouter()
        return await router.embed(text)

    async def create_episodes_table(self) -> None:
        """Create episodes table if it doesn't exist."""
        query = """
            CREATE TABLE IF NOT EXISTS episodes (
                episode_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                entity_id UUID,
                summary TEXT NOT NULL,
                embedding vector(1536),
                start_time TIMESTAMPTZ NOT NULL,
                end_time TIMESTAMPTZ,
                metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );

            CREATE INDEX IF NOT EXISTS episodes_entity_idx ON episodes(entity_id);
            CREATE INDEX IF NOT EXISTS episodes_embedding_idx ON episodes USING ivfflat (embedding vector_cosine_ops);
            CREATE INDEX IF NOT EXISTS episodes_time_idx ON episodes(start_time DESC);
        """

        await self._db.execute_query(query)
        logger.info("Episodes table created/verified")

    async def create_episode_from_sensor_data(self, sensor_data: dict) -> None:
        """
        Create an episode from sensor data.

        Args:
            sensor_data: Sensor data record
        """
        # Generate summary text
        summary = f"Sensor {sensor_data['name']} of type {sensor_data['sensor_type']} "
        if sensor_data.get('location'):
            summary += f"at {sensor_data['location']} "
        summary += f"last seen at {sensor_data['last_seen_at']}"

        # Generate embedding
        embedding = await self.generate_embedding(summary)

        # Insert episode
        query = """
            INSERT INTO episodes (entity_id, summary, embedding, start_time, metadata)
            VALUES ($1, $2, $3, $4, $5)
        """

        await self._db.execute_query(
            query,
            sensor_data['sensor_id'],
            summary,
            embedding,
            sensor_data['last_seen_at'],
            {'sensor_type': sensor_data['sensor_type'], 'location': sensor_data.get('location')},
        )

        logger.debug(f"Created episode from sensor {sensor_data['sensor_id']}")

    async def create_episode_from_evidence(self, evidence: dict) -> None:
        """
        Create an episode from evidence data.

        Args:
            evidence: Evidence record
        """
        # Generate summary text
        summary = f"Evidence for entity {evidence['entity_id']} attribute {evidence['attribute']} "
        summary += f"with value {evidence['raw_value']} "
        summary += f"confidence {evidence['confidence']} "
        summary += f"observed at {evidence['observed_at']}"

        # Generate embedding
        embedding = await self.generate_embedding(summary)

        # Insert episode
        query = """
            INSERT INTO episodes (entity_id, summary, embedding, start_time, metadata)
            VALUES ($1, $2, $3, $4, $5)
        """

        await self._db.execute_query(
            query,
            evidence['entity_id'],
            summary,
            embedding,
            evidence['observed_at'],
            {
                'inference_method': evidence['inference_method'],
                'attribute': evidence['attribute'],
                'confidence': evidence['confidence'],
            },
        )

        logger.debug(f"Created episode from evidence {evidence['evidence_id']}")

    async def run_tiering_job(self, hours: int = 24) -> dict:
        """
        Run the memory tiering job to convert recent data into episodes.

        Args:
            hours: Lookback period in hours

        Returns:
            Summary statistics
        """
        logger.info(f"Starting memory tiering job for last {hours} hours")

        # Ensure episodes table exists
        await self.create_episodes_table()

        # Fetch recent data
        sensor_data = await self.get_recent_sensor_data(hours)
        evidence_data = await self.get_recent_evidence(hours)
        world_state_changes = await self.get_recent_world_state_changes(hours)

        stats = {
            'sensor_episodes': 0,
            'evidence_episodes': 0,
            'total_episodes': 0,
        }

        # Create episodes from sensor data
        for sensor in sensor_data:
            try:
                await self.create_episode_from_sensor_data(sensor)
                stats['sensor_episodes'] += 1
            except Exception as e:
                logger.error(f"Error creating episode from sensor {sensor['sensor_id']}: {e}")

        # Create episodes from evidence
        for evidence in evidence_data:
            try:
                await self.create_episode_from_evidence(evidence)
                stats['evidence_episodes'] += 1
            except Exception as e:
                logger.error(f"Error creating episode from evidence {evidence['evidence_id']}: {e}")

        stats['total_episodes'] = stats['sensor_episodes'] + stats['evidence_episodes']

        logger.info(f"Memory tiering job completed: {stats}")
        return stats
