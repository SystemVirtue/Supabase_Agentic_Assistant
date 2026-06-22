import logging
import math
from datetime import UTC, datetime, timedelta

from world_state_service.app.config import get_settings
from world_state_service.app.db_client import DatabaseClient

logger = logging.getLogger(__name__)


class ConflictResolver:
    """Implements trust score calculation, decay algorithms, and conflict detection."""

    def __init__(self, db_client: DatabaseClient):
        self._settings = get_settings()
        self._db = db_client

    def calculate_decay(self, confidence: float, time_delta_seconds: float) -> float:
        """Apply time-based decay to confidence."""
        lambda_decay = self._settings.belief_decay_lambda
        decayed_confidence = confidence * math.exp(-lambda_decay * time_delta_seconds)
        return max(0.0, decayed_confidence)

    def calculate_trust_score(
        self,
        confidence: float,
        source_weight: float,
        recency_factor: float,
        evidence_count: int,
    ) -> float:
        """Calculate trust score for a belief."""
        evidence_factor = min(1.0, evidence_count / 5.0)  # Cap at 5 evidence items
        trust = confidence * source_weight * recency_factor * evidence_factor
        return min(1.0, trust)

    def calculate_recency_factor(self, timestamp_ms: int) -> float:
        """Calculate recency factor based on event age."""
        now = datetime.now(UTC)
        event_time = datetime.fromtimestamp(timestamp_ms / 1000, UTC)
        age_hours = (now - event_time).total_seconds() / 3600

        # Recency decays over 24 hours
        recency = math.exp(-age_hours / 24.0)
        return max(0.1, recency)  # Minimum 0.1

    async def resolve_belief(
        self,
        entity_id: str,
        attribute: str,
        value,
        confidence: float,
        source_event_id: str,
        evidence_ids: list[str],
        update_type: str,
        timestamp_ms: int,
    ) -> tuple[bool, dict | None]:
        """
        Resolve belief conflicts and determine if conflict should be flagged.

        Returns:
            tuple (has_conflict, conflict_details)
        """
        # Get current belief
        current_belief = await self._db.get_current_belief(entity_id, attribute)

        if current_belief is None:
            # No existing belief - no conflict
            return False, None

        # Handle CORRECTION update type
        if update_type == "CORRECTION":
            logger.info(f"CORRECTION override for {entity_id}.{attribute}")
            return False, None

        # Calculate trust score for new belief
        source_weight = 1.0  # Default, could be enhanced with sensor lookup
        recency_factor = self.calculate_recency_factor(timestamp_ms)
        new_trust = self.calculate_trust_score(
            confidence, source_weight, recency_factor, len(evidence_ids)
        )

        # Calculate trust score for existing belief
        current_value = current_belief["value"]
        current_confidence = float(current_belief["confidence"])
        current_evidence_count = len(current_belief["evidence_ids"])

        # Apply decay to current belief
        # For simplicity, assume current belief was created 1 hour ago
        # In production, track actual creation timestamp
        decayed_confidence = self.calculate_decay(current_confidence, 3600)
        current_trust = self.calculate_trust_score(
            decayed_confidence, source_weight, 0.9, current_evidence_count
        )

        # Check for value conflict
        values_differ = str(current_value) != str(value)

        if values_differ and current_trust > self._settings.conflict_detection_threshold:
            # Conflict detected
            conflict_details = {
                "entity_id": entity_id,
                "attribute": attribute,
                "current_value": current_value,
                "current_trust": current_trust,
                "new_value": value,
                "new_trust": new_trust,
            }
            logger.warning(f"Conflict detected: {conflict_details}")
            return True, conflict_details

        return False, None

    async def should_promote_to_fact(
        self,
        entity_id: str,
        attribute: str,
        confidence: float,
        evidence_ids: list[str],
    ) -> bool:
        """
        Determine if a high-confidence belief should be promoted to a fact.

        A belief becomes a fact if:
        1. Confidence > threshold
        2. Has sufficient evidence
        3. Has been stable for the maturation period
        """
        if confidence < self._settings.fact_promotion_threshold:
            return False

        if len(evidence_ids) < 2:
            return False

        # Check if belief has been stable for maturation period
        # In production, track belief creation time and check duration
        # For now, assume sufficient evidence and confidence is enough
        return True
