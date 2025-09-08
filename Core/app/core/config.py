import os
from functools import lru_cache


class Settings:
    """Basic settings loaded from environment variables with sensible defaults.
    Extend this class as your project grows.
    """

    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Insho API")
    VERSION: str = os.getenv("VERSION", "0.1.0")
    ENV: str = os.getenv("ENV", "development")
    # Database URL; default to local PostgreSQL (override via env: DATABASE_URL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/insho",
    )

    # SuperTokens configuration
    SUPERTOKENS_CONNECTION_URI: str = os.getenv(
        "SUPERTOKENS_CONNECTION_URI", "http://localhost:3567"
    )
    SUPERTOKENS_API_KEY: str | None = os.getenv("SUPERTOKENS_API_KEY") or None

    # Domains for SuperTokens app info
    API_DOMAIN: str = os.getenv("API_DOMAIN", "http://localhost:8000")
    WEBSITE_DOMAIN: str = os.getenv("WEBSITE_DOMAIN", "http://localhost:5173")
    API_BASE_PATH: str = os.getenv("API_BASE_PATH", "/auth")


@lru_cache
def get_settings() -> Settings:
    return Settings()
