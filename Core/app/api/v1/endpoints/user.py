from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....core.database import get_db
from ....schemas.user import UserRead, UserUpdateOnboarding
from ....security.auth import get_current_user
from ....repositories.user_repository import UserRepository

router = APIRouter()


@router.get("/me", response_model=UserRead, summary="Get current user")
async def read_me(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserRead, summary="Update current user onboarding state")
async def update_me_onboarding(
    payload: UserUpdateOnboarding,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    repo = UserRepository()
    user = repo.set_onboarded(db, current_user, payload.is_onboarded)
    return user
