from fastapi import APIRouter, Depends

from Core.app.services.health_service import HealthService
from Core.app.repositories.health_repository import HealthRepository

router = APIRouter()


def get_health_service() -> HealthService:
    repo = HealthRepository()
    return HealthService(repo=repo)


@router.get("/", summary="Health check")
def get_health(service: HealthService = Depends(get_health_service)):
    return service.status()
