import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import TypeAdapter

from db import get_db
from models import User, WorkoutProgram
from auth import get_current_user
from schemas import (
    SaveWorkoutRequest,
    WorkoutSummary,
    WorkoutDetail,
    RenameWorkoutRequest,
    ProgramResponse,
)

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


@router.post("", response_model=WorkoutSummary)
def save_workout(
    payload: SaveWorkoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = WorkoutProgram(
        user_id=current_user.id,
        title=payload.title,
        input_text=payload.input_text,
        preferences_json=json.dumps(payload.preferences.model_dump() if payload.preferences else None),
        program_json=json.dumps(payload.program.model_dump()),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return WorkoutSummary(id=row.id, title=row.title, created_at=row.created_at.isoformat())


@router.get("", response_model=list[WorkoutSummary])
def list_workouts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(WorkoutProgram)
        .filter(WorkoutProgram.user_id == current_user.id)
        .order_by(WorkoutProgram.created_at.desc())
        .all()
    )
    return [WorkoutSummary(id=r.id, title=r.title, created_at=r.created_at.isoformat()) for r in rows]


@router.get("/{workout_id}", response_model=WorkoutDetail)
def get_workout(
    workout_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = (
        db.query(WorkoutProgram)
        .filter(WorkoutProgram.user_id == current_user.id, WorkoutProgram.id == workout_id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Not found")

    prefs = json.loads(r.preferences_json) if r.preferences_json else None
    program = TypeAdapter(ProgramResponse).validate_python(json.loads(r.program_json))

    return WorkoutDetail(
        id=r.id,
        title=r.title,
        input_text=r.input_text,
        preferences=prefs,
        program=program,
        created_at=r.created_at.isoformat(),
    )


@router.put("/{workout_id}", response_model=WorkoutSummary)
def rename_workout(
    workout_id: str,
    payload: RenameWorkoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = (
        db.query(WorkoutProgram)
        .filter(WorkoutProgram.user_id == current_user.id, WorkoutProgram.id == workout_id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Not found")

    r.title = payload.title
    db.commit()
    return WorkoutSummary(id=r.id, title=r.title, created_at=r.created_at.isoformat())


@router.delete("/{workout_id}", status_code=204)
def delete_workout(
    workout_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = (
        db.query(WorkoutProgram)
        .filter(WorkoutProgram.user_id == current_user.id, WorkoutProgram.id == workout_id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(r)
    db.commit()
    return
