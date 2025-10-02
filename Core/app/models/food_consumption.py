from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class FoodConsumption(Base):
    __tablename__ = "food_consumptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    food_id: Mapped[str] = mapped_column(String(36), ForeignKey("foods.id", ondelete="CASCADE"), index=True, nullable=False)

    grams: Mapped[float] = mapped_column(Float, nullable=False)

    # denormalized per-entry nutrition for fast reporting at the time of logging
    calories: Mapped[float | None] = mapped_column(Float, nullable=True)
    proteins: Mapped[float | None] = mapped_column(Float, nullable=True)
    carbs: Mapped[float | None] = mapped_column(Float, nullable=True)
    fats: Mapped[float | None] = mapped_column(Float, nullable=True)

    scanned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
