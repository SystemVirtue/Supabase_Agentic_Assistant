import asyncio
import logging
import signal
import sys
import time

from edge_daemon.app.audio_processor import AudioProcessor
from edge_daemon.app.config import get_settings
from edge_daemon.app.gateway_client import GatewayClient
from edge_daemon.app.vision_processor import VisionProcessor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class EdgeDaemon:
    """Edge daemon that processes camera/audio and pushes observations to the Gateway."""

    def __init__(self):
        self._settings = get_settings()
        self._gateway_client = GatewayClient()
        self._vision_processor = VisionProcessor()
        self._audio_processor = AudioProcessor()
        self._shutdown_event = asyncio.Event()
        self._running = False

    async def start(self) -> None:
        """Start the edge daemon."""
        logger.info("Starting Edge Daemon...")

        # Connect to Gateway
        await self._gateway_client.connect()

        # Load models
        self._vision_processor.load_model()
        self._audio_processor.load_model()

        # Initialize camera
        self._vision_processor.initialize_camera()

        self._running = True
        logger.info("Edge Daemon started successfully")

    async def stop(self) -> None:
        """Stop the edge daemon gracefully."""
        logger.info("Stopping Edge Daemon...")
        self._running = False

        self._vision_processor.close()
        await self._gateway_client.close()

        logger.info("Edge Daemon stopped")

    async def process_vision_loop(self) -> None:
        """Main vision processing loop."""
        while self._running and not self._shutdown_event.is_set():
            try:
                # Capture frame
                frame = self._vision_processor.capture_frame()
                if frame is None:
                    logger.warning("Failed to capture frame, retrying...")
                    await asyncio.sleep(1)
                    continue

                # Process frame
                detection_result = self._vision_processor.process_frame(frame)

                # Send to Gateway if detections found
                if detection_result["detection_count"] > 0:
                    observation = {
                        "sensor_id": self._settings.sensor_id,
                        "sensor_type": self._settings.sensor_type,
                        "location": self._settings.sensor_location,
                        "detections": detection_result,
                    }

                    try:
                        await self._gateway_client.send_sensor_observation(observation)
                        logger.info(
                            f"Sent {detection_result['detection_count']} detections to Gateway"
                        )
                    except Exception as e:
                        logger.error(f"Failed to send observation: {e}")

                # Wait before next frame
                await asyncio.sleep(self._settings.processing_interval)

            except Exception as e:
                logger.error(f"Error in vision loop: {e}")
                await asyncio.sleep(1)

    async def process_audio_loop(self) -> None:
        """Main audio processing loop."""
        while self._running and not self._shutdown_event.is_set():
            try:
                if not self._audio_processor.is_available():
                    await asyncio.sleep(5)
                    continue

                # Record audio chunk
                audio_data = self._audio_processor.record_audio_chunk(
                    self._settings.audio_chunk_duration
                )

                if audio_data is None:
                    await asyncio.sleep(self._settings.audio_chunk_duration)
                    continue

                # Transcribe audio
                transcription = self._audio_processor.transcribe_audio(audio_data)

                # Send to Gateway if transcription has text
                if transcription.get("text"):
                    observation = {
                        "sensor_id": self._settings.sensor_id,
                        "sensor_type": "microphone",
                        "location": self._settings.sensor_location,
                        "transcription": transcription,
                    }

                    try:
                        await self._gateway_client.send_sensor_observation(observation)
                        logger.info(f"Sent transcription to Gateway: {transcription['text'][:50]}...")
                    except Exception as e:
                        logger.error(f"Failed to send observation: {e}")

                # Wait before next chunk
                await asyncio.sleep(self._settings.audio_chunk_duration)

            except Exception as e:
                logger.error(f"Error in audio loop: {e}")
                await asyncio.sleep(5)

    async def run(self) -> None:
        """Run the daemon until shutdown signal."""
        await self.start()

        # Setup signal handlers
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, self._shutdown_event.set)

        # Create tasks for vision and audio loops
        vision_task = asyncio.create_task(self.process_vision_loop())
        audio_task = asyncio.create_task(self.process_audio_loop())

        # Wait for shutdown signal
        await self._shutdown_event.wait()

        # Cancel tasks
        vision_task.cancel()
        audio_task.cancel()

        # Graceful shutdown
        await self.stop()


async def main() -> None:
    daemon = EdgeDaemon()
    try:
        await daemon.run()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
