from fastapi import APIRouter, HTTPException, Request
from .models import ConceptProgress, ConceptProgressUpdate, UserProgressResponse
from .service import ConceptProgressService

router = APIRouter(
    prefix="/api/concept-learning",
    tags=["Concept Learning Progress"],
)


@router.post("/progress/start/{concept_id}", response_model=ConceptProgress)
async def start_concept(concept_id: str, request: Request):
    """Start tracking progress for a concept"""
    candidate_token = (request.cookies.get("auth_token") or "").strip()
    if not candidate_token or not candidate_token.startswith("candidate-"):
        raise HTTPException(status_code=401, detail="Candidate not logged in.")

    candidate_id = candidate_token.replace("candidate-", "", 1)

    try:
        progress = ConceptProgressService.start_concept(candidate_id, concept_id)
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start concept: {str(e)}")


@router.post("/progress/complete/{concept_id}", response_model=ConceptProgress)
async def complete_concept(concept_id: str, request: Request):
    """Mark a concept as completed"""
    candidate_token = (request.cookies.get("auth_token") or "").strip()
    if not candidate_token or not candidate_token.startswith("candidate-"):
        raise HTTPException(status_code=401, detail="Candidate not logged in.")

    candidate_id = candidate_token.replace("candidate-", "", 1)

    try:
        progress = ConceptProgressService.complete_concept(candidate_id, concept_id)
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete concept: {str(e)}")


@router.post("/progress/update/{concept_id}", response_model=ConceptProgress)
async def update_concept_progress(
    concept_id: str, time_spent_seconds: int, request: Request
):
    """Update progress with time spent on a concept"""
    candidate_token = (request.cookies.get("auth_token") or "").strip()
    if not candidate_token or not candidate_token.startswith("candidate-"):
        raise HTTPException(status_code=401, detail="Candidate not logged in.")

    candidate_id = candidate_token.replace("candidate-", "", 1)

    try:
        progress = ConceptProgressService.update_progress(
            candidate_id, concept_id, time_spent_seconds
        )
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")


@router.get("/progress/{concept_id}", response_model=ConceptProgress)
async def get_concept_progress(concept_id: str, request: Request):
    """Get progress for a specific concept"""
    candidate_token = (request.cookies.get("auth_token") or "").strip()
    if not candidate_token or not candidate_token.startswith("candidate-"):
        raise HTTPException(status_code=401, detail="Candidate not logged in.")

    candidate_id = candidate_token.replace("candidate-", "", 1)

    try:
        progress = ConceptProgressService.get_progress(candidate_id, concept_id)
        if not progress:
            # Return default progress if not found
            return ConceptProgress(
                id="",
                candidate_id=candidate_id,
                concept_id=concept_id,
                status="not_started",
                time_spent_seconds=0,
                created_at=None,
                updated_at=None,
            )
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get progress: {str(e)}")


@router.get("/progress", response_model=UserProgressResponse)
async def get_all_progress(request: Request):
    """Get all progress for the candidate with summary statistics"""
    candidate_token = (request.cookies.get("auth_token") or "").strip()
    if not candidate_token or not candidate_token.startswith("candidate-"):
        raise HTTPException(status_code=401, detail="Candidate not logged in.")

    candidate_id = candidate_token.replace("candidate-", "", 1)

    try:
        return ConceptProgressService.get_all_progress(candidate_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get progress: {str(e)}")
