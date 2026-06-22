from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from gateway.app.config import get_settings
from gateway.app.models import (
    EventAcceptedResponse,
    IngestEventRequest,
    SensorObservationRequest,
    WebhookIngestRequest,
    build_envelope,
)
from gateway.app.nats_client import EventPublisher, PublishAck


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    publisher = EventPublisher(settings)
    await publisher.connect()
    app.state.publisher = publisher
    try:
        yield
    finally:
        await publisher.close()


app = FastAPI(
    title="DCA Gateway",
    version="0.1.0",
    description="Phase 1 ingestion gateway for publishing immutable DCA events to NATS JetStream.",
    lifespan=lifespan,
)


def get_publisher(request: Request) -> EventPublisher:
    return request.app.state.publisher


async def publish_request(
    request: Request,
    ingest_request: IngestEventRequest,
) -> EventAcceptedResponse:
    settings = get_settings()
    subject, envelope = build_envelope(
        ingest_request,
        schema_version=settings.event_schema_version,
        default_source=settings.service_name,
    )
    ack: PublishAck = await get_publisher(request).publish(subject, envelope)
    return EventAcceptedResponse(
        event_id=envelope.event_id,
        subject=subject,
        stream=ack.stream,
        sequence=ack.sequence,
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ingest/events", response_model=EventAcceptedResponse, status_code=202)
async def ingest_event(request: Request, body: IngestEventRequest) -> EventAcceptedResponse:
    return await publish_request(request, body)


@app.post(
    "/ingest/sensors/{sensor_id}/observations",
    response_model=EventAcceptedResponse,
    status_code=202,
)
async def ingest_sensor_observation(
    request: Request,
    sensor_id: str,
    body: SensorObservationRequest,
) -> EventAcceptedResponse:
    ingest_request = IngestEventRequest(
        domain="perception",
        event_type="sensor.observed",
        payload={"sensor_id": sensor_id, "sensor_type": body.sensor_type, "observation": body.payload},
        source=f"sensor:{sensor_id}",
        correlation_id=body.correlation_id,
        session_id=body.session_id,
        entity_id=sensor_id,
        tags=body.tags | {"sensor_type": body.sensor_type},
    )
    return await publish_request(request, ingest_request)


@app.post("/ingest/webhooks/{source}", response_model=EventAcceptedResponse, status_code=202)
async def ingest_webhook(
    request: Request,
    source: str,
    body: WebhookIngestRequest,
) -> EventAcceptedResponse:
    ingest_request = IngestEventRequest(
        domain="ingest",
        event_type=f"webhook.{body.event_type}",
        payload=body.payload,
        source=f"webhook:{source}",
        correlation_id=body.correlation_id,
        causation_id=body.causation_id,
        session_id=body.session_id,
        entity_id=body.entity_id,
        tags=body.tags | {"webhook_source": source},
    )
    return await publish_request(request, ingest_request)

