# 🎉 Welcome to Insho 🎉

Insho is a Kcal tracker made in the Scope of the Finals...

# Getting Started
## Start Core 🚀
``` bash
  # create & activate your venv first (example)
  python -m venv .venv && source .venv/bin/activate
  
  # install backend dependencies (includes supertokens-python)
  # Option A (from Core folder):
  pip install -r Core/requirements.txt
  # Option B (from repo root):
  pip install -r requirements.txt
  
  # run the API
  uvicorn Core.app.main:app --reload
```

Note: SuperTokens Core should be running at http://localhost:3567 (default). You can change this via env SUPERTOKENS_CONNECTION_URI.

### Troubleshooting
- If you see `ModuleNotFoundError: No module named 'supertokens_python'` when starting uvicorn:
  - Ensure your virtualenv is activated.
  - Install deps using one of the commands above (Core/requirements.txt or root requirements.txt).
  - After installation, restart uvicorn.
- Until SuperTokens is installed, the API will start but:
  - GET `/` includes an `auth_warning` field.
  - GET `/api/v1/auth/me` returns HTTP 503 with guidance.

## Start Web 🚀
```bash
  npm install
```
```bash
  npm run start
```


## Start with Docker Compose 🚢
You can run the whole stack (frontend, backend, SuperTokens Core) with one command.

Prerequisites:
- Docker Desktop (macOS/Windows) or Docker Engine (Linux)
- Docker Compose v2 (included in recent Docker Desktop)

Commands:
```bash
# from the repository root
docker compose up -d

# follow logs (optional)
docker compose logs -f backend
```

Services & URLs:
- Web (Vite): http://localhost:3000
- API (FastAPI): http://localhost:8000 (docs: http://localhost:8000/docs)
- SuperTokens Core: http://localhost:3567/hello -> {"status":"OK"}

Notes:
- The backend is configured (via docker-compose.yml) to talk to SuperTokens Core at http://supertokens:3567.
- CORS and SuperTokens are configured for websiteDomain http://localhost:3000 and apiDomain http://localhost:8000.
- Hot reload is enabled for both frontend and backend through mounted volumes.

Stop the stack:
```bash
docker compose down
```

Optional (API key):
- If you want to protect SuperTokens Core with an API key, edit docker-compose.yml and set:
  - In service "supertokens": environment -> API_KEYS: "your-secret"
  - In service "backend": environment -> SUPERTOKENS_API_KEY=your-secret
