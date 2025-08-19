from fastapi import FastAPI

from .core.config import get_settings
from .api.v1.router import api_router


settings = get_settings()
app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Mount versioned API
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Insho API is running", "docs": "/docs", "redoc": "/redoc"}
