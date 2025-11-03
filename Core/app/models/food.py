from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class Food(Base):
    __tablename__ = "foods"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    barcode: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(512), nullable=True)

    calories_per_100g: Mapped[float | None] = mapped_column(Float, nullable=True)
    proteins_per_100g: Mapped[float | None] = mapped_column(Float, nullable=True)
    carbs_per_100g: Mapped[float | None] = mapped_column(Float, nullable=True)
    fats_per_100g: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Per-consumption metadata (single-table design)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    grams: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    scanned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # created_at/updated_at intentionally omitted; scanned_at is the authoritative timestamp
