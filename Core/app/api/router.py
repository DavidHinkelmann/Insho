from fastapi import APIRouter

from .v1.endpoints import health, auth

api_router = APIRouter()

# Include individual endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])