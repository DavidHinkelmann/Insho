from Core.app.core.database import Base
from .user import User

# Für Alembic Auto-Detection
# Zukünftige Models müssen hinzgefügt werden
__all__ = ["Base", "User"]
