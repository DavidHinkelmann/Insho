from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....core.database import get_db
from ....schemas.user import UserCreate, UserLogin, UserRead
from ....schemas.auth import LoginResponse
from ....services.user_service import UserService
from ....repositories.user_repository import UserRepository
from ....security.auth import create_access_token, get_current_user

router = APIRouter()


def get_user_service() -> UserService:
    return UserService(repo=UserRepository())


@router.post("/register", response_model=UserRead, summary="Register a new user")
def register(payload: UserCreate, db: Session = Depends(get_db), service: UserService = Depends(get_user_service)):
    user = service.register(db, payload)
    return user


@router.post("/login", response_model=LoginResponse, summary="Login and get JWT")
def login(payload: UserLogin, db: Session = Depends(get_db), service: UserService = Depends(get_user_service)):
    user = service.authenticate(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserRead, summary="Get current user (protected)")
async def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, summary="Logout current user (no-op for stateless JWT)")
async def logout(_=Depends(get_current_user)):
    """
    For stateless JWT, server cannot invalidate tokens without a blacklist.
    This endpoint exists for symmetry and future enhancements; clients should
    delete their access token locally. It simply returns 204.
    """
    return None
