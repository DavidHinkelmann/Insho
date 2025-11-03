from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .api.router import api_router

# SuperTokens imports (guarded)
SUPERTOKENS_AVAILABLE = True
try:
    from supertokens_python import init, SupertokensConfig, InputAppInfo
    from supertokens_python.recipe import session, emailpassword, thirdparty
    from supertokens_python.framework.fastapi import get_middleware
    from supertokens_python import get_all_cors_headers
except ModuleNotFoundError:
    SUPERTOKENS_AVAILABLE = False
    # Define a minimal stub for get_all_cors_headers when SuperTokens is missing
    def get_all_cors_headers():  # type: ignore
        return []

settings = get_settings()

# Initialize FastAPI app
app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# CORS - allow frontend and SuperTokens headers
# In development, be permissive to avoid CORS blocking during local testing.
if settings.ENV.lower() == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,  # must be False when using wildcard origins
        allow_methods=["*"],
        allow_headers=["*"] + get_all_cors_headers(),
        expose_headers=["Content-Disposition"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.WEBSITE_ORIGINS,
        # Broaden regex to include http/https and 127.0.0.1 for any port
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"] + get_all_cors_headers(),
        expose_headers=["Content-Disposition"],
    )

# SuperTokens init (only if available)
if SUPERTOKENS_AVAILABLE:
    # Enable Session, EmailPassword and ThirdParty recipes.
    # Providers for ThirdParty can be configured via SuperTokens Core/Dashboard.
    recipe_list = [
        session.init(),
        emailpassword.init(),
        thirdparty.init(),
    ]

    init(
        app_info=InputAppInfo(
            app_name=settings.PROJECT_NAME,
            api_domain=settings.API_DOMAIN,
            website_domain=settings.WEBSITE_DOMAIN,
            api_base_path=settings.API_BASE_PATH,
        ),
        supertokens_config=SupertokensConfig(
            connection_uri=settings.SUPERTOKENS_CONNECTION_URI,
            api_key=settings.SUPERTOKENS_API_KEY,
        ),
        framework="fastapi",
        recipe_list=recipe_list,
    )

# SuperTokens middleware and routes (mounted at settings.API_BASE_PATH, default: /auth)
if SUPERTOKENS_AVAILABLE:
    app.add_middleware(get_middleware())

# Mount versioned API
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    info = {"message": "Insho API is running", "docs": "/docs", "redoc": "/redoc"}
    if not SUPERTOKENS_AVAILABLE:
        info["auth_warning"] = (
            "SuperTokens not installed. Install dependencies: 'pip install -r Core/requirements.txt' or 'pip install -r requirements.txt' from repo root."
        )
    return info

@app.on_event("startup")
def on_startup() -> None:
    # Ensure models are imported so SQLAlchemy is aware of them
    from .models import user as _user_model  # noqa: F401
    from .core.database import Base, engine

    # Create tables if they do not exist (initial bootstrap)
    Base.metadata.create_all(bind=engine)

    # Run Alembic migrations to keep schema up to date (e.g., add new columns)
    try:
        from .migration.migration import migration_service
        migration_service.run_migrations()
    except Exception as e:
        # Log to console; app can still run but schema may be outdated
        print(f"[startup] Migration run failed: {e}")
