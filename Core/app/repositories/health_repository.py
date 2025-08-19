from typing import Dict
import time


class HealthRepository:
    """Repository layer for health-related data sources.
    This is a stub; replace with real checks (DB, cache, external services) as needed.
    """

    def ping(self) -> Dict[str, str]:
        # Simulate data-source checks; here we just return static info.
        return {
            "source": "in-memory",
            "checked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
