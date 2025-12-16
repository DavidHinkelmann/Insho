from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....core.database import get_db
from ....schemas.user import UserRead, UserUpdateOnboarding, UserOnboardingUpdate
from ....security.auth import get_current_user
from ....repositories.user_repository import UserRepository

router = APIRouter()


@router.get("/me", response_model=UserRead, summary="Get current user")
async def read_me(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserRead, summary="Update current user onboarding data")
async def update_me_onboarding(
    payload: UserOnboardingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    repo = UserRepository()
    user = repo.update_onboarding(db, current_user, **payload.model_dump(exclude_unset=True))
    return user
