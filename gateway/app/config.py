from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    nats_url: str = "nats://localhost:4222"
    nats_stream_name: str = "DCA_EVENTS"
    nats_stream_subjects: str = "ingest.>,perception.>,cognition.>,world.>"
    service_name: str = "gateway"
    event_schema_version: str = "1.0.0"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def stream_subjects(self) -> list[str]:
        return [subject.strip() for subject in self.nats_stream_subjects.split(",") if subject.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
