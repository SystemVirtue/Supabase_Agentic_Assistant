import math
from datetime import datetime

import pytest

from world_state_service.app.conflict_resolver import ConflictResolver
from world_state_service.app.db_client import DatabaseClient


class MockDatabaseClient:
    """Mock database client for testing."""

    async def get_current_belief(self, entity_id: str, attribute: str) -> dict | None:
        return None


@pytest.fixture
def mock_db():
    return MockDatabaseClient()


@pytest.fixture
def resolver(mock_db):
    return ConflictResolver(mock_db)


class TestConflictResolver:
    def test_calculate_decay(self, resolver):
        """Test confidence decay over time."""
        initial_confidence = 0.9
        time_delta = 3600  # 1 hour

        decayed = resolver.calculate_decay(initial_confidence, time_delta)

        # Decay should reduce confidence
        assert decayed < initial_confidence
        assert decayed >= 0.0

    def test_calculate_decay_zero_time(self, resolver):
        """Test that zero time delta doesn't decay confidence."""
        initial_confidence = 0.9
        decayed = resolver.calculate_decay(initial_confidence, 0)

        assert decayed == initial_confidence

    def test_calculate_trust_score(self, resolver):
        """Test trust score calculation."""
        confidence = 0.8
        source_weight = 1.0
        recency_factor = 0.9
        evidence_count = 3

        trust = resolver.calculate_trust_score(
            confidence, source_weight, recency_factor, evidence_count
        )

        # Trust should be product of all factors (capped at 1.0)
        expected = confidence * source_weight * recency_factor * min(1.0, evidence_count / 5.0)
        assert trust == expected
        assert trust <= 1.0

    def test_calculate_trust_score_capped(self, resolver):
        """Test that trust score is capped at 1.0."""
        trust = resolver.calculate_trust_score(1.0, 1.0, 1.0, 10)
        assert trust == 1.0

    def test_calculate_recency_factor(self, resolver):
        """Test recency factor calculation."""
        # Recent event should have high recency
        recent_timestamp = int((datetime.now().timestamp() - 60) * 1000)  # 1 minute ago
        recent_factor = resolver.calculate_recency_factor(recent_timestamp)
        assert recent_factor > 0.9

        # Old event should have low recency
        old_timestamp = int((datetime.now().timestamp() - 86400 * 2) * 1000)  # 2 days ago
        old_factor = resolver.calculate_recency_factor(old_timestamp)
        assert old_factor < recent_factor
        assert old_factor >= 0.1

    @pytest.mark.asyncio
    async def test_resolve_belief_no_existing(self, resolver):
        """Test belief resolution when no existing belief exists."""
        has_conflict, details = await resolver.resolve_belief(
            entity_id="entity-1",
            attribute="color",
            value="red",
            confidence=0.8,
            source_event_id="event-1",
            evidence_ids=["ev-1"],
            update_type="UPDATE",
            timestamp_ms=int(datetime.now().timestamp() * 1000),
        )

        assert has_conflict is False
        assert details is None

    @pytest.mark.asyncio
    async def test_resolve_belief_correction(self, resolver):
        """Test that CORRECTION update type doesn't trigger conflict."""
        has_conflict, details = await resolver.resolve_belief(
            entity_id="entity-1",
            attribute="color",
            value="blue",
            confidence=0.8,
            source_event_id="event-2",
            evidence_ids=["ev-2"],
            update_type="CORRECTION",
            timestamp_ms=int(datetime.now().timestamp() * 1000),
        )

        assert has_conflict is False
        assert details is None

    @pytest.mark.asyncio
    async def test_should_promote_to_fact_low_confidence(self, resolver):
        """Test that low confidence beliefs are not promoted."""
        should_promote = await resolver.should_promote_to_fact(
            entity_id="entity-1",
            attribute="color",
            confidence=0.5,
            evidence_ids=["ev-1"],
        )

        assert should_promote is False

    @pytest.mark.asyncio
    async def test_should_promote_to_fact_insufficient_evidence(self, resolver):
        """Test that beliefs with insufficient evidence are not promoted."""
        should_promote = await resolver.should_promote_to_fact(
            entity_id="entity-1",
            attribute="color",
            confidence=0.95,
            evidence_ids=["ev-1"],  # Only 1 evidence
        )

        assert should_promote is False

    @pytest.mark.asyncio
    async def test_should_promote_to_fact_high_confidence(self, resolver):
        """Test that high confidence beliefs with evidence are promoted."""
        should_promote = await resolver.should_promote_to_fact(
            entity_id="entity-1",
            attribute="color",
            confidence=0.95,
            evidence_ids=["ev-1", "ev-2", "ev-3"],
        )

        assert should_promote is True
