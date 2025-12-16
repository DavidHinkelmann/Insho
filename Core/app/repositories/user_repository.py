from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from ..models.user import User


class UserRepository:
    def get_by_id(self, db: Session, user_id: str) -> Optional[User]:
        return db.get(User, user_id)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        # Normalize to lowercase to enforce unique constraint consistently
        normalized = email.strip().lower()
        stmt = select(User).where(User.email == normalized)
        return db.execute(stmt).scalar_one_or_none()

    def create(self, db: Session, *, email: str, hashed_password: str, name: str | None) -> User:
        # Normalize email
        normalized = email.strip().lower()
        user = User(email=normalized, hashed_password=hashed_password, name=name)
        db.add(user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            # Translate DB unique constraint violation to a 400 response
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        db.refresh(user)
        return user

    def set_onboarded(self, db: Session, user: User, is_onboarded: bool) -> User:
        user.is_onboarded = is_onboarded
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def update_onboarding(self, db: Session, user: User, **fields) -> User:
        # Update only provided, non-None values
        updatable = [
            "name",
            "age",
            "height",
            "weight",
            "gender",
            "activity_level",
            "kcal_goal",
            "is_onboarded",
        ]
        for key in updatable:
            if key in fields and fields[key] is not None:
                setattr(user, key, fields[key])
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
