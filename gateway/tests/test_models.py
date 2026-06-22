from gateway.app.models import IngestEventRequest, build_envelope, build_subject


def test_build_subject_uses_spec_pattern() -> None:
    assert build_subject("perception", "person.detected") == "perception.v1.person.detected"


def test_build_envelope_sets_required_fields() -> None:
    subject, envelope = build_envelope(
        IngestEventRequest(
            domain="perception",
            event_type="sensor.observed",
            payload={"label": "door_open"},
            entity_id="sensor-1",
            tags={"room": "office"},
        ),
        schema_version="1.0.0",
        default_source="gateway",
    )

    assert subject == "perception.v1.sensor.observed"
    assert envelope.event_type == subject
    assert envelope.schema_version == "1.0.0"
    assert envelope.source == "gateway"
    assert envelope.timestamp > 0
    assert envelope.payload == {"label": "door_open"}

