import json
import logging

from gateway.app.models import EventEnvelope

from world_state_service.app.conflict_resolver import ConflictResolver
from world_state_service.app.db_client import DatabaseClient
from world_state_service.app.temporal_store import TemporalStore

logger = logging.getLogger(__name__)


class EventProcessor:
    """Processes incoming events and routes them to appropriate handlers."""

    def __init__(self, db_client: DatabaseClient):
        self._db = db_client
        self._temporal_store = TemporalStore(db_client)
        self._conflict_resolver = ConflictResolver(db_client)
        self._handlers = {
            "perception.v1.sensor.observed": self._handle_sensor_observed,
            "cognition.v1.belief.updated": self._handle_belief_updated,
        }

    async def process(self, envelope: EventEnvelope) -> None:
        """Route event to appropriate handler based on event type."""
        handler = self._handlers.get(envelope.event_type)

        if handler:
            try:
                await handler(envelope)
                logger.info(f"Processed event: {envelope.event_type}")
            except Exception as e:
                logger.error(f"Error handling event {envelope.event_type}: {e}")
                raise
        else:
            logger.warning(f"No handler for event type: {envelope.event_type}")

    async def _handle_sensor_observed(self, envelope: EventEnvelope) -> None:
        """Handle sensor observation events - create initial beliefs."""
        try:
            payload = envelope.payload
            entity_id = payload.get("sensor_id", envelope.entity_id)
            observation = payload.get("observation", {})

            # Extract key attributes from observation
            for attr, value in observation.items():
                # Create initial belief with moderate confidence
                await self._temporal_store.insert_belief(
                    entity_id=entity_id,
                    attribute=attr,
                    value=value,
                    confidence=0.7,
                    source_event_id=envelope.event_id,
                    evidence_ids=[envelope.event_id],
                    update_type="INITIAL",
                )

            logger.info(f"Created beliefs from sensor observation: {entity_id}")

        except Exception as e:
            logger.error(f"Error handling sensor observation: {e}")
            raise

    async def _handle_belief_updated(self, envelope: EventEnvelope) -> None:
        """Handle belief update events - conflict resolution and fact promotion."""
        try:
            payload = envelope.payload

            entity_id = payload.get("entity_id")
            attribute = payload.get("attribute")
            value = payload.get("value")
            confidence = payload.get("confidence", 0.5)
            update_type = payload.get("update_type", "UPDATE")
            evidence_ids = payload.get("evidence_ids", [])

            # Resolve conflicts
            has_conflict, conflict_details = await self._conflict_resolver.resolve_belief(
                entity_id=entity_id,
                attribute=attribute,
                value=value,
                confidence=confidence,
                source_event_id=envelope.event_id,
                evidence_ids=evidence_ids,
                update_type=update_type,
                timestamp_ms=envelope.timestamp,
            )

            if has_conflict:
                logger.warning(f"Conflict detected: {conflict_details}")
                # TODO: Emit ConflictDetected event to NATS

            # Insert the belief
            await self._temporal_store.insert_belief(
                entity_id=entity_id,
                attribute=attribute,
                value=value,
                confidence=confidence,
                source_event_id=envelope.event_id,
                evidence_ids=evidence_ids,
                update_type=update_type,
            )

            # Check if should promote to fact
            should_promote = await self._conflict_resolver.should_promote_to_fact(
                entity_id=entity_id,
                attribute=attribute,
                confidence=confidence,
                evidence_ids=evidence_ids,
            )

            if should_promote:
                await self._temporal_store.insert_fact(
                    entity_id=entity_id,
                    attribute=attribute,
                    value=value,
                    source_event_id=envelope.event_id,
                    evidence_ids=evidence_ids,
                )
                logger.info(f"Promoted to fact: {entity_id}.{attribute}")
                # TODO: Emit FactAsserted event to NATS

        except Exception as e:
            logger.error(f"Error handling belief update: {e}")
            raise
