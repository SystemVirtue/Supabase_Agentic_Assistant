import json
import re
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator
from uuid6 import uuid7

SUBJECT_TOKEN = re.compile(r"^[a-z][a-z0-9_]*$")
EVENT_TOKEN = re.compile(r"^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$")


def epoch_millis_now() -> int:
    return int(datetime.now(tz=UTC).timestamp() * 1000)


class IngestEventRequest(BaseModel):
    domain: str = Field(..., examples=["perception"])
    event_type: str = Field(..., examples=["sensor.observed"])
    payload: dict[str, Any]
    source: str | None = None
    correlation_id: str = ""
    causation_id: str = ""
    session_id: str = ""
    entity_id: str = ""
    tags: dict[str, str] = Field(default_factory=dict)

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, value: str) -> str:
        if not SUBJECT_TOKEN.fullmatch(value):
            raise ValueError("domain must be a lowercase NATS subject token")
        return value

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, value: str) -> str:
        if not EVENT_TOKEN.fullmatch(value):
            raise ValueError("event_type must be lowercase dotted subject tokens")
        return value


class SensorObservationRequest(BaseModel):
    sensor_type: str = Field(..., examples=["camera"])
    payload: dict[str, Any]
    correlation_id: str = ""
    session_id: str = ""
    tags: dict[str, str] = Field(default_factory=dict)


class WebhookIngestRequest(BaseModel):
    event_type: str = Field(..., examples=["notification.received"])
    payload: dict[str, Any]
    correlation_id: str = ""
    causation_id: str = ""
    session_id: str = ""
    entity_id: str = ""
    tags: dict[str, str] = Field(default_factory=dict)

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, value: str) -> str:
        if not EVENT_TOKEN.fullmatch(value):
            raise ValueError("event_type must be lowercase dotted subject tokens")
        return value


class EventEnvelope(BaseModel):
    event_id: str
    event_type: str
    schema_version: str
    source: str
    timestamp: int
    correlation_id: str = ""
    causation_id: str = ""
    session_id: str = ""
    entity_id: str = ""
    tags: dict[str, str] = Field(default_factory=dict)
    payload: dict[str, Any]

    def to_nats_payload(self) -> bytes:
        return self.model_dump_json(exclude_none=True).encode("utf-8")

    def protobuf_payload_bytes(self) -> bytes:
        return json.dumps(self.payload, separators=(",", ":"), sort_keys=True).encode("utf-8")


class EventAcceptedResponse(BaseModel):
    event_id: str
    subject: str
    stream: str | None = None
    sequence: int | None = None


def build_subject(domain: str, event_type: str) -> str:
    return f"{domain}.v1.{event_type}"


def build_envelope(
    request: IngestEventRequest,
    *,
    schema_version: str,
    default_source: str,
) -> tuple[str, EventEnvelope]:
    subject = build_subject(request.domain, request.event_type)
    envelope = EventEnvelope(
        event_id=str(uuid7()),
        event_type=subject,
        schema_version=schema_version,
        source=request.source or default_source,
        timestamp=epoch_millis_now(),
        correlation_id=request.correlation_id,
        causation_id=request.causation_id,
        session_id=request.session_id,
        entity_id=request.entity_id,
        tags=request.tags,
        payload=request.payload,
    )
    return subject, envelope

