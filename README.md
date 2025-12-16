# 🎉 Welcome to Insho 🎉

Welcome to Insho.
Insho is a Kcal tracker made in the Scope of the Finals.
---
Insho(インショ) means eating and drinking in Japanese.



# 🚀 Getting Started

<details>
  <summary>⚙️ How to Backend Local</summary>

## Start Core 🚀
#### create and activate your venv first (example)
``` bash
  python -m venv .venv && source .venv/bin/activate
```
#### Option A (from the Core folder):
```bash
  pip install -r Core/requirements.txt
```
#### Option B (from repo root):
```bash
  
  pip install -r requirements.txt
```

```bash
  # run the API
  uvicorn Core.app.main:app --reload
```

</details>

<details>
<summary>🌍 How to Frontend Local</summary>

## Start Web 🚀

```bash
  npm install
```

```bash
  npm run start
```

### Using authentication in the frontend
- Open your frontend: http://localhost:3000 (or the value of VITE_WEBSITE_DOMAIN).
- Click "Sign In / Sign Up" to open the SuperTokens UI.
  - The auth UI is mounted at `VITE_WEBSITE_BASE_PATH` (default: `/auth`).
- After signing in, click "Profile (protected)" to see your userId.
- On the home page, you can also click "Check session (/api/v1/auth/me)" to verify the session via the backend.

Notes
- The backend is expected at `VITE_API_DOMAIN` (default: http://localhost:8000).
- Make sure SuperTokens Core is running (default: http://localhost:3567). Docker compose already wires these up.
- If you change `VITE_WEBSITE_BASE_PATH`, the auth UI moves to that path accordingly.

Troubleshooting
- If the session check returns 401/419, sign in again and ensure cookies are not blocked by the browser.
- If you get CORS errors, verify that the backend `WEBSITE_ORIGINS` includes your frontend URL.
</details>

<details>
<summary>🐋 How to Docker</summary>

## Start with Docker Compose 🚢

You can run the whole stack (frontend, backend, SuperTokens Core) with one command.

Prerequisites:

- Docker Desktop (macOS/Windows) or Docker Engine (Linux)
- Docker Compose v2 (included in a recent Docker Desktop)

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
</details>

<details>
<summary>🔑 JWT Authentication</summary>

Optional (API key):

- If you want to protect SuperTokens Core with an API key, edit docker-compose.yml and set:
    - In service "supertokens": environment -> API_KEYS: "your-secret"
    - In service "backend": environment -> SUPERTOKENS_API_KEY=your-secret



## 🔐 Built-in JWT Authentication (No SuperTokens)

This project now includes a minimal, secure email/password auth using JWTs and PostgreSQL.

- Register: POST /api/v1/auth/register
  - Body (JSON): { "email": "you@example.com", "password": "yourPass123", "name": "You" }
  - Creates a user in Postgres (email unique), stores bcrypt hash.
- Login: POST /api/v1/auth/login
  - Body (JSON): { "email": "you@example.com", "password": "yourPass123" }
  - Returns: { access_token, token_type: "bearer", user }
- Current user: GET /api/v1/auth/me
  - Header: Authorization: Bearer <access_token>

Environment variables:
- DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/insho
- JWT_SECRET_KEY=change-me-in-prod
- ACCESS_TOKEN_EXPIRE_MINUTES=60 (optional)

Docker compose already sets JWT_SECRET_KEY for backend. You can remove the SuperTokens service if you no longer need it; the backend runs without it.

Quick curl test:
```bash
# Register
curl -sS -X POST http://localhost:8000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"Passw0rd!","name":"Test"}'

# Login
TOKEN=$(curl -sS -X POST http://localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"Passw0rd!"}' | jq -r .access_token)

# Me
curl -sS http://localhost:8000/api/v1/auth/me -H "Authorization: Bearer $TOKEN"
```



## Frontend: JWT-based auth quickstart

- Start the web app (from repo root):
  - npm install
  - npm run start
- Open http://localhost:3000
- Click "Loslegen" to go to /login, or navigate to /register to create an account.
- After logging in, /profile will show your user info (fetched from /api/v1/auth/me with the stored Bearer token).
- Tokens are stored in localStorage under key "insho_access_token". Use the Logout button on /profile to clear it.
- The frontend calls the API at VITE_API_DOMAIN (default http://localhost:8000). Configure via env if needed.

</details>
