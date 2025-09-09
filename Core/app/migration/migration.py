from flask_alembic import Alembic
from alembic.config import Config
from alembic import command

def migrate(app):
  alembic = Alembic()
  alembic.init_app(app)
  with app.app_context():
    alembic.upgrade()

def run_migrations():
  alembic_config = Config('alembic.ini')
  command.upgrade(alembic_config, 'head')
