import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models import User, ExerciseList
from auth import get_current_user
from schemas import (
    CreateExerciseListRequest,
    ExerciseListSummary,
    ExerciseListDetail,
)

router = APIRouter(prefix="/api/exercise-lists", tags=["exercise-lists"])


@router.post("", response_model=ExerciseListSummary)
def create_exercise_list(
    payload: CreateExerciseListRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = ExerciseList(
        user_id=current_user.id,
        name=payload.name,
        items_json=json.dumps(payload.items, ensure_ascii=False),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return ExerciseListSummary(id=row.id, name=row.name, created_at=row.created_at.isoformat())


@router.get("", response_model=list[ExerciseListSummary])
def list_exercise_lists(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(ExerciseList)
        .filter(ExerciseList.user_id == current_user.id)
        .order_by(ExerciseList.created_at.desc())
        .all()
    )
    return [ExerciseListSummary(id=r.id, name=r.name, created_at=r.created_at.isoformat()) for r in rows]


@router.get("/{list_id}", response_model=ExerciseListDetail)
def get_exercise_list(
    list_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = (
        db.query(ExerciseList)
        .filter(ExerciseList.user_id == current_user.id, ExerciseList.id == list_id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Not found")

    return ExerciseListDetail(
        id=r.id,
        name=r.name,
        items=json.loads(r.items_json),
        created_at=r.created_at.isoformat(),
    )


@router.delete("/{list_id}", status_code=204)
def delete_exercise_list(
    list_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    r = (
        db.query(ExerciseList)
        .filter(ExerciseList.user_id == current_user.id, ExerciseList.id == list_id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(r)
    db.commit()
    return
