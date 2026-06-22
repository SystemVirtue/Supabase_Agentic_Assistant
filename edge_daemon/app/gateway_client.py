import logging
from typing import Any

import httpx

from edge_daemon.app.config import get_settings

logger = logging.getLogger(__name__)


class GatewayClient:
    """HTTP client for pushing sensor observations to the Phase 1 Gateway."""

    def __init__(self):
        self._settings = get_settings()
        self._client = None

    async def connect(self) -> None:
        """Initialize HTTP client."""
        self._client = httpx.AsyncClient(timeout=self._settings.gateway_timeout)
        logger.info(f"Connected to Gateway at {self._settings.gateway_url}")

    async def close(self) -> None:
        """Close HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None
            logger.info("Gateway client closed")

    async def send_sensor_observation(
        self,
        observation: dict[str, Any],
        correlation_id: str = "",
        session_id: str = "",
        tags: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """
        Send a sensor observation to the Gateway.

        Args:
            observation: The observation payload
            correlation_id: Optional correlation ID
            session_id: Optional session ID
            tags: Optional tags

        Returns:
            Gateway response
        """
        if self._client is None:
            raise RuntimeError("Gateway client is not connected")

        url = f"{self._settings.gateway_url}/ingest/sensors/{self._settings.sensor_id}/observations"

        payload = {
            "sensor_type": self._settings.sensor_type,
            "payload": observation,
            "correlation_id": correlation_id,
            "session_id": session_id,
            "tags": tags or {},
        }

        try:
            response = await self._client.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Sent observation to Gateway: {result['event_id']}")
            return result
        except httpx.HTTPError as e:
            logger.error(f"Error sending observation to Gateway: {e}")
            raise

    async def send_generic_event(
        self,
        domain: str,
        event_type: str,
        payload: dict[str, Any],
        correlation_id: str = "",
        causation_id: str = "",
        session_id: str = "",
        entity_id: str = "",
        tags: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """
        Send a generic event to the Gateway.

        Args:
            domain: Event domain
            event_type: Event type
            payload: Event payload
            correlation_id: Optional correlation ID
            causation_id: Optional causation ID
            session_id: Optional session ID
            entity_id: Optional entity ID
            tags: Optional tags

        Returns:
            Gateway response
        """
        if self._client is None:
            raise RuntimeError("Gateway client is not connected")

        url = f"{self._settings.gateway_url}/ingest/events"

        event_payload = {
            "domain": domain,
            "event_type": event_type,
            "payload": payload,
            "correlation_id": correlation_id,
            "causation_id": causation_id,
            "session_id": session_id,
            "entity_id": entity_id,
            "tags": tags or {},
        }

        try:
            response = await self._client.post(url, json=event_payload)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Sent event to Gateway: {result['event_id']}")
            return result
        except httpx.HTTPError as e:
            logger.error(f"Error sending event to Gateway: {e}")
            raise
