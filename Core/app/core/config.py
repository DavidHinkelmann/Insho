import os
from functools import lru_cache


class Settings:
    """Basic settings loaded from environment variables with sensible defaults.
    Extend this class as your project grows.
    """

    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Insho API")
    VERSION: str = os.getenv("VERSION", "0.1.0")
    ENV: str = os.getenv("ENV", "development")
    # Database URL; default to local PostgresSQL (override via env: DATABASE_URL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/insho",
    )

    # JWT configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-insecure-change-me")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # SuperTokens configuration (legacy; safe to ignore if not used)
    SUPERTOKENS_CONNECTION_URI: str = os.getenv(
        "SUPERTOKENS_CONNECTION_URI", "http://localhost:3567"
    )
    SUPERTOKENS_API_KEY: str | None = os.getenv("SUPERTOKENS_API_KEY") or None

    # Social login (Google) credentials for SuperTokens ThirdParty recipe
    GOOGLE_CLIENT_ID: str | None = os.getenv("GOOGLE_CLIENT_ID") or None
    GOOGLE_CLIENT_SECRET: str | None = os.getenv("GOOGLE_CLIENT_SECRET") or None

    # Domains for SuperTokens app info
    API_DOMAIN: str = os.getenv("API_DOMAIN", "http://localhost:8000")
    WEBSITE_DOMAIN: str = os.getenv("WEBSITE_DOMAIN", "http://localhost:5173")
    API_BASE_PATH: str = os.getenv("API_BASE_PATH", "/auth")

    # CORS: support multiple allowed website origins (comma separated)
    _WEBSITE_ORIGINS_RAW: str = os.getenv("WEBSITE_ORIGINS", "")
    WEBSITE_ORIGINS: list[str] = [
        origin.strip()
        for origin in _WEBSITE_ORIGINS_RAW.split(",")
        if origin.strip()
    ] or [
        WEBSITE_DOMAIN,
        # Common dev origins (HTTP)
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # Common dev origins (HTTPS)
        "https://localhost:3000",
        "https://127.0.0.1:3000",
        "https://localhost:5173",
        "https://127.0.0.1:5173",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
