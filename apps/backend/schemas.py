from pydantic import BaseModel, EmailStr, Field
from typing import List, Literal, Optional, Union

# -------- AUTH --------

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

class UserResponse(BaseModel):
    id: str
    email: EmailStr

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# -------- AI PROGRAM --------

class Exercise(BaseModel):
    name: str
    sets: int = Field(ge=1, le=10)
    reps: str
    rest_seconds: int = Field(ge=0, le=600)

class DayProgram(BaseModel):
    day: int = Field(ge=1, le=14)
    focus: str
    intensity: Literal["low", "medium", "high"]
    duration_minutes: int = Field(ge=10, le=180)
    equipment: List[str]
    warmup: List[str]
    exercises: List[Exercise]
    cooldown: List[str]
    estimated_calories: int = Field(ge=0, le=2000)

class ProgramOK(BaseModel):
    status: Literal["ok"]
    days: List[DayProgram]

class ProgramRejected(BaseModel):
    status: Literal["rejected"]
    code: Literal["NOT_FITNESS", "TOO_VAGUE"]
    message: str
    hints: List[str] = Field(default_factory=list)

ProgramResponse = Union[ProgramOK, ProgramRejected]

class ProgramPreferences(BaseModel):
    goal: Optional[str] = None
    level: Optional[str] = None
    sessions_per_week: Optional[int] = Field(default=None, ge=1, le=7)
    duration_minutes: Optional[int] = Field(default=None, ge=10, le=180)
    days_of_week: Optional[List[str]] = None
    equipment: Optional[List[str]] = None
    constraints: Optional[str] = None

class AIProgramRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    preferences: Optional[ProgramPreferences] = None

class SaveWorkoutRequest(BaseModel):
    title: str = Field(min_length=1, max_length=80)
    input_text: Optional[str] = None
    preferences: Optional[ProgramPreferences] = None
    program: ProgramResponse

class WorkoutSummary(BaseModel):
    id: str
    title: str
    created_at: str

class WorkoutDetail(BaseModel):
    id: str
    title: str
    input_text: Optional[str] = None
    preferences: Optional[dict] = None
    program: ProgramResponse
    created_at: str

class RenameWorkoutRequest(BaseModel):
    title: str = Field(min_length=1, max_length=80)

class CreateExerciseListRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    items: List[str] = Field(min_length=1, max_length=200)

class ExerciseListSummary(BaseModel):
    id: str
    name: str
    created_at: str

class ExerciseListDetail(BaseModel):
    id: str
    name: str
    items: List[str]
    created_at: str