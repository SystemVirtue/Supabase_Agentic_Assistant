import logging
from datetime import UTC, datetime
from typing import Any

from edge_daemon.app.config import get_settings

logger = logging.getLogger(__name__)


class AudioProcessor:
    """Processes audio using Whisper for speech recognition."""

    def __init__(self):
        self._settings = get_settings()
        self._model = None

    def load_model(self) -> None:
        """Load Whisper model for speech recognition."""
        try:
            import whisper

            self._model = whisper.load_model(self._settings.whisper_model)
            logger.info(f"Loaded Whisper model: {self._settings.whisper_model}")
        except ImportError:
            logger.warning("Whisper not installed, audio processing disabled")
            self._model = None
        except Exception as e:
            logger.error(f"Error loading Whisper model: {e}")
            self._model = None

    def is_available(self) -> bool:
        """Check if audio processing is available."""
        return self._model is not None and self._settings.audio_enabled

    def transcribe_audio(self, audio_data: bytes) -> dict[str, Any]:
        """
        Transcribe audio data using Whisper.

        Args:
            audio_data: Raw audio bytes

        Returns:
            Transcription result
        """
        if not self.is_available():
            logger.warning("Audio processing not available")
            return self._mock_transcription()

        try:
            import numpy as np

            # Convert bytes to numpy array
            audio_array = np.frombuffer(audio_data, dtype=np.float32)

            # Transcribe
            result = self._model.transcribe(audio_array, fp16=False)

            return {
                "timestamp": datetime.now(UTC).isoformat(),
                "text": result["text"].strip(),
                "language": result.get("language", "unknown"),
                "duration": len(audio_array) / self._settings.whisper_sample_rate,
            }

        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            return self._mock_transcription()

    def _mock_transcription(self) -> dict[str, Any]:
        """Generate mock transcription for testing."""
        return {
            "timestamp": datetime.now(UTC).isoformat(),
            "text": "",
            "language": "unknown",
            "duration": 0,
            "mock": True,
        }

    def record_audio_chunk(self, duration: int) -> bytes | None:
        """
        Record a chunk of audio.

        Args:
            duration: Duration in seconds

        Returns:
            Audio bytes or None if recording failed
        """
        try:
            import pyaudio

            p = pyaudio.PyAudio()

            stream = p.open(
                format=pyaudio.paFloat32,
                channels=1,
                rate=self._settings.whisper_sample_rate,
                input=True,
                frames_per_buffer=1024,
            )

            logger.info(f"Recording audio for {duration} seconds...")
            frames = []

            for _ in range(int(self._settings.whisper_sample_rate / 1024 * duration)):
                data = stream.read(1024)
                frames.append(data)

            stream.stop_stream()
            stream.close()
            p.terminate()

            audio_data = b"".join(frames)
            logger.info(f"Recorded {len(audio_data)} bytes")

            return audio_data

        except ImportError:
            logger.warning("PyAudio not installed, audio recording disabled")
            return None
        except Exception as e:
            logger.error(f"Error recording audio: {e}")
            return None
