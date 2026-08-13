from fastapi import APIRouter, HTTPException

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

json_service = JsonService()

prompt_service = PromptService()

ollama_service = OllamaService()

evaluation_service = EvaluationService(
    ollama_service=ollama_service,
    prompt_service=prompt_service,
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
):
    """
    Generate one debugging question.
    """

    drill = json_service.get_drill(
        request.id
    )

    if drill is None:
        raise HTTPException(
            status_code=404,
            detail="Drill not found",
        )

    prompt = prompt_service.build_generation_prompt(
        drill
    )

    generated_code = ollama_service.generate_code(
        prompt
    )

    return GenerateResponse(
        topic=drill["prompt"]["topic"],
        difficulty=drill["difficulty"],
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
    )

    return EvaluateResponse(
        score=result["score"],
        correct=result["correct"],
        explanation=result["explanation"],
        suggestions=result["suggestions"],
        correctedCode=result["correctedCode"],
    )