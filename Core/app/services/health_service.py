from typing import Dict

from ..repositories.health_repository import HealthRepository
from ..core.config import get_settings


class HealthService:
    def __init__(self, repo: HealthRepository) -> None:
        self._repo = repo
        self._settings = get_settings()

    def status(self) -> Dict[str, str]:
        repo_info = self._repo.ping()
        return {
            "status": "ok",
            "env": self._settings.ENV,
            **repo_info,
        }
