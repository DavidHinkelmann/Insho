from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FoodBase(BaseModel):
    barcode: str = Field(min_length=4, max_length=64)
    name: Optional[str] = Field(default=None, max_length=512)
    calories_per_100g: Optional[float] = None
    proteins_per_100g: Optional[float] = None
    carbs_per_100g: Optional[float] = None
    fats_per_100g: Optional[float] = None


class FoodRead(FoodBase):
    id: str
    user_id: str
    grams: float
    scanned_at: datetime

    class Config:
        from_attributes = True


class FoodLookupRequest(BaseModel):
    barcode: str


class FoodLookupResponse(BaseModel):
    food: FoodBase | None
    source: str  # "db" | "openfoodfacts" | "not_found"


class FoodConsumeRequest(BaseModel):
    barcode: str
    grams: float = Field(gt=0)


class FoodListResponse(BaseModel):
    items: list[FoodRead]
