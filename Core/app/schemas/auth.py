from __future__ import annotations

from pydantic import BaseModel

from .user import UserRead


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(Token):
    user: UserRead
