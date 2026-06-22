import pytest

from edge_daemon.app.gateway_client import GatewayClient


class MockSettings:
    gateway_url = "http://localhost:8000"
    gateway_timeout = 10
    sensor_id = "test-sensor"
    sensor_type = "camera"


@pytest.fixture
def mock_settings(monkeypatch):
    from edge_daemon.app import config

    monkeypatch.setattr(config, "get_settings", lambda: MockSettings())
    return MockSettings()


@pytest.fixture
def gateway_client(mock_settings):
    return GatewayClient()


class TestGatewayClient:
    @pytest.mark.asyncio
    async def test_connect(self, gateway_client):
        """Test connecting to gateway."""
        await gateway_client.connect()
        assert gateway_client._client is not None
        await gateway_client.close()

    @pytest.mark.asyncio
    async def test_send_sensor_observation(self, gateway_client, monkeypatch):
        """Test sending sensor observation."""
        # Mock the HTTP client
        import httpx

        class MockResponse:
            status_code = 202

            def json(self):
                return {"event_id": "test-event-123", "subject": "perception.v1.sensor.observed"}

        class MockClient:
            async def post(self, url, json):
                return MockResponse()

            async def aclose(self):
                pass

        monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: MockClient())

        await gateway_client.connect()

        result = await gateway_client.send_sensor_observation({"test": "data"})
        assert result["event_id"] == "test-event-123"

        await gateway_client.close()
