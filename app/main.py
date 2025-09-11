# Entrypoint shim to support `uvicorn app.main:app` from the repo root.
# It simply re-exports the FastAPI app from Core.app.main
from Core.app.main import app  # noqa: F401
