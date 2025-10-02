from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repositories.food_repository import FoodRepository

try:
    import openfoodfacts
except Exception:  # pragma: no cover - optional dependency
    openfoodfacts = None  # type: ignore


class FoodService:
    def __init__(self, food_repo: FoodRepository):
        self.food_repo = food_repo

    def lookup_by_barcode(self, db: Session, barcode: str):
        # Try DB first
        food = self.food_repo.get_latest_by_barcode(db, barcode)
        if food:
            return food, "db"

        # Fetch via OpenFoodFacts: prefer library if available, else HTTP API
        product_data = None
        try:
            if openfoodfacts is not None and getattr(openfoodfacts, "products", None) is not None:
                product_data = openfoodfacts.products.get_product(barcode)  # type: ignore[attr-defined]
            else:
                # Fallback to HTTP API
                import json
                from urllib.request import urlopen
                from urllib.error import URLError, HTTPError
                url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
                with urlopen(url, timeout=7) as resp:  # nosec B310 (fixed URL, read-only)
                    product_data = json.loads(resp.read().decode("utf-8"))
        except Exception as e:  # pragma: no cover
            raise HTTPException(status_code=502, detail=f"OpenFoodFacts error: {e}")

        if not product_data or product_data.get("status") != 1:
            return None, "not_found"

        p = product_data.get("product", {})
        name = p.get("product_name") or p.get("brands") or p.get("generic_name")
        nutriments = p.get("nutriments", {})
        # kcal may be in energy-kcal_100g else energy_100g (kJ), but we'll prefer kcal
        cal = nutriments.get("energy-kcal_100g")
        if cal is None and (nutriments.get("energy_100g") is not None or nutriments.get("energy-kj_100g") is not None):
            # Convert kJ to kcal
            try:
                kj = nutriments.get("energy-kj_100g", nutriments.get("energy_100g"))
                cal = float(kj) / 4.184 if kj is not None else None
            except Exception:
                cal = None
        proteins = nutriments.get("proteins_100g")
        carbs = nutriments.get("carbohydrates_100g")
        fats = nutriments.get("fat_100g")

        # For lookup we do not store a row yet; return a transient-like object
        class _Lookup:
            id = ""
            barcode: str
            name: str | None
            calories_per_100g: float | None
            proteins_per_100g: float | None
            carbs_per_100g: float | None
            fats_per_100g: float | None
            def __init__(self):
                self.barcode = barcode
                self.name = name
                self.calories_per_100g = float(cal) if cal is not None else None
                self.proteins_per_100g = float(proteins) if proteins is not None else None
                self.carbs_per_100g = float(carbs) if carbs is not None else None
                self.fats_per_100g = float(fats) if fats is not None else None

        return _Lookup(), "openfoodfacts"

    def consume(self, db: Session, *, user_id: str, barcode: str, grams: float):
        if grams <= 0:
            raise HTTPException(status_code=400, detail="grams must be > 0")

        # Get nutrition info from latest known DB row or OpenFoodFacts
        existing, source = self.lookup_by_barcode(db, barcode)
        if not existing:
            raise HTTPException(status_code=404, detail="Food not found for given barcode")

        created = self.food_repo.create_entry(
            db,
            user_id=user_id,
            barcode=barcode,
            name=getattr(existing, "name", None),
            calories_per_100g=getattr(existing, "calories_per_100g", None),
            proteins_per_100g=getattr(existing, "proteins_per_100g", None),
            carbs_per_100g=getattr(existing, "carbs_per_100g", None),
            fats_per_100g=getattr(existing, "fats_per_100g", None),
            grams=grams,
        )
        return created
