"""
Core application configuration management using Pydantic Settings.
Loads configuration from environment variables and .env file.
"""

from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application Information
    ENVIRONMENT: str = Field(default="development", description="Current execution environment")
    DEBUG: bool = Field(default=True, description="Debug mode flag")
    APP_NAME: str = Field(default="cloudops-sentinel-api", description="Service identifier name")
    APP_VERSION: str = Field(default="0.1.0", description="API semantic version")

    # Server Bindings
    HOST: str = Field(default="0.0.0.0", description="Host address to bind")
    PORT: int = Field(default=8000, description="Port to listen on")

    # Security & CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        description="Allowed CORS origin URLs for frontend integration",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # PostgreSQL Database Credentials
    POSTGRES_SERVER: str = Field(default="localhost", description="PostgreSQL host")
    POSTGRES_PORT: int = Field(default=5432, description="PostgreSQL port")
    POSTGRES_USER: str = Field(default="cloudops_user", description="PostgreSQL username")
    POSTGRES_PASSWORD: str = Field(default="cloudops_secure_password", description="PostgreSQL password")
    POSTGRES_DB: str = Field(default="cloudops_sentinel", description="PostgreSQL database name")

    # Explicit Database URL override (e.g. for testing with sqlite)
    DATABASE_URL: str | None = Field(default=None, description="Direct Database URL override")

    @property
    def sqlalchemy_database_uri(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", description="Standard logging level")

    # Operational Feature Flags
    RECOVERY_DRY_RUN_MODE: bool = Field(
        default=True,
        description="Enforces safe simulation mode for automated recovery actions",
    )
    ENABLE_METRIC_SIMULATOR: bool = Field(
        default=False,
        description="Whether synthetic test metrics are active (strictly false in production)",
    )


settings = Settings()

