import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # NATS Configuration
    nats_url: str = "nats://localhost:4222"
    nats_stream_name: str = "dca_events"
    nats_consumer_group: str = "wss_workers"
    stream_subjects: list[str] = ["perception.v1.>", "cognition.v1.>"]

    # Database Configuration
    database_url: str = "postgresql://postgres:postgres@localhost:5432/postgres"

    # Redis Configuration
    redis_url: str = "redis://localhost:6379"

    # Service Configuration
    service_name: str = "world_state_service"
    event_schema_version: str = "1.0"

    # Conflict Resolution Parameters
    belief_decay_lambda: float = 0.1  # Decay rate constant
    fact_promotion_threshold: float = 0.9  # Confidence threshold for fact promotion
    fact_promotion_duration_hours: int = 24  # Time above threshold before promotion
    conflict_detection_threshold: float = 0.7  # Secondary belief trust threshold for conflict


@lru_cache
def get_settings() -> Settings:
    return Settings()
