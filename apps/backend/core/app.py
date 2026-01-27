from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.errors import add_exception_handlers
from db import Base, engine
from routers.auth import router as auth_router
from routers.workouts import router as workouts_router
from routers.exercise_lists import router as exercise_lists_router
from routers.ai import router as ai_router


def create_app() -> FastAPI:
    app = FastAPI()

    add_exception_handlers(app)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    Base.metadata.create_all(bind=engine)

    app.include_router(auth_router)
    app.include_router(workouts_router)
    app.include_router(exercise_lists_router)
    app.include_router(ai_router)

    return app
