from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = Field(default=None, max_length=120)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(UserBase):
    id: str
    is_active: bool
    is_onboarded: bool
    # Optional profile attributes
    age: Optional[int] | None = None
    height: Optional[float] | None = None
    weight: Optional[float] | None = None
    gender: Optional[str] | None = None
    kcal_goal: Optional[int] | None = None
    activity_level: Optional[str] | None = None
    created_at: datetime
    updated_at: datetime

    # Pydantic v2 config
    model_config = ConfigDict(from_attributes=True)

class UserUpdateOnboarding(BaseModel):
    # default to True when onboarding submits
    is_onboarded: bool = True

class UserOnboardingUpdate(BaseModel):
    # All fields optional; only provided values will be updated
    name: Optional[str] | None = None
    age: Optional[int] | None = None
    height: Optional[int] | None = None
    weight: Optional[int] | None = None
    gender: Optional[str] | None = None
    activity_level: Optional[str] | None = None
    kcal_goal: Optional[int] | None = None
    is_onboarded: bool = True
