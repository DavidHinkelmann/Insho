import os
from functools import lru_cache


class Settings:
    """Basic settings loaded from environment variables with sensible defaults.
    Extend this class as your project grows.
    """

    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Insho API")
    VERSION: str = os.getenv("VERSION", "0.1.0")
    ENV: str = os.getenv("ENV", "development")


@lru_cache
def get_settings() -> Settings:
    return Settings()
