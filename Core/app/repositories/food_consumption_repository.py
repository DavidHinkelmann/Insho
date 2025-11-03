from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import select, func

from ..models.food_consumption import FoodConsumption


class FoodConsumptionRepository:
    def create(self, db: Session, *, user_id: str, food_id: str, grams: float,
               calories: float | None, proteins: float | None, carbs: float | None, fats: float | None) -> FoodConsumption:
        entry = FoodConsumption(
            user_id=user_id,
            food_id=food_id,
            grams=grams,
            calories=calories,
            proteins=proteins,
            carbs=carbs,
            fats=fats,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    def sum_by_user(self, db: Session, *, user_id: str, date_from=None, date_to=None):
        stmt = select(
            func.sum(FoodConsumption.grams).label("grams"),
            func.sum(FoodConsumption.calories).label("calories"),
            func.sum(FoodConsumption.proteins).label("proteins"),
            func.sum(FoodConsumption.carbs).label("carbs"),
            func.sum(FoodConsumption.fats).label("fats"),
        ).where(FoodConsumption.user_id == user_id)
        if date_from is not None:
            stmt = stmt.where(FoodConsumption.scanned_at >= date_from)
        if date_to is not None:
            stmt = stmt.where(FoodConsumption.scanned_at <= date_to)
        row = db.execute(stmt).one()
        return {
            "grams": float(row.grams or 0),
            "calories": float(row.calories or 0),
            "proteins": float(row.proteins or 0),
            "carbs": float(row.carbs or 0),
            "fats": float(row.fats or 0),
        }
