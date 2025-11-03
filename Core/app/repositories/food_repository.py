from __future__ import annotations

from typing import Optional

from sqlalchemy import select, and_, func
from sqlalchemy.orm import Session

from ..models.food import Food


class FoodRepository:
    def get_latest_by_barcode(self, db: Session, barcode: str) -> Optional[Food]:
        stmt = select(Food).where(Food.barcode == barcode).order_by(Food.scanned_at.desc())
        return db.execute(stmt).scalars().first()

    def create_entry(
        self,
        db: Session,
        *,
        user_id: str,
        barcode: str,
        name: str | None,
        calories_per_100g: float | None,
        proteins_per_100g: float | None,
        carbs_per_100g: float | None,
        fats_per_100g: float | None,
        grams: float,
    ) -> Food:
        food = Food(
            user_id=user_id,
            barcode=barcode,
            name=name,
            calories_per_100g=calories_per_100g,
            proteins_per_100g=proteins_per_100g,
            carbs_per_100g=carbs_per_100g,
            fats_per_100g=fats_per_100g,
            grams=grams,
        )
        db.add(food)
        db.commit()
        db.refresh(food)
        return food

    def totals_by_user(self, db: Session, *, user_id: str):
        stmt = select(
            func.sum(Food.grams).label("grams"),
            func.sum((Food.calories_per_100g or 0) * (Food.grams / 100.0)).label("calories")  # type: ignore
        ).where(Food.user_id == user_id)
        row = db.execute(stmt).one()
        return {
            "grams": float(row.grams or 0),
            "calories": float(row.calories or 0),
        }
