# Full Stack Internship - Technical Test

Secure full-stack application to generate, visualize and store AI-generated workout programs.

---

## Stack

- **Frontend:** React (Next.js)
- **Backend:** FastAPI
- **Database:** SQLite
- **AI:** OpenAI SDK (gpt-5-mini)

---

## Features

- **Authentication**
  - Email/password signup & login
  - Bcrypt password hashing
  - JWT authentication with expiration
  - Protected routes (frontend & backend)
  - Automatic logout on session expiration

- **AI Workout Generator**
  - Free-form natural language input
  - Optional structured preferences
  - Strict JSON output validation with retries
  - Graceful rejection for non-fitness or vague requests

- **Dashboard**
  - Generate workout programs
  - One card per training day
  - Save and view workouts with full details
  - Download generated programs as JSON
  - Light / Dark mode support

---

## Project Structure

    apps/
    ├── backend/   # FastAPI backend
    └── web/       # Next.js frontend

---

## Setup

### Prerequisites

- Python 3.11+
- pnpm
- SQLite

### Environment Variables

Create `apps/backend/.env`:

    JWT_SECRET=change-me
    JWT_ALGORITHM=HS256
    JWT_EXPIRATION_MINUTES=30

    OPENAI_API_KEY=your-openai-api-key
    DATABASE_URL=sqlite:///./app.db

### Installation

#### Backend

    cd apps/backend
    python -m venv venv
    source venv/bin/activate
    # On Windows: venv\Scripts\activate
    
    pip install -r requirements.txt
    uvicorn main:app --reload

> Backend runs on: <http://localhost:8000>

#### Frontend

    cd apps/web
    pnpm install
    pnpm dev

> Frontend runs on: <http://localhost:3000>

---

## API Documentation

Swagger UI: <http://localhost:8000/docs>

ReDoc: <http://localhost:8000/redoc>
