from dataclasses import dataclass

import nats
from nats.js import JetStreamContext
from nats.js.api import StreamConfig
from nats.js.errors import NotFoundError

from gateway.app.config import Settings
from gateway.app.models import EventEnvelope


@dataclass(frozen=True)
class PublishAck:
    stream: str | None
    sequence: int | None


class EventPublisher:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = None
        self._jetstream: JetStreamContext | None = None

    async def connect(self) -> None:
        self._client = await nats.connect(self._settings.nats_url)
        self._jetstream = self._client.jetstream()
        await self._ensure_stream()

    async def close(self) -> None:
        if self._client is not None:
            await self._client.drain()
            self._client = None
            self._jetstream = None

    async def publish(self, subject: str, envelope: EventEnvelope) -> PublishAck:
        if self._jetstream is None:
            raise RuntimeError("NATS publisher is not connected")
        ack = await self._jetstream.publish(subject, envelope.to_nats_payload())
        return PublishAck(stream=ack.stream, sequence=ack.seq)

    async def _ensure_stream(self) -> None:
        if self._jetstream is None:
            raise RuntimeError("JetStream is not initialized")

        config = StreamConfig(
            name=self._settings.nats_stream_name,
            subjects=self._settings.stream_subjects,
            retention="limits",
            storage="file",
        )
        try:
            await self._jetstream.stream_info(self._settings.nats_stream_name)
        except NotFoundError:
            await self._jetstream.add_stream(config)

