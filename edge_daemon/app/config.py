import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Gateway Configuration
    gateway_url: str = "http://localhost:8000"
    gateway_timeout: int = 10

    # Sensor Configuration
    sensor_id: str = "edge-daemon-001"
    sensor_type: str = "camera"
    sensor_location: str = "living_room"

    # Camera Configuration
    camera_index: int = 0
    camera_width: int = 640
    camera_height: int = 480
    camera_fps: int = 30

    # YOLO Configuration
    yolo_model: str = "yolov8n.pt"
    yolo_confidence_threshold: float = 0.5
    yolo_iou_threshold: float = 0.45

    # Whisper Configuration
    whisper_model: str = "base"
    whisper_sample_rate: int = 16000

    # Audio Configuration
    audio_enabled: bool = False
    audio_chunk_duration: int = 5  # seconds

    # Processing Configuration
    processing_interval: float = 1.0  # seconds between frames
    batch_size: int = 1

    # Service Configuration
    service_name: str = "edge_daemon"


@lru_cache
def get_settings() -> Settings:
    return Settings()
