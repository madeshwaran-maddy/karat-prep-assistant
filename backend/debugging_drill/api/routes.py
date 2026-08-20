import json
import os
import uuid
import asyncio

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
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
try:
    from config.languages import get_language
except ModuleNotFoundError:
    from backend.config.languages import get_language


router = APIRouter(
    prefix="/debugging-drill",
    tags=["Debugging Drill"],
)

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

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

        for column_sql in [
            "ALTER TABLE questions ADD COLUMN IF NOT EXISTS candidate_id UUID",
            "ALTER TABLE questions ADD COLUMN IF NOT EXISTS subtopic VARCHAR(255)",
            "ALTER TABLE questions ADD COLUMN IF NOT EXISTS description TEXT",
            "ALTER TABLE questions ADD COLUMN IF NOT EXISTS source VARCHAR(50)",
            "ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50)",
            "ALTER TABLE questions ADD COLUMN IF NOT EXISTS code TEXT",
        ]:
            connection.execute(text(column_sql))


def ensure_evaluation_table():
    with engine.begin() as connection:
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
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'evaluations'
                          AND column_name = 'suggestions'
                          AND data_type = 'ARRAY'
                    ) THEN
                        ALTER TABLE evaluations
                        ALTER COLUMN suggestions TYPE TEXT
                        USING array_to_string(suggestions, ',');
                    END IF;
                END $$;
                """
            )
        )

        connection.execute(
            text(
                """
                DELETE FROM evaluations a
                USING evaluations b
                WHERE a.id > b.id
                  AND a.question_id = b.question_id
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

        for column_sql in [
            "ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS user_code TEXT",
            "ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS user_analysis TEXT",
            "ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS score INTEGER",
            "ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS correct BOOLEAN",
            "ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS explanation TEXT",
            "ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS suggestions TEXT",
            "ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS corrected_code TEXT",
        ]:
            connection.execute(text(column_sql))


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
    try:
        get_language(request.language)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    ensure_question_table()

    candidate_token = (http_request.cookies.get("auth_token") or "").strip()
    if not candidate_token.startswith("candidate-"):
        raise HTTPException(status_code=401, detail="Candidate not logged in.")

    candidate_id = candidate_token.replace("candidate-", "", 1)

    drill = json_service.get_drill(request.id, request.language)

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
        drill,
        request.language,
    )

    try:
        generated_code = ollama_service.generate_code(prompt)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Ollama service is unavailable: {exc}",
        ) from exc

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
        id=question_id,
        topic=topic,
        difficulty=difficulty,
        code=generated_code,
    )


@router.post("/generate-stream")
async def generate_question_stream(
    request: GenerateRequest,
    http_request: Request,
):
    """Keep the proxy connection alive while the synchronous Ollama call runs."""

    async def events():
        task = asyncio.create_task(
            asyncio.to_thread(generate_question, request, http_request)
        )
        yield json.dumps({"status": "generating"}) + "\n"

        while not task.done():
            await asyncio.sleep(5)
            if not task.done():
                yield json.dumps({"status": "waiting"}) + "\n"

        try:
            result = await task
            yield json.dumps({"status": "complete", "data": result.model_dump()}) + "\n"
        except HTTPException as exc:
            yield json.dumps({
                "status": "error",
                "status_code": exc.status_code,
                "detail": exc.detail,
            }) + "\n"
        except Exception as exc:
            yield json.dumps({
                "status": "error",
                "status_code": 500,
                "detail": "Debugging question generation failed.",
            }) + "\n"

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post(
    "/evaluate",
    response_model=EvaluateResponse,
)
def evaluate_solution(
    request: EvaluateRequest,
    http_request: Request,
):
    """
    Evaluate candidate solution and persist the result to the evaluations table.
    """
    print(
        f"[debugging-evaluate] start id={request.id} language={request.language} "
        f"question_id={request.questionId} assessment_id={request.assessmentId} "
        f"analysis_length={len(request.userAnalysis)} code_length={len(request.userCode or '')}",
        flush=True,
    )

    print("[debugging-evaluate] ensuring tables", flush=True)
    ensure_question_table()
    ensure_evaluation_table()

    candidate_token = (http_request.cookies.get("auth_token") or "").strip()
    if not candidate_token.startswith("candidate-"):
        print("[debugging-evaluate] candidate authentication failed", flush=True)
        raise HTTPException(status_code=401, detail="Candidate not logged in.")

    candidate_id = candidate_token.replace("candidate-", "", 1)

    with engine.begin() as connection:
        print("[debugging-evaluate] checking candidate, assessment, and question", flush=True)
        candidate = connection.execute(
            text("SELECT id FROM candidates WHERE id::text = :candidate_id"),
            {"candidate_id": candidate_id},
        ).fetchone()

        if not candidate:
            print("[debugging-evaluate] candidate not found", flush=True)
            raise HTTPException(status_code=404, detail="Candidate not found.")

        assessment_id = request.assessmentId
        if not assessment_id:
            assessment_id = connection.execute(
                text(
                    """
                    SELECT id
                    FROM assessments
                    WHERE candidate_id = :candidate_id
                      AND status = 'in_progress'
                    ORDER BY created_at DESC
                    LIMIT 1
                    """
                ),
                {"candidate_id": candidate[0]},
            ).scalar()

        if not assessment_id:
            print("[debugging-evaluate] active assessment not found", flush=True)
            raise HTTPException(status_code=404, detail="No active assessment found for this candidate.")

        question_id = request.questionId
        if not question_id:
            question_id = connection.execute(
                text(
                    """
                    SELECT id
                    FROM questions
                    WHERE assessment_id = :assessment_id
                    ORDER BY question_no DESC, created_at DESC
                    LIMIT 1
                    """
                ),
                {"assessment_id": assessment_id},
            ).scalar()

        if not question_id:
            print("[debugging-evaluate] question not found", flush=True)
            raise HTTPException(status_code=404, detail="No question exists for this assessment.")

    drill = json_service.get_drill(request.id, request.language)

    if drill is None:
        print("[debugging-evaluate] drill not found", flush=True)
        raise HTTPException(
            status_code=404,
            detail="Drill not found",
        )

    print("[debugging-evaluate] calling evaluation service", flush=True)
    try:
        result = evaluation_service.evaluate(
            drill=drill,
            user_analysis=request.userAnalysis,
            original_code=request.originalCode,
            language=request.language,
        )
    except Exception as exc:
        print(f"[debugging-evaluate] evaluation service failed: {exc}", flush=True)
        raise

    print(
        f"[debugging-evaluate] evaluation result score={result.get('score')} "
        f"suggestions={len(result.get('suggestions', []))} "
        f"corrected_code_length={len(result.get('correctedCode', '') or '')}",
        flush=True,
    )

    suggestion_text = json.dumps(result.get("suggestions", []))
    evaluation_id = str(uuid.uuid4())

    with engine.begin() as connection:
        print("[debugging-evaluate] persisting evaluation", flush=True)
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
                "assessment_id": assessment_id,
                "candidate_id": candidate[0],
                "question_id": question_id,
                "user_code": request.userCode or request.originalCode or "",
                "user_analysis": request.userAnalysis,
                "score": int(result["score"]),
                "correct": bool(result["correct"]),
                "explanation": result["explanation"],
                "suggestions": suggestion_text,
                "corrected_code": result.get("correctedCode", ""),
            },
        )

    print(f"[debugging-evaluate] complete evaluation_id={evaluation_id}", flush=True)

    return EvaluateResponse(
        score=result["score"],
        correct=result["correct"],
        explanation=result["explanation"],
        suggestions=result["suggestions"],
        correctedCode=result["correctedCode"],
        buggyCode=result.get("buggyCode", ""),
    )


@router.post("/evaluate-stream")
async def evaluate_solution_stream(
    request: EvaluateRequest,
    http_request: Request,
):
    """Keep the proxy connection alive while Ollama evaluates the solution."""

    async def events():
        task = asyncio.create_task(
            asyncio.to_thread(evaluate_solution, request, http_request)
        )
        yield json.dumps({"status": "evaluating"}) + "\n"

        while not task.done():
            await asyncio.sleep(5)
            if not task.done():
                yield json.dumps({"status": "waiting"}) + "\n"

        try:
            result = await task
            yield json.dumps({"status": "complete", "data": result.model_dump()}) + "\n"
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
                "detail": "Solution evaluation failed.",
            }) + "\n"

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )