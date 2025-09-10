from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.user import User


class UserRepository:
    def get_by_id(self, db: Session, user_id: str) -> Optional[User]:
        return db.get(User, user_id)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return db.execute(stmt).scalar_one_or_none()

    def create(self, db: Session, *, email: str, hashed_password: str, name: str | None) -> User:
        user = User(email=email, hashed_password=hashed_password, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
