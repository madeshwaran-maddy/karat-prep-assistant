from contextlib import asynccontextmanager
import json
import os
import uuid
from datetime import datetime

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
from mock_assessment.services.excel_service import get_random_exercise_question
from concept_learning.routes import router as concept_learning_router
from practice_question_tracking.routes import router as practice_question_router

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:1234@localhost:5432/karat_prep_assistant",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def ensure_schema():
    with engine.begin() as connection:
        candidates_exists = connection.execute(
            text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'candidates'
                )
                """
            )
        ).scalar()

        if not candidates_exists:
            connection.execute(text("DROP TABLE IF EXISTS practice_question_progress CASCADE"))
            connection.execute(text("DROP TABLE IF EXISTS concept_progress CASCADE"))
            connection.execute(text("DROP TABLE IF EXISTS evaluations CASCADE"))
            connection.execute(text("DROP TABLE IF EXISTS questions CASCADE"))
            connection.execute(text("DROP TABLE IF EXISTS assessments CASCADE"))

        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS candidates (
                    id UUID PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(20),
                    language_selected VARCHAR(255),
                    password_hash VARCHAR(255),
                    status VARCHAR(50),
                    role VARCHAR(50),
                    lead_name VARCHAR(255),
                    start_date DATE,
                    karat_prep_timeline VARCHAR(255),
                    karat_assessment_date DATE,
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
                ADD COLUMN IF NOT EXISTS language_selected VARCHAR(255)
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
                ALTER TABLE candidates
                ADD COLUMN IF NOT EXISTS start_date DATE
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE candidates
                ADD COLUMN IF NOT EXISTS karat_prep_timeline VARCHAR(255)
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE candidates
                ADD COLUMN IF NOT EXISTS karat_assessment_date DATE
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

        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS questions (
                    id UUID PRIMARY KEY,
                    assessment_id UUID NOT NULL REFERENCES assessments(id),
                    candidate_id UUID NOT NULL REFERENCES candidates(id),
                    question_no INTEGER NOT NULL,
                    topic VARCHAR(255),
                    subtopic VARCHAR(255),
                    difficulty VARCHAR(50) DEFAULT 'medium',
                    description TEXT DEFAULT '',
                    code TEXT,
                    source VARCHAR(50) DEFAULT 'excel',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS evaluations (
                    id UUID PRIMARY KEY,
                    assessment_id UUID NOT NULL REFERENCES assessments(id),
                    candidate_id UUID NOT NULL REFERENCES candidates(id),
                    question_id UUID NOT NULL REFERENCES questions(id),
                    user_code TEXT,
                    user_analysis TEXT,
                    score INTEGER,
                    correct BOOLEAN,
                    explanation TEXT,
                    suggestions TEXT,
                    corrected_code TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS uq_evaluations_question_id
                ON evaluations (question_id)
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS concept_progress (
                    id UUID PRIMARY KEY,
                    candidate_id UUID NOT NULL REFERENCES candidates(id),
                    concept_id VARCHAR(255) NOT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
                    started_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    time_spent_seconds INTEGER DEFAULT 0,
                    last_accessed TIMESTAMP DEFAULT NOW(),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(candidate_id, concept_id)
                )
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_concept_progress_candidate
                ON concept_progress (candidate_id)
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS practice_question_progress (
                    id UUID PRIMARY KEY,
                    candidate_id UUID NOT NULL REFERENCES candidates(id),
                    language_selected VARCHAR(255),
                    section VARCHAR(255) NOT NULL,
                    topic_id VARCHAR(255) NOT NULL,
                    question_no INTEGER NOT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
                    time_spent_seconds INTEGER DEFAULT 0,
                    started_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    last_accessed TIMESTAMP DEFAULT NOW(),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(candidate_id, section, topic_id, question_no)
                )
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_practice_progress_candidate
                ON practice_question_progress (candidate_id)
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


class CandidateUpdateRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=3)
    phone: str | None = None
    language_selected: str | None = None
    lead_name: str | None = None
    status: str | None = None
    role: str | None = None
    start_date: str | None = None
    karat_prep_timeline: str | None = None
    karat_assessment_date: str | None = None


class ExerciseQuestionSubmitRequest(BaseModel):
    assessmentId: str = Field(..., min_length=1)
    questionId: str = Field(..., min_length=1)
    userCode: str = Field(default="")
    userAnalysis: str = Field(default="")


def format_date_value(value):
    if value is None:
        return ""
    if isinstance(value, str):
        value = value.split("T")[0]
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).strftime("%Y-%m-%d")
    except ValueError:
        return str(value)


def format_display_date(value):
    if value is None:
        return ""
    if isinstance(value, str):
        value = value.split("T")[0]
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).strftime("%d-%b-%y")
    except ValueError:
        return str(value)


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


@app.get("/api/reviewer/candidates")
def get_reviewer_candidates():
    with engine.connect() as connection:
        rows = connection.execute(
            text(
                """
                SELECT
                    c.id,
                    c.name,
                    c.email,
                    c.phone,
                      c.language_selected,
                    c.created_at,
                    c.start_date,
                    c.karat_prep_timeline,
                    c.karat_assessment_date,
                    c.role,
                    c.lead_name,
                    c.status,
                    COALESCE(SUM(CASE WHEN a.round = 1 THEN 1 ELSE 0 END), 0) AS round1_attempts,
                    COALESCE(SUM(CASE WHEN a.round = 2 THEN 1 ELSE 0 END), 0) AS round2_attempts,
                    COALESCE(SUM(CASE WHEN a.round = 3 THEN 1 ELSE 0 END), 0) AS mock_attempts
                FROM candidates c
                LEFT JOIN assessments a ON a.candidate_id = c.id
                GROUP BY c.id, c.name, c.email, c.phone, c.language_selected, c.created_at, c.start_date, c.karat_prep_timeline, c.karat_assessment_date, c.role, c.lead_name, c.status
                ORDER BY c.created_at DESC
                """
            )
        ).mappings().all()

    payload = []
    for row in rows:
        start_date_value = row["start_date"] or row["created_at"]
        payload.append(
            {
                "id": str(row["id"]),
                "name": row["name"],
                "email": row["email"],
                "phone": row["phone"],
                 "languageSelected": row.get("language_selected") or "",
                "startDate": format_date_value(start_date_value),
                "karatAssessmentDate": format_date_value(row["karat_assessment_date"]),
                "timeline": row["karat_prep_timeline"] or "",
                "leadName": row["lead_name"] or "",
                "status": row["status"] or "",
                "role": row["role"] or "candidate",
                "round1Attempts": int(row["round1_attempts"] or 0),
                "round2Attempts": int(row["round2_attempts"] or 0),
                "totalMockAttempts": int(row["mock_attempts"] or 0),
                "attempts": [],
            }
        )

    return payload


@app.get("/api/reviewer/candidates/{candidate_id}")
def get_reviewer_candidate(candidate_id: str):
    with engine.connect() as connection:
        candidate_row = connection.execute(
            text(
                """
                SELECT
                    c.id,
                    c.name,
                    c.email,
                    c.phone,
                      c.language_selected,
                    c.created_at,
                    c.start_date,
                    c.karat_prep_timeline,
                    c.karat_assessment_date,
                    c.role,
                    c.lead_name,
                    c.status,
                    COALESCE(SUM(CASE WHEN a.round = 1 THEN 1 ELSE 0 END), 0) AS round1_attempts,
                    COALESCE(SUM(CASE WHEN a.round = 2 THEN 1 ELSE 0 END), 0) AS round2_attempts,
                    COALESCE(SUM(CASE WHEN a.round = 3 THEN 1 ELSE 0 END), 0) AS mock_attempts
                FROM candidates c
                LEFT JOIN assessments a ON a.candidate_id = c.id
                WHERE c.id::text = :candidate_id
                GROUP BY c.id, c.name, c.email, c.phone, c.language_selected, c.created_at, c.start_date, c.karat_prep_timeline, c.karat_assessment_date, c.role, c.lead_name, c.status
                """
            ),
            {"candidate_id": candidate_id},
        ).mappings().first()

        if candidate_row is None:
            raise HTTPException(status_code=404, detail="Candidate not found.")

        attempt_rows = connection.execute(
            text(
                """
                SELECT
                    a.id AS assessment_id,
                    a.round,
                    a.attempt_no,
                    a.created_at,
                    q.id AS question_id,
                    q.question_no,
                    q.topic,
                    q.subtopic,
                    q.code AS question_code,
                    e.user_code,
                    e.user_analysis,
                    e.score,
                    e.explanation,
                    e.suggestions
                FROM assessments a
                LEFT JOIN questions q ON q.assessment_id = a.id
                LEFT JOIN evaluations e ON e.question_id = q.id
                WHERE a.candidate_id::text = :candidate_id
                ORDER BY a.created_at ASC, q.question_no ASC
                """
            ),
            {"candidate_id": candidate_id},
        ).mappings().all()

    attempts = []
    attempts_by_id = {}
    for attempt in attempt_rows:
        assessment_id = str(attempt.get("assessment_id") or attempt.get("id") or "")
        if not assessment_id:
            continue

        if assessment_id not in attempts_by_id:
            current_round = int(attempt.get("round") or 1)
            attempts_by_id[assessment_id] = {
                "id": assessment_id,
                "round": "Round 1" if current_round == 1 else "Round 2" if current_round == 2 else "Round 3",
                "attemptNo": f"Attempt {int(attempt.get('attempt_no') or 1)}",
                "attemptedDate": format_display_date(attempt.get("created_at")),
                "fileName": attempt.get("topic") or f"Round {current_round} Submission",
                "solution": attempt.get("question_code") or "",
                "questions": [],
            }

        question_id = attempt.get("question_id")
        if question_id is None:
            continue

        suggestions = attempt.get("suggestions") or "[]"
        parsed_suggestions = []
        if isinstance(suggestions, str):
            try:
                parsed_value = json.loads(suggestions)
                if isinstance(parsed_value, list):
                    parsed_suggestions = [str(item) for item in parsed_value]
                elif parsed_value:
                    parsed_suggestions = [str(parsed_value)]
            except (TypeError, ValueError):
                parsed_suggestions = [suggestions] if suggestions else []

        attempts_by_id[assessment_id]["questions"].append(
            {
                "id": str(question_id),
                "questionNo": int(attempt.get("question_no") or 1),
                "topic": attempt.get("topic") or f"Question {int(attempt.get('question_no') or 1)}",
                "subtopic": attempt.get("subtopic") or "General",
                "questionCode": attempt.get("question_code") or "",
                "userCode": attempt.get("user_code") or "",
                "userAnalysis": attempt.get("user_analysis") or "",
                "score": attempt.get("score"),
                "explanation": attempt.get("explanation") or "",
                "suggestions": parsed_suggestions,
            }
        )

    attempts = list(attempts_by_id.values())

    return {
        "id": str(candidate_row["id"]),
        "name": candidate_row["name"],
        "email": candidate_row["email"],
        "phone": candidate_row["phone"],
        "languageSelected": candidate_row.get("language_selected") or "",
        "startDate": format_date_value(candidate_row["start_date"] or candidate_row["created_at"]),
        "karatAssessmentDate": format_date_value(candidate_row["karat_assessment_date"]),
        "timeline": candidate_row["karat_prep_timeline"] or "",
        "leadName": candidate_row["lead_name"] or "",
        "status": candidate_row["status"] or "",
        "role": candidate_row["role"] or "candidate",
        "round1Attempts": int(candidate_row["round1_attempts"] or 0),
        "round2Attempts": int(candidate_row["round2_attempts"] or 0),
        "totalMockAttempts": int(candidate_row["mock_attempts"] or 0),
        "attempts": attempts,
    }


def _overview_value(row, *names, default=None):
    for name in names:
        if name in row and row[name] is not None:
            return row[name]
    return default


def _progress_topic_rows(overview_rows, progress_rows, kind):
    progress_by_key = {}
    for row in progress_rows:
        if kind == "concept":
            key = str(row["concept_id"])
        elif kind == "round2_question":
            key = int(row["question_no"])
        else:
            key = str(row["topic_id"])
        if key not in progress_by_key or row["status"] == "completed":
            progress_by_key[key] = row

    grouped = {}
    for row in overview_rows:
        if kind == "concept":
            item_key = str(_overview_value(
                row, "concept_id", "subtopic", "content_id", "item_id", "slug", "key", "id",
            ))
            group_name = str(_overview_value(
                row, "collection_name", "collection", "category", "topic_name", "topic", "name", "title",
                default="Concepts",
            ))
            progress = progress_by_key.get(item_key)
            item_name = str(_overview_value(
                row, "concept_name", "content_name", "item_name", "subtopic", "name", "title", "concept_id", "content_id",
                default=item_key,
            ))
        elif kind == "round2_question":
            question_no = int(_overview_value(row, "question_no", "question_number", "questionNo", default=0))
            item_key = question_no
            group_name = str(_overview_value(row, "topic", "topic_name", default="Round 2 Practice Questions"))
            progress = progress_by_key.get(item_key)
            item_name = str(_overview_value(
                row, "subtopic", "question_title", "question_name", "title", "name",
                default=f"Question {question_no}",
            ))
        else:
            topic_id = str(_overview_value(row, "subtopic", "topic_id", "topic", "topic_name", default=""))
            group_name = str(_overview_value(row, "topic", "topic_name", "section", default="Practice Questions"))
            item_key = topic_id
            progress = progress_by_key.get(item_key)
            item_name = topic_id or str(_overview_value(row, "question_title", "question_name", "title", "name", default="Practice Question"))

        topic = grouped.setdefault(group_name, {"name": group_name, "items": []})
        if any(item["name"] == item_name for item in topic["items"]):
            continue
        topic["items"].append({
            "name": item_name,
            "completed": bool(progress and progress["status"] == "completed"),
        })

    topics = []
    for topic in grouped.values():
        completed = sum(1 for item in topic["items"] if item["completed"])
        topic["completed"] = completed
        topic["total"] = len(topic["items"])
        topics.append(topic)
    return topics


@app.get("/api/reviewer/candidates/{candidate_id}/learning-progress")
def get_reviewer_learning_progress(candidate_id: str):
    with engine.connect() as connection:
        candidate_exists = connection.execute(
            text("SELECT id FROM candidates WHERE id::text = :candidate_id"),
            {"candidate_id": candidate_id},
        ).fetchone()
        if candidate_exists is None:
            raise HTTPException(status_code=404, detail="Candidate not found.")

        try:
            overview_rows = connection.execute(
                text("SELECT * FROM learning_content_overview ORDER BY round_no, screen"),
            ).mappings().all()
        except Exception as exc:
            raise HTTPException(
                status_code=503,
                detail="learning_content_overview is unavailable. Configure the learning content table before opening this report.",
            ) from exc

        concept_rows = connection.execute(
            text("""
                SELECT concept_id, status
                FROM concept_progress
                WHERE candidate_id::text = :candidate_id
            """),
            {"candidate_id": candidate_id},
        ).mappings().all()
        question_rows = connection.execute(
            text("""
                SELECT section, topic_id, question_no, status
                FROM practice_question_progress
                WHERE candidate_id::text = :candidate_id
            """),
            {"candidate_id": candidate_id},
        ).mappings().all()

    round1_concept_rows = [
        row for row in overview_rows
        if int(row["round_no"]) == 1 and str(row["screen"]).lower() == "concepts"
    ]
    round1_question_rows = [
        row for row in overview_rows
        if int(row["round_no"]) == 1
        and str(row["screen"]).lower() == "practice question"
        and str(_overview_value(row, "section", default="")).lower() != "round2"
    ]
    round2_question_rows = [
        row for row in overview_rows
        if int(row["round_no"]) == 2
    ]

    concept_topics = _progress_topic_rows(round1_concept_rows, concept_rows, "concept")
    round1_topics = _progress_topic_rows(round1_question_rows, question_rows, "question")
    round2_progress_rows = [
        row for row in question_rows
        if str(row["section"]).lower() == "round2"
    ]
    round2_topics = _progress_topic_rows(round2_question_rows, round2_progress_rows, "round2_question")

    def metric(topics):
        total = sum(topic["total"] for topic in topics)
        completed = sum(topic["completed"] for topic in topics)
        return {
            "completed": completed,
            "total": total,
            "percentage": round(completed * 100 / total) if total else 0,
        }

    return {
        "summary": {
            "round1Concepts": metric(concept_topics),
            "round1Practice": metric(round1_topics),
            "round2Practice": metric(round2_topics),
        },
        "details": {
            "round1Concepts": concept_topics,
            "round1Practice": round1_topics,
            "round2Practice": round2_topics,
        },
    }


@app.put("/api/reviewer/candidates/{candidate_id}")
def update_reviewer_candidate(candidate_id: str, payload: CandidateUpdateRequest):
    with engine.begin() as connection:
        existing = connection.execute(
            text("SELECT id FROM candidates WHERE id::text = :candidate_id"),
            {"candidate_id": candidate_id},
        ).fetchone()

        if existing is None:
            raise HTTPException(status_code=404, detail="Candidate not found.")

        start_date = payload.start_date.strip() if payload.start_date and payload.start_date.strip() else None
        assessment_date = (
            payload.karat_assessment_date.strip()
            if payload.karat_assessment_date and payload.karat_assessment_date.strip()
            else None
        )
        timeline = payload.karat_prep_timeline.strip() if payload.karat_prep_timeline else None
        role = payload.role.strip() if payload.role and payload.role.strip() else "candidate"

        connection.execute(
            text(
                """
                UPDATE candidates
                SET
                    name = :name,
                    email = :email,
                    phone = :phone,
                    language_selected = :language_selected,
                    lead_name = :lead_name,
                    status = :status,
                    role = :role,
                    start_date = :start_date,
                    karat_prep_timeline = :karat_prep_timeline,
                    karat_assessment_date = :karat_assessment_date,
                    updated_at = NOW()
                WHERE id::text = :candidate_id
                """
            ),
            {
                "name": payload.name.strip(),
                "email": payload.email.strip().lower(),
                "phone": payload.phone.strip() if payload.phone and payload.phone.strip() else None,
                "language_selected": payload.language_selected.strip() if payload.language_selected and payload.language_selected.strip() else None,
                "lead_name": payload.lead_name.strip() if payload.lead_name and payload.lead_name.strip() else None,
                "status": payload.status.strip() if payload.status and payload.status.strip() else "pending",
                "role": role,
                "start_date": start_date,
                "karat_prep_timeline": timeline,
                "karat_assessment_date": assessment_date,
                "candidate_id": candidate_id,
            },
        )

        row = connection.execute(
            text(
                """
                SELECT
                    c.id,
                    c.name,
                    c.email,
                    c.phone,
                          c.language_selected,
                    c.created_at,
                    c.start_date,
                    c.karat_prep_timeline,
                    c.karat_assessment_date,
                    c.role,
                    c.lead_name,
                    c.status
                FROM candidates c
                WHERE c.id::text = :candidate_id
                """
            ),
            {"candidate_id": candidate_id},
        ).mappings().first()

    if row is None:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    return {
        "id": str(row["id"]),
        "name": row["name"],
        "email": row["email"],
        "phone": row["phone"],
        "languageSelected": row.get("language_selected") or "",
        "startDate": format_date_value(row["start_date"] or row["created_at"]),
        "karatAssessmentDate": format_date_value(row["karat_assessment_date"]),
        "timeline": row["karat_prep_timeline"] or "",
        "leadName": row["lead_name"] or "",
        "status": row["status"] or "",
        "role": row["role"] or "candidate",
    }


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


@app.post("/api/assessments/start-exercise-question")
def start_exercise_question(request: Request):
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
                    WHERE candidate_id = :candidate_uuid AND round = 2
                    """
                ),
                {"candidate_uuid": candidate_uuid},
            ).scalar()

            assessment_id = str(uuid.uuid4())

            connection.execute(
                text(
                    """
                    INSERT INTO assessments (
                        id, candidate_id, attempt_no, round, status, created_at, updated_at
                    ) VALUES (
                        :assessment_id,
                        :candidate_uuid,
                        :attempt_no,
                        :round,
                        :status,
                        NOW(),
                        NOW()
                    )
                    """
                ),
                {
                    "assessment_id": assessment_id,
                    "candidate_uuid": candidate_uuid,
                    "attempt_no": int(next_attempt),
                    "round": 2,
                    "status": "in_progress",
                },
            )

        question = get_random_exercise_question()
        question_topic = question.get("title") or question.get("topic") or "Exercise Question"

        with engine.begin() as connection:
            next_question_no = connection.execute(
                text(
                    """
                    SELECT COALESCE(MAX(question_no), 0) + 1
                    FROM questions
                    WHERE assessment_id = :assessment_id
                    """
                ),
                {"assessment_id": assessment_id},
            ).scalar()

            question_id = str(uuid.uuid4())

            connection.execute(
                text(
                    """
                    INSERT INTO questions (
                        id,
                        assessment_id,
                        candidate_id,
                        question_no,
                        topic,
                        subtopic,
                        difficulty,
                        description,
                        code,
                        source,
                        created_at,
                        updated_at
                    ) VALUES (
                        :id,
                        :assessment_id,
                        :candidate_id,
                        :question_no,
                        :topic,
                        :subtopic,
                        :difficulty,
                        :description,
                        :code,
                        :source,
                        NOW(),
                        NOW()
                    )
                    """
                ),
                {
                    "id": question_id,
                    "assessment_id": assessment_id,
                    "candidate_id": candidate_uuid,
                    "question_no": int(next_question_no),
                    "topic": question_topic,
                    "subtopic": "",
                    "difficulty": "",
                    "description": "",
                    "code": question.get("code", ""),
                    "source": "excel",
                },
            )

        return {
            "assessmentId": assessment_id,
            "candidateId": str(candidate_uuid),
            "attempt_no": int(next_attempt),
            "round": 2,
            "status": "in_progress",
            "question": {
                "id": question_id,
                "questionNo": int(next_question_no),
                "title": question_topic,
                "code": question.get("code", ""),
                "topic": question_topic,
                "source": "excel",
            },
            "questionId": question_id,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to start exercise question: {str(exc)}") from exc


@app.post("/api/assessments/submit-exercise-question")
def submit_exercise_question(payload: ExerciseQuestionSubmitRequest, request: Request):
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

            assessment = connection.execute(
                text(
                    """
                    SELECT id
                    FROM assessments
                    WHERE id::text = :assessment_id
                      AND candidate_id = :candidate_uuid
                      AND round = 2
                    """
                ),
                {"assessment_id": payload.assessmentId, "candidate_uuid": candidate[0]},
            ).fetchone()

            if not assessment:
                raise HTTPException(status_code=404, detail="Assessment not found for this candidate.")

            question = connection.execute(
                text(
                    """
                    SELECT id
                    FROM questions
                    WHERE id::text = :question_id
                      AND assessment_id = :assessment_id
                      AND candidate_id = :candidate_uuid
                    """
                ),
                {
                    "question_id": payload.questionId,
                    "assessment_id": assessment[0],
                    "candidate_uuid": candidate[0],
                },
            ).fetchone()

            if not question:
                raise HTTPException(status_code=404, detail="Question not found for this assessment.")

            evaluation_id = str(uuid.uuid4())

            connection.execute(
                text(
                    """
                    INSERT INTO evaluations (
                        id,
                        assessment_id,
                        candidate_id,
                        question_id,
                        user_code,
                        user_analysis,
                        score,
                        correct,
                        explanation,
                        suggestions,
                        corrected_code,
                        created_at,
                        updated_at
                    ) VALUES (
                        :id,
                        :assessment_id,
                        :candidate_id,
                        :question_id,
                        :user_code,
                        :user_analysis,
                        :score,
                        :correct,
                        :explanation,
                        :suggestions,
                        :corrected_code,
                        NOW(),
                        NOW()
                    )
                    ON CONFLICT (question_id) DO UPDATE SET
                        assessment_id = EXCLUDED.assessment_id,
                        candidate_id = EXCLUDED.candidate_id,
                        user_code = EXCLUDED.user_code,
                        user_analysis = EXCLUDED.user_analysis,
                        score = EXCLUDED.score,
                        correct = EXCLUDED.correct,
                        explanation = EXCLUDED.explanation,
                        suggestions = EXCLUDED.suggestions,
                        corrected_code = EXCLUDED.corrected_code,
                        updated_at = NOW()
                    """
                ),
                {
                    "id": evaluation_id,
                    "assessment_id": assessment[0],
                    "candidate_id": candidate[0],
                    "question_id": question[0],
                    "user_code": payload.userCode or "",
                    "user_analysis": payload.userAnalysis or "",
                    "score": None,
                    "correct": None,
                    "explanation": "",
                    "suggestions": "",
                    "corrected_code": "",
                },
            )

        return {
            "message": "Exercise question submitted.",
            "evaluationId": evaluation_id,
            "assessmentId": payload.assessmentId,
            "questionId": payload.questionId,
            "submitted": True,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to submit exercise question: {str(exc)}") from exc


# ---------------------------------------------------------
# Routers
# ---------------------------------------------------------

app.include_router(
    debugging_router
)
app.include_router(
    mock_assessment_router
)
app.include_router(
    concept_learning_router
)
app.include_router(
    practice_question_router
)