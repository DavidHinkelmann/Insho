from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

from .config import get_settings

# Load settings at once (lru_cache ensures a single instance)
_settings = get_settings()


def _normalize_database_url(url: str) -> str:
    # Normalize legacy postgres schemes to SQLAlchemy URL with psycopg (psycopg3) driver
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


DATABASE_URL = _normalize_database_url(_settings.DATABASE_URL)

# Für SQLite ist ein spezielles connect_arg nötig, damit FastAPI/Uvicorn (mehrere Threads) funktioniert.
# Hintergrund: Der SQLite-Treiber erlaubt standardmäßig nur die Nutzung der Verbindung im selben Thread.
_is_sqlite = DATABASE_URL.startswith("sqlite")

# SQLAlchemy-Engine erstellen; connect_args nur für SQLite setzen.
_engine_kwargs = {
    "echo": False,
    "future": True,
    "pool_pre_ping": True,
}
if _is_sqlite:
    _engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    **_engine_kwargs,
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)

# Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields an SQLAlchemy session.
    Usage:
        def endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
