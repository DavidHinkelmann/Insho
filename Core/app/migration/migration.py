from alembic.config import Config
from alembic import command
from alembic.script import ScriptDirectory
import os
from typing import Optional


class MigrationService:
  def __init__(self):
    self.alembic_cfg = Config(
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "alembic.ini")
    )
    self.script_dir = ScriptDirectory.from_config(self.alembic_cfg)

  def run_migrations(self) -> bool:
    """Führe alle  Migrationen aus"""
    try:
      command.upgrade(self.alembic_cfg, "head")
      print("✅ Alle Migrationen erfolgreich ausgeführt")
      return True
    except Exception as e:
      print(f"❌ Migration fehlgeschlagen: {e}")
      raise

  def create_migration(self, message: str) -> Optional[str]:
    """Erstelle neue Migration mit Autogenerate"""
    try:
      revision = command.revision(
          self.alembic_cfg,
          autogenerate=True,
          message=message
      )
      print(f"✅ Migration '{message}' erstellt: {revision}")
      return revision
    except Exception as e:
      print(f"❌ Migration-Erstellung fehlgeschlagen: {e}")
      raise

  def rollback_migration(self, steps: int = 1) -> bool:
    """Rolle Migration(en) zurück"""
    try:
      command.downgrade(self.alembic_cfg, f"-{steps}")
      print(f"✅ {steps} Migration(en) zurückgerollt")
      return True
    except Exception as e:
      print(f"❌ Rollback fehlgeschlagen: {e}")
      raise

  def get_current_revision(self) -> Optional[str]:
    """Hole aktuelle Revision"""
    try:
      revisions = []

      def capture_revision(rev, context):
        revisions.append(rev)

      command.current(self.alembic_cfg, verbose=False, head_only=False)
      return revisions[0] if revisions else None
    except Exception as e:
      print(f"❌ Konnte aktuelle Revision nicht ermitteln: {e}")
      return None
    except Exception as e:
      print(f"❌ Konnte aktuelle Revision nicht ermitteln: {e}")
      return None

  def get_migration_history(self) -> list:
    """Hole Migrations-Historie"""
    try:
      revisions = []
      for revision in self.script_dir.walk_revisions():
        revisions.append({
          'revision': revision.revision,
          'message': revision.doc,
          'down_revision': revision.down_revision
        })
      return revisions
    except Exception as e:
      print(f"❌ Konnte Historie nicht laden: {e}")
      return []


# Singleton Instance
migration_service = MigrationService()
