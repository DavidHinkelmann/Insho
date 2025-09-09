from fastapi import FastAPI
from flask import Flask

from .core.config import get_settings
from .api.router import api_router
from .migration import migration

settings = get_settings()
app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Mount versioned API
app.include_router(api_router, prefix="/api/v1")

application = Flask(__name__)
db = SQLAlchemy()
db.init_app(application)
migration.migrate(application)


@app.get("/")
def root():
    return {"message": "Insho API is running", "docs": "/docs", "redoc": "/redoc"}
