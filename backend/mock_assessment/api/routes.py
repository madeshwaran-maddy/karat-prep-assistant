import asyncio
import json
import os
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text

from ..models.request_models import EvaluateRequest
from ..models.response_models import Round1Question, Round2Question, AssessmentResponse
from ..services.assessment_service import (
    create_assessment_id,
    generate_round1_questions,
)
from ..services.evaluation_service import build_evaluation_submission
from ..services.excel_service import get_random_round2_question
try:
    from config.languages import get_language
except ModuleNotFoundError:
    from backend.config.languages import get_language

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL, pool_pre_ping=True)


router = APIRouter(
    prefix="/api/mock-assessment",
    tags=["Mock Assessment"],
)

# Development-only in-memory assessment store.
# Replace with Redis/database later if persistence or multiple backend workers are needed.
ASSESSMENTS = {}


@router.get("/questions", response_model=AssessmentResponse)
async def get_mock_assessment_questions(
    request: Request,
    language: str = Query("java"),
    interviewer_name: str = Query(..., min_length=1, max_length=255),
):
    try:
        get_language(language)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    candidate_token = (request.cookies.get("auth_token") or "").strip()
    if not candidate_token or not candidate_token.startswith("candidate-"):
        raise HTTPException(status_code=401, detail="Candidate not logged in.")

    candidate_id = candidate_token.replace("candidate-", "", 1)
    interviewer_name = interviewer_name.strip()
    if not interviewer_name:
        raise HTTPException(status_code=400, detail="Interviewer name is required.")

    with engine.connect() as connection:
        candidate = connection.execute(
            text("SELECT id, mock_enabled FROM candidates WHERE id::text = :candidate_id"),
            {"candidate_id": candidate_id},
        ).fetchone()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    if not candidate[1]:
        raise HTTPException(status_code=403, detail="Mock assessment is disabled for this candidate.")

    candidate_uuid = candidate[0]

    try:
        print("→ Generating Round 1 questions from Ollama...")
        round1 = await generate_round1_questions(4, language_id=language)
        print(f"✓ Successfully generated {len(round1)} Round 1 questions")

        print("→ Loading Round 2 question from Excel...")
        round2 = get_random_round2_question(language)
        round2["language"] = language
        print("✓ Successfully loaded Round 2 question")

        with engine.begin() as connection:
            next_attempt = connection.execute(
                text(
                    """
                    SELECT COALESCE(MAX(attempt_no), 0) + 1
                    FROM assessments
                    WHERE candidate_id = :candidate_uuid AND round = 3
                    """
                ),
                {"candidate_uuid": candidate_uuid},
            ).scalar()

            assessment_id = str(uuid.uuid4())

            connection.execute(
                text(
                    """
                    INSERT INTO assessments (
                        id, candidate_id, interviewer_name, attempt_no, round, status, created_at, updated_at
                    ) VALUES (
                        :assessment_id,
                        :candidate_uuid,
                        :interviewer_name,
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
                    "interviewer_name": interviewer_name,
                    "attempt_no": int(next_attempt),
                    "round": 3,
                    "status": "in_progress",
                },
            )

        with engine.begin() as connection:
            for question in round1:
                question_id = str(uuid.uuid4())
                question_no = int(question.get("questionNo") or 0)
                topic = question.get("topic") or f"Question {question_no}"
                code = question.get("code") or ""
                description = question.get("description") or ""
                difficulty = question.get("_difficulty") or ""

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
                        "question_no": question_no,
                        "topic": topic,
                        "subtopic": "",
                        "difficulty": difficulty,
                        "description": description,
                        "code": code,
                        "source": question.get("source", "ollama"),
                    },
                )

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
            sequential_question_no = int(next_question_no)
            round2["questionNo"] = sequential_question_no

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
                    "question_no": sequential_question_no,
                    "topic": f"Question {sequential_question_no}",
                    "subtopic": "",
                    "difficulty": "",
                    "description": "",
                    "code": round2.get("code", ""),
                    "source": "excel",
                },
            )

        ASSESSMENTS[assessment_id] = {
            "round1Questions": round1,
            "round2Question": round2,
        }

        public_round1 = [
            {key: value for key, value in question.items() if not key.startswith("_")}
            for question in round1
        ]

        response = {
            "assessmentId": assessment_id,
            "interviewerName": interviewer_name,
            "language": language,
            "round1Questions": public_round1,
            "round2Question": round2,
        }

        print(f"✓ Assessment created with ID: {assessment_id}")
        print(f"✓ Response contains {len(public_round1)} round1 questions and 1 round2 question")

        return response

    except HTTPException:
        raise
    except Exception as exc:
        print(f"✗ Error in /questions endpoint: {exc}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate assessment: {str(exc)}",
        ) from exc


@router.get("/questions-stream")
async def get_mock_assessment_questions_stream(
    request: Request,
    language: str = Query("java"),
    interviewer_name: str = Query(..., min_length=1, max_length=255),
):
    """Keep the proxy connection alive while mock questions are generated."""

    async def events():
        task = asyncio.create_task(
            get_mock_assessment_questions(
                request=request,
                language=language,
                interviewer_name=interviewer_name,
            )
        )
        yield json.dumps({"status": "generating"}) + "\n"

        while not task.done():
            await asyncio.sleep(5)
            if not task.done():
                yield json.dumps({"status": "waiting"}) + "\n"

        try:
            result = await task
            yield json.dumps({"status": "complete", "data": result}) + "\n"
        except HTTPException as exc:
            yield json.dumps({
                "status": "error",
                "status_code": exc.status_code,
                "detail": exc.detail,
            }) + "\n"
        except Exception:
            yield json.dumps({
                "status": "error",
                "status_code": 500,
                "detail": "Mock assessment generation failed.",
            }) + "\n"

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/evaluate")
async def evaluate_question(request: EvaluateRequest, http_request: Request):
    candidate_token = (http_request.cookies.get("auth_token") or "").strip()
    if not candidate_token or not candidate_token.startswith("candidate-"):
        raise HTTPException(status_code=401, detail="Candidate not logged in.")

    candidate_id = candidate_token.replace("candidate-", "", 1)

    try:
        resolved_question_id = None
        with engine.begin() as connection:
            candidate = connection.execute(
                text("SELECT id FROM candidates WHERE id::text = :candidate_id"),
                {"candidate_id": candidate_id},
            ).fetchone()

            if not candidate:
                raise HTTPException(status_code=404, detail="Candidate not found.")

            question_query = """
                SELECT id, question_no
                FROM questions
                WHERE assessment_id::text = :assessment_id
                  AND candidate_id = :candidate_uuid
                  AND question_no = :question_no
            """
            if request.round == 2:
                question_query += "\n                  AND source = 'excel'"

            question_record = connection.execute(
                text(
                    question_query + """
                ORDER BY created_at DESC
                LIMIT 1
                """
                ),
                {
                    "assessment_id": request.assessment_id,
                    "candidate_uuid": candidate[0],
                    "question_no": request.question_no,
                },
            ).fetchone()

            if not question_record:
                question_record = connection.execute(
                    text(
                        """
                        SELECT id, question_no
                        FROM questions
                        WHERE assessment_id::text = :assessment_id
                          AND candidate_id = :candidate_uuid
                          AND source = 'excel'
                        ORDER BY question_no DESC, created_at DESC
                        LIMIT 1
                        """
                    ),
                    {
                        "assessment_id": request.assessment_id,
                        "candidate_uuid": candidate[0],
                    },
                ).fetchone()

            if not question_record:
                raise HTTPException(
                    status_code=404,
                    detail="Question not found for this assessment.",
                )

            resolved_question_id = str(question_record[0])

            payload = build_evaluation_submission(
                assessment_id=request.assessment_id,
                candidate_id=str(candidate[0]),
                question_id=resolved_question_id,
                user_code=request.user_code,
                user_analysis=request.user_analysis,
            )

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
                    "id": str(uuid.uuid4()),
                    "assessment_id": payload["assessment_id"],
                    "candidate_id": payload["candidate_id"],
                    "question_id": payload["question_id"],
                    "user_code": payload["user_code"],
                    "user_analysis": payload["user_analysis"],
                    "score": payload["score"],
                    "correct": payload["correct"],
                    "explanation": payload["explanation"],
                    "suggestions": payload["suggestions"],
                    "corrected_code": payload["corrected_code"],
                },
            )

        return {
            "message": "Mock assessment submitted.",
            "assessmentId": request.assessment_id,
            "questionId": resolved_question_id,
            "submitted": True,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
