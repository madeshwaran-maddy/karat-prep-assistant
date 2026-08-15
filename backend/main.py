from contextlib import asynccontextmanager
import os
import uuid

import bcrypt
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from debugging_drill.api.routes import router as debugging_router
from debugging_drill.services.ollama_service import OllamaService
from mock_assessment.api.routes import router as mock_assessment_router

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:1234@localhost:5432/karat_prep_assistant",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def ensure_schema():
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS candidates (
                    id UUID PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(20),
                    password_hash VARCHAR(255),
                    status VARCHAR(50),
                    role VARCHAR(50),
                    lead_name VARCHAR(255),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE candidates
                ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS assessments (
                    id UUID PRIMARY KEY,
                    candidate_id UUID NOT NULL REFERENCES candidates(id),
                    "attempt_no" INTEGER NOT NULL,
                    round INTEGER NOT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
                    created_at TIMESTAMP DEFAULT NOW(),
                    completed_at TIMESTAMP NULL,
                    updated_at TIMESTAMP DEFAULT NOW()
                )
                """
            )
        )


# ---------------------------------------------------------
# Startup / Shutdown
# ---------------------------------------------------------

ollama_service = OllamaService()


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("=" * 60)
    print("Starting Debugging Drill API...")
    print("=" * 60)

    ensure_schema()

    if ollama_service.health():

        print("✓ Ollama server is reachable")

        models = ollama_service.available_models()

        if models:

            print(f"✓ Available models: {', '.join(models)}")

        else:

            print("⚠ No models installed.")

    else:

        print("⚠ Ollama server is NOT running.")

    yield

    print("=" * 60)
    print("Debugging Drill API stopped.")
    print("=" * 60)


# ---------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------

app = FastAPI(

    title="Karat Prep Assistant API",

    version="1.0.0",

    description="Backend for Debugging Drill",

    lifespan=lifespan,

)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        "http://localhost:3000",

    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)


class CandidateSignupRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=3)
    password: str = Field(default="", min_length=4)
    phone: str | None = None
    lead_name: str | None = None


class CandidateLoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)


# ---------------------------------------------------------
# Health
# ---------------------------------------------------------

@app.get("/")
def root():

    return {

        "application": "Karat Prep Assistant",

        "module": "Debugging Drill",

        "status": "running",

    }


@app.get("/ping")
def ping():

    return {

        "message": "pong"

    }


@app.get("/api/health/db")
def db_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(exc)}") from exc


@app.post("/api/signup")
def signup(candidate: CandidateSignupRequest):
    email = candidate.email.strip().lower()
    password_hash = bcrypt.hashpw(candidate.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    try:
        with engine.begin() as connection:
            existing = connection.execute(
                text("SELECT id FROM candidates WHERE email = :email"),
                {"email": email},
            ).fetchone()

            if existing:
                raise HTTPException(status_code=409, detail="Email already registered.")

            candidate_id = str(uuid.uuid4())

            connection.execute(
                text(
                    """
                    INSERT INTO candidates (
                        id, name, email, phone, password_hash, status, role, lead_name, created_at, updated_at
                    ) VALUES (
                        :id, :name, :email, :phone, :password_hash, :status, :role, :lead_name, NOW(), NOW()
                    )
                    """
                ),
                {
                    "id": candidate_id,
                    "name": candidate.name.strip(),
                    "email": email,
                    "phone": candidate.phone.strip() if candidate.phone else None,
                    "password_hash": password_hash,
                    "status": "pending",
                    "role": "candidate",
                    "lead_name": candidate.lead_name.strip() if candidate.lead_name else None,
                },
            )

        return {
            "message": "Signup successful",
            "candidateId": candidate_id,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create account: {str(exc)}") from exc


@app.post("/api/login")
def login(payload: CandidateLoginRequest):
    email = payload.email.strip().lower()

    try:
        with engine.connect() as connection:
            row = connection.execute(
                text(
                    "SELECT id, name, email, password_hash, role FROM candidates WHERE email = :email"
                ),
                {"email": email},
            ).fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        stored_hash = row[3]
        if not stored_hash or not bcrypt.checkpw(payload.password.encode("utf-8"), stored_hash.encode("utf-8")):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        return {
            "message": "Login successful",
            "user": {
                "id": str(row[0]),
                "name": row[1],
                "email": row[2],
                "role": row[4],
            },
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(exc)}") from exc


@app.post("/api/assessments/start-debugging-drill")
def start_debugging_drill(request: Request):
    candidate_token = (request.cookies.get("auth_token") or "").strip()
    if not candidate_token or not candidate_token.startswith("candidate-"):
        raise HTTPException(status_code=401, detail="Candidate not logged in.")

    candidate_id = candidate_token.replace("candidate-", "", 1)

    try:
        with engine.begin() as connection:
            candidate = connection.execute(
                text("SELECT id FROM candidates WHERE id::text = :candidate_id"),
                {"candidate_id": candidate_id},
            ).fetchone()

            if not candidate:
                raise HTTPException(status_code=404, detail="Candidate not found.")

            candidate_uuid = candidate[0]

            next_attempt = connection.execute(
                text(
                    """
                    SELECT COALESCE(MAX(attempt_no), 0) + 1
                    FROM assessments
                    WHERE candidate_id = :candidate_uuid AND round = 1
                    """
                ),
                {"candidate_uuid": candidate_uuid},
            ).scalar()

            assessment_id = str(uuid.uuid4())

            connection.execute(
                text(
                    """
                    INSERT INTO assessments (id, candidate_id, attempt_no, round, status, created_at, updated_at)
                    VALUES (:assessment_id, :candidate_uuid, :attempt_no, :round, :status, NOW(), NOW())
                    """
                ),
                {
                    "assessment_id": assessment_id,
                    "candidate_uuid": candidate_uuid,
                    "attempt_no": int(next_attempt),
                    "round": 1,
                    "status": "in_progress",
                },
            )

        return {
            "assessmentId": assessment_id,
            "candidateId": str(candidate_uuid),
            "attempt_no": int(next_attempt),
            "round": 1,
            "status": "in_progress",
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to start debugging drill: {str(exc)}") from exc


# ---------------------------------------------------------
# Routers
# ---------------------------------------------------------

app.include_router(
    debugging_router
)
app.include_router(
    mock_assessment_router
)