from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Callable

# Try to import SuperTokens verify_session; if unavailable, provide a graceful fallback
SUPERTOKENS_AVAILABLE = True
try:
    from supertokens_python.recipe.session.framework.fastapi import (
        verify_session as st_verify_session,
    )
    from supertokens_python.recipe.session import SessionContainer
except ModuleNotFoundError:
    SUPERTOKENS_AVAILABLE = False

    # Fallback types and dependency when SuperTokens is not installed
    SessionContainer = Any  # type: ignore

    def st_verify_session() -> Callable:  # type: ignore
        async def _dep():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "SuperTokens not installed. Install dependencies: "
                    "'pip install -r Core/requirements.txt' or from repo root 'pip install -r requirements.txt'."
                ),
            )

        return _dep

# Alias verify_session regardless of availability
verify_session = st_verify_session

router = APIRouter()


@router.get("/me", summary="Get current user (protected)")
async def get_me(session: SessionContainer = Depends(verify_session())):
    """Returns info about the currently authenticated trainee/user.
    Requires a valid SuperTokens session.
    """
    return {
        "userId": session.get_user_id(),
        # You can also return access token payload if needed:
        # "jwtPayload": session.get_access_token_payload(),
    }
