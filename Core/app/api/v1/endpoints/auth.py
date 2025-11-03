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
    return UserRead.model_validate(user)


@router.post("/login", response_model=LoginResponse)
def login(payload: UserLogin, db: Session = Depends(get_db), service: UserService = Depends(get_user_service)):
    print("Login payload:", payload.dict())
    try:
        user = service.authenticate(db, payload.email, payload.password)
        print("Authenticated user:", user)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        token = create_access_token(subject=user.id)
        user_out = UserRead.model_validate(user)
        print("User output:", user_out)
        return LoginResponse(access_token=token, user=user_out)
    except Exception as e:
        print("Login error:", e)
        raise


@router.get("/me", response_model=UserRead, summary="Get current user (protected)")
async def get_me(current_user=Depends(get_current_user)):
    return current_user
