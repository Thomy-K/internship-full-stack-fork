# Full Stack Internship - Technical Test

Technical test for a full-stack internship position (Master's final year).

## Stack

| Component | Technology |
|-----------|------------|
| Frontend  | React (Next.js) |
| Backend   | FastAPI |
| Database  | SQLite |

## Project Structure

```
├── apps/
│   ├── backend/    # FastAPI backend
│   └── web/        # Next.js frontend
```

---

## Features to Implement

### Feature 1 — Authentication (Required)

Implement a secure authentication flow to protect the AI feature.

#### Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Create a new user |
| `/api/auth/login` | POST | Authenticate user and get JWT |
| `/api/auth/me` | GET | Get current user info (protected) |

**Signup** — `POST /api/auth/signup`
```json
// Request
{ "email": "string", "password": "string" }

// Response 201
{ "id": "string", "email": "string" }

// Errors: 400 (validation), 409 (email exists)
```

**Login** — `POST /api/auth/login`
```json
// Request
{ "email": "string", "password": "string" }

// Response 200
{ "access_token": "<jwt>", "token_type": "bearer" }

// Errors: 401 (unauthorized)
```

**Me** — `GET /api/auth/me` (protected)
```
Header: Authorization: Bearer <jwt>
```
```json
// Response 200
{ "id": "string", "email": "string" }
```

#### Technical Requirements

- Hash passwords with **bcrypt** or **argon2**
- JWT signed with a secret from environment variables
- JWT must include `sub` (subject) and `exp` (expiration) claims
- Store token client-side in `localStorage`
- Implement route guards in React for protected pages
- Create FastAPI middleware/dependency for JWT verification

#### Acceptance Criteria

- Signup and login work correctly
- Protected routes only accessible with valid token
- User email displayed in `/dashboard` after authentication

---

### Feature 2 — AI Sport Program Generator

Generate a structured workout program from free-form text input using AI.

#### User Flow

1. Authenticated user navigates to "Generate Program" page
2. User enters free-form text describing their goals, constraints, equipment, availability, and fitness level
3. User clicks "Generate"
4. Backend calls AI model and returns structured JSON
5. Frontend displays workout cards (one card per day)

**Example input:**
> "I want to lose weight, 4 sessions/week, 45 min each, no dumbbells, intermediate level"

#### Backend Endpoint

**Generate Program** — `POST /api/ai/program` (protected)
```json
// Request
{ "text": "<user free text>" }

// Response 200 — Structured JSON with workout days
```

#### LLM Requirements

- Use **OpenAI SDK** with model `gpt-5-mini` (only authorized model)
- Strict JSON output validation
- Implement retry logic on validation failure

#### Frontend Requirements

- Responsive grid layout with one card per day
- Each card displays:
  - Day number and focus area
  - Duration
  - Equipment icons
  - Exercise list (name, sets × reps, rest time)
  - Warmup and cooldown
  - Estimated calories
- "Download JSON" button
- "Re-generate" button (reuses same input text)
- Cards sorted by day

---

## Setup

### Prerequisites

- FastAPI
- Python 3.11+
- pnpm (for frontend)
- SQLite

### Environment Variables

Create a `.env` file in the backend directory:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Database
DATABASE_URL=sqlite:///./app.db
```

### Backend Setup

```bash
cd apps/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd apps/web

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Running the Application

1. Start the backend server (default: http://localhost:8000)
2. Start the frontend server (default: http://localhost:3000)
3. Access the application at http://localhost:3000

---

## API Documentation

Once the backend is running, access the auto-generated API docs:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

