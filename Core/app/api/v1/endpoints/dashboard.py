from __future__ import annotations

from fastapi import APIRouter, Depends

from ....security.auth import get_current_user

router = APIRouter()


@router.get("", summary="Dashboard entry point: returns onboarding requirement")
async def dashboard(current_user=Depends(get_current_user)):
    return {"show_onboarding": not bool(getattr(current_user, "is_onboarded", False))}
