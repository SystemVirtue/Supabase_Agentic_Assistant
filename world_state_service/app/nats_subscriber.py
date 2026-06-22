import asyncio
import json
import logging

import nats
from nats.js.api import ConsumerConfig, DeliverPolicy

from gateway.app.models import EventEnvelope
from world_state_service.app.config import get_settings

logger = logging.getLogger(__name__)


class EventConsumer:
    def __init__(self, processor_callback):
        self._settings = get_settings()
        self._processor_callback = processor_callback
        self._client = None
        self._jetstream = None
        self._subscription = None

    async def connect(self) -> None:
        """Connect to NATS and create JetStream context."""
        self._client = await nats.connect(self._settings.nats_url)
        self._jetstream = self._client.jetstream()
        logger.info(f"Connected to NATS at {self._settings.nats_url}")

    async def subscribe(self) -> None:
        """Subscribe to perception and cognition event streams."""
        if self._jetstream is None:
            raise RuntimeError("JetStream is not initialized")

        # Create consumer configuration
        consumer_config = ConsumerConfig(
            name=self._settings.nats_consumer_group,
            deliver_policy=DeliverPolicy.ALL,
            ack_wait=30,  # 30 seconds to process message
            max_deliver=3,  # Retry up to 3 times
        )

        # Subscribe to all relevant subjects
        subjects = self._settings.stream_subjects
        logger.info(f"Subscribing to subjects: {subjects}")

        self._subscription = await self._jetstream.subscribe(
            subject=">".join(subjects),
            stream=self._settings.nats_stream_name,
            config=consumer_config,
            cb=self._on_message,
        )

        logger.info(f"Subscribed to stream '{self._settings.nats_stream_name}'")

    async def _on_message(self, msg) -> None:
        """Process incoming NATS message."""
        try:
            # Deserialize event envelope
            data = msg.data.decode("utf-8")
            envelope_dict = json.loads(data)
            envelope = EventEnvelope(**envelope_dict)

            logger.info(f"Received event: {envelope.event_type} (ID: {envelope.event_id})")

            # Process event through callback
            await self._processor_callback(envelope)

            # Acknowledge message
            await msg.ack()
            logger.debug(f"Acknowledged event: {envelope.event_id}")

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            # Negative ack to trigger redelivery
            await msg.nak()

    async def close(self) -> None:
        """Close NATS connection and drain subscription."""
        if self._subscription:
            await self._subscription.unsubscribe()
            self._subscription = None

        if self._client:
            await self._client.drain()
            self._client = None
            self._jetstream = None

        logger.info("NATS connection closed")
