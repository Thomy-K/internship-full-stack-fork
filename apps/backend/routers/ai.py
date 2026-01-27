from fastapi import APIRouter, Depends, HTTPException

from models import User
from auth import get_current_user
from schemas import AIProgramRequest, ProgramOK, ProgramRejected
from ai import generate_program

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/program", response_model=ProgramOK)
def ai_program(payload: AIProgramRequest, current_user: User = Depends(get_current_user)):
    preferences = payload.preferences.model_dump() if payload.preferences else None

    if preferences:
        days = preferences.get("days_of_week") or None
        if isinstance(days, list) and len(days) > 0:
            preferences["sessions_per_week"] = len(days)

    result = generate_program(payload.text, preferences=preferences)

    if isinstance(result, ProgramRejected) and result.status == "rejected":
        raise HTTPException(
            status_code=422,
            detail={
                "code": result.code,
                "message": result.message,
                "hints": result.hints,
            },
        )

    return result
