from typing import Dict, Any
from Core.app.migration.migration import migration_service


class DatabaseMigrationService:
  def __init__(self):
    self.migration_service = migration_service  # Jetzt korrekt

  async def run_startup_migrations(self) -> Dict[str, Any]:
    """Führe Migrationen beim App-Start aus"""
    try:
      self.migration_service.run_migrations()
      return {
        "status": "success",
        "message": "Startup-Migrationen abgeschlossen"
      }
    except Exception as e:
      return {
        "status": "error",
        "message": f"Startup-Migration fehlgeschlagen: {str(e)}"
      }


# Service Instance
db_migration_service = DatabaseMigrationService()
