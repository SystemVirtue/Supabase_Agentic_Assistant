import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database Configuration
    database_url: str = "postgresql://postgres:postgres@localhost:5432/postgres"

    # NATS Configuration
    nats_url: str = "nats://localhost:4222"
    nats_stream_name: str = "dca_events"

    # Service Configuration
    service_name: str = "agent_lifecycle_manager"

    # Agent Management Configuration
    agent_heartbeat_interval: int = 30  # seconds
    agent_timeout: int = 120  # seconds before agent considered dead
    task_allocation_interval: int = 10  # seconds

    # Trust Score Configuration
    trust_decay_rate: float = 0.01
    trust_boost_on_success: float = 0.1
    trust_penalty_on_failure: float = 0.2


@lru_cache
def get_settings() -> Settings:
    return Settings()
