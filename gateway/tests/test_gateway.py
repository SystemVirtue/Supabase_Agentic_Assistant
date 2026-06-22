from fastapi.testclient import TestClient

from gateway.app.main import app
from gateway.app.nats_client import PublishAck


class FakePublisher:
    def __init__(self) -> None:
        self.calls = []

    async def publish(self, subject, envelope):  # noqa: ANN001
        self.calls.append((subject, envelope))
        return PublishAck(stream="DCA_EVENTS", sequence=42)


def test_ingest_event_publishes_to_nats_subject() -> None:
    fake = FakePublisher()
    app.state.publisher = fake
    client = TestClient(app)

    response = client.post(
        "/ingest/events",
        json={
            "domain": "perception",
            "event_type": "person.detected",
            "payload": {"person": "John", "confidence": 0.82},
            "tags": {"camera": "front"},
        },
    )

    assert response.status_code == 202
    assert response.json()["subject"] == "perception.v1.person.detected"
    assert response.json()["stream"] == "DCA_EVENTS"
    assert response.json()["sequence"] == 42
    assert fake.calls[0][0] == "perception.v1.person.detected"
    assert fake.calls[0][1].payload == {"person": "John", "confidence": 0.82}


def test_invalid_subject_token_is_rejected() -> None:
    app.state.publisher = FakePublisher()
    client = TestClient(app)

    response = client.post(
        "/ingest/events",
        json={
            "domain": "Perception",
            "event_type": "person.detected",
            "payload": {},
        },
    )

    assert response.status_code == 422

