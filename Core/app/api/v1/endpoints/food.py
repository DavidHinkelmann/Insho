from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....core.database import get_db
from ....schemas.food import (
    FoodLookupRequest,
    FoodLookupResponse,
    FoodConsumeRequest,
    FoodRead,
)
from ....services.food_service import FoodService
from ....repositories.food_repository import FoodRepository
from ....security.auth import get_current_user

router = APIRouter()


def get_food_service() -> FoodService:
    return FoodService(FoodRepository())


@router.post("/lookup", response_model=FoodLookupResponse, summary="Lookup a food by barcode")
def lookup_food(payload: FoodLookupRequest, db: Session = Depends(get_db), service: FoodService = Depends(get_food_service)):
    food, source = service.lookup_by_barcode(db, payload.barcode)
    return {"food": food, "source": source}


@router.post("/consume", response_model=FoodRead, summary="Record consumed grams for a food by barcode (single-table)")
def consume_food(payload: FoodConsumeRequest, db: Session = Depends(get_db), service: FoodService = Depends(get_food_service), current_user=Depends(get_current_user)):
    created = service.consume(db, user_id=current_user.id, barcode=payload.barcode, grams=payload.grams)
    return created


@router.get("/totals")
def get_totals(db: Session = Depends(get_db), service: FoodService = Depends(get_food_service), current_user=Depends(get_current_user)):
    totals = service.food_repo.totals_by_user(db, user_id=current_user.id)
    return totals
