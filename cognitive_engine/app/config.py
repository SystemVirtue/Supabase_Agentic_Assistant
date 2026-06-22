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

    # Redis Configuration
    redis_url: str = "redis://localhost:6379"

    # NATS Configuration
    nats_url: str = "nats://localhost:4222"
    nats_stream_name: str = "dca_events"

    # Service Configuration
    service_name: str = "cognitive_engine"

    # LiteLLM Configuration
    litellm_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # Model Routing Configuration
    default_model: str = "ollama/llama3.2"
    simple_model: str = "ollama/llama3.2"
    moderate_model: str = "anthropic/claude-3-5-sonnet"
    complex_model: str = "anthropic/claude-3-5-sonnet"
    vision_model: str = "anthropic/claude-3-5-sonnet"

    # Budget Configuration
    max_cost_usd: float = 1.0
    max_latency_ms: int = 30000
    max_input_tokens: int = 100000

    # Complexity Classification Thresholds
    simple_token_threshold: int = 100
    moderate_token_threshold: int = 1000
    complex_token_threshold: int = 10000

    # LangGraph Configuration
    langgraph_state_ttl: int = 86400  # 24 hours


@lru_cache
def get_settings() -> Settings:
    return Settings()
