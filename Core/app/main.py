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

# CORS - allow frontend and SuperTokens headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.WEBSITE_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"] + get_all_cors_headers(),
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

    # Create tables if they do not exist
    Base.metadata.create_all(bind=engine)
