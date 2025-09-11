from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repositories.user_repository import UserRepository
from ..schemas.user import UserCreate
from ..security.auth import get_password_hash, verify_password


class UserService:
    def __init__(self, repo: UserRepository) -> None:
        self._repo = repo

    def register(self, db: Session, data: UserCreate):
        existing = self._repo.get_by_email(db, data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        hashed = get_password_hash(data.password)
        user = self._repo.create(db, email=data.email, hashed_password=hashed, name=data.name)
        return user

    def authenticate(self, db: Session, email: str, password: str):
        user = self._repo.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
        return user
