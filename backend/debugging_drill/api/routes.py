import os
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import create_engine, text

from debugging_drill.models.request_models import (
    GenerateRequest,
    EvaluateRequest,
)

from debugging_drill.models.response_models import (
    GenerateResponse,
    EvaluateResponse,
)

from debugging_drill.services.json_service import JsonService
from debugging_drill.services.prompt_service import PromptService
from debugging_drill.services.ollama_service import OllamaService
from debugging_drill.services.evaluation_service import EvaluationService


router = APIRouter(
    prefix="/debugging-drill",
    tags=["Debugging Drill"],
)

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:1234@localhost:5432/karat_prep_assistant",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

json_service = JsonService()

prompt_service = PromptService()

ollama_service = OllamaService()

evaluation_service = EvaluationService(
    ollama_service=ollama_service,
    prompt_service=prompt_service,
)


def ensure_question_table():
    with engine.begin() as connection:
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
                    source VARCHAR(50) DEFAULT 'ollama',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE questions
                ADD COLUMN IF NOT EXISTS candidate_id UUID
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE questions
                ADD COLUMN IF NOT EXISTS subtopic VARCHAR(255)
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE questions
                ADD COLUMN IF NOT EXISTS description TEXT
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE questions
                ADD COLUMN IF NOT EXISTS source VARCHAR(50)
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE questions
                ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50)
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE questions
                ADD COLUMN IF NOT EXISTS code TEXT
                """
            )
        )


@router.get("/collections")
def get_collections():
    """
    Returns drills.json to frontend.
    """

    return json_service.load()


@router.post(
    "/generate",
    response_model=GenerateResponse,
)
def generate_question(
    request: GenerateRequest,
    http_request: Request,
):
    """
    Generate one debugging question and persist it to the questions table.
    """
    ensure_question_table()

    candidate_token = (http_request.cookies.get("auth_token") or "").strip()
    if not candidate_token.startswith("candidate-"):
        raise HTTPException(status_code=401, detail="Candidate not logged in.")

    candidate_id = candidate_token.replace("candidate-", "", 1)

    drill = json_service.get_drill(
        request.id
    )

    if drill is None:
        raise HTTPException(
            status_code=404,
            detail="Drill not found",
        )

    with engine.begin() as connection:
        candidate = connection.execute(
            text("SELECT id FROM candidates WHERE id::text = :candidate_id"),
            {"candidate_id": candidate_id},
        ).fetchone()

        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found.")

        current_assessment = connection.execute(
            text(
                """
                SELECT id
                FROM assessments
                WHERE candidate_id = :candidate_id
                  AND status = 'in_progress'
                  AND round = 1
                ORDER BY created_at DESC
                LIMIT 1
                """
            ),
            {"candidate_id": candidate[0]},
        ).fetchone()

        if not current_assessment:
            raise HTTPException(status_code=404, detail="No active debugging assessment found for this candidate.")

        assessment_id = current_assessment[0]
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

    prompt = prompt_service.build_generation_prompt(
        drill
    )

    generated_code = ollama_service.generate_code(
        prompt
    )

    topic = drill["prompt"]["topic"]
    subtopic = drill.get("title") or drill.get("id") or "General"
    difficulty = "medium"
    description = ""

    question_id = str(uuid.uuid4())

    with engine.begin() as connection:
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
                "candidate_id": candidate[0],
                "question_no": int(next_question_no),
                "topic": topic,
                "subtopic": subtopic,
                "difficulty": difficulty,
                "description": description,
                "code": generated_code,
                "source": "ollama",
            },
        )

    return GenerateResponse(
        topic=topic,
        difficulty=difficulty,
        code=generated_code,
    )


@router.post(
    "/evaluate",
    response_model=EvaluateResponse,
)
def evaluate_solution(
    request: EvaluateRequest,
):
    """
    Evaluate candidate solution.
    """

    drill = json_service.get_drill(
        request.id
    )

    if drill is None:
        raise HTTPException(
            status_code=404,
            detail="Drill not found",
        )

    result = evaluation_service.evaluate(
        drill=drill,
        user_analysis=request.userAnalysis,
        original_code=request.originalCode,
    )

    return EvaluateResponse(
        score=result["score"],
        correct=result["correct"],
        explanation=result["explanation"],
        suggestions=result["suggestions"],
        correctedCode=result["correctedCode"],
        buggyCode=result.get("buggyCode", ""),
    )