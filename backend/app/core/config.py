"""Application configuration loaded from environment variables."""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings. All values are read from environment variables or .env file."""

    APP_NAME: str = "Krishi AgriTech"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database: Defaults to SQLite for immediate local testing if Postgres not set
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./krishi.db")

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
