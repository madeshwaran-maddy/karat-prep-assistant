from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..models.request_models import EvaluateRequest
from ..models.response_models import Round1Question, Round2Question, AssessmentResponse
from ..services.assessment_service import (
    create_assessment_id,
    generate_round1_questions,
)
from ..services.evaluation_service import evaluate_code
from ..services.excel_service import get_random_round2_question


router = APIRouter(
    prefix="/api/mock-assessment",
    tags=["Mock Assessment"],
)

# Development-only in-memory assessment store.
# Replace with Redis/database later if persistence or multiple backend workers are needed.
ASSESSMENTS = {}


@router.get("/questions", response_model=AssessmentResponse)
async def get_mock_assessment_questions():
    try:
        print("→ Generating Round 1 questions from Ollama...")
        round1 = await generate_round1_questions(4)
        print(f"✓ Successfully generated {len(round1)} Round 1 questions")
        
        print("→ Loading Round 2 question from Excel...")
        round2 = get_random_round2_question()
        print("✓ Successfully loaded Round 2 question")

        assessment_id = create_assessment_id()

        ASSESSMENTS[assessment_id] = {
            "round1Questions": round1,
            "round2Question": round2,
        }

        # Filter out private fields (those starting with "_") for frontend
        public_round1 = [
            {key: value for key, value in question.items() if not key.startswith("_")}
            for question in round1
        ]

        # Validate response structure
        response = {
            "assessmentId": assessment_id,
            "round1Questions": public_round1,
            "round2Question": round2,
        }
        
        print(f"✓ Assessment created with ID: {assessment_id}")
        print(f"✓ Response contains {len(public_round1)} round1 questions and 1 round2 question")
        
        return response

    except Exception as exc:
        print(f"✗ Error in /questions endpoint: {exc}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate assessment: {str(exc)}"
        ) from exc


@router.post("/evaluate")
async def evaluate_question(request: EvaluateRequest):
    assessment = ASSESSMENTS.get(request.assessment_id)

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    all_questions = (
        assessment["round1Questions"]
        + [assessment["round2Question"]]
    )

    question = next(
        (
            item
            for item in all_questions
            if item["questionNo"] == request.question_no
            and item["round"] == 1
        ),
        None,
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Round 1 question not found for this assessment.",
        )

    try:
        result = await evaluate_code(
            topic=question["topic"],
            difficulty=question["_difficulty"],
            bug_types=question["_bugTypes"],
            rules=question["_rules"],
            original_code=question["code"],
            user_code=request.user_code,
        )

        return result

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
