from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session

from database import get_db
from practice_question_tracking.service import PracticeQuestionProgressService
from practice_question_tracking.schemas import (
    PracticeQuestionProgressResponse,
    UserPracticeProgressResponse,
)

router = APIRouter(
    prefix="/api/practice-questions",
    tags=["Practice Question Progress"],
)


def get_candidate_id(request: Request) -> str:
    """Extract candidate_id from auth cookie"""
    candidate_token = (request.cookies.get("auth_token") or "").strip()
    if not candidate_token or not candidate_token.startswith("candidate-"):
        raise HTTPException(status_code=401, detail="Candidate not logged in.")
    return candidate_token.replace("candidate-", "", 1)


@router.post("/progress/start/{section}/{topic_id}/{question_no}", response_model=PracticeQuestionProgressResponse)
async def start_question(
    section: str,
    topic_id: str,
    question_no: int,
    request: Request,
    language_selected: str = None,
    db: Session = Depends(get_db),
):
    """Start tracking progress for a practice question"""
    candidate_id = get_candidate_id(request)
    print(candidate_id)
    print(db)
    
    try:
        progress = PracticeQuestionProgressService.start_question(
            db=db,
            candidate_id=candidate_id,
            section=section,
            topic_id=topic_id,
            question_no=question_no,
            language_selected=language_selected,
        )
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start question: {str(e)}")


@router.post("/progress/complete/{section}/{topic_id}/{question_no}", response_model=PracticeQuestionProgressResponse)
async def complete_question(
    section: str,
    topic_id: str,
    question_no: int,
    request: Request,
    time_spent_seconds: int = 0,
    db: Session = Depends(get_db),
):
    """Mark a question as completed"""
    candidate_id = get_candidate_id(request)
    
    try:
        progress = PracticeQuestionProgressService.complete_question(
            db=db,
            candidate_id=candidate_id,
            section=section,
            topic_id=topic_id,
            question_no=question_no,
            time_spent_seconds=time_spent_seconds,
        )
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete question: {str(e)}")


@router.post("/progress/update-time/{section}/{topic_id}/{question_no}", response_model=PracticeQuestionProgressResponse)
async def update_time_spent(
    section: str,
    topic_id: str,
    question_no: int,
    request: Request,
    time_spent_seconds: int,
    db: Session = Depends(get_db),
):
    """Update time spent on a question"""
    candidate_id = get_candidate_id(request)
    
    try:
        progress = PracticeQuestionProgressService.update_time_spent(
            db=db,
            candidate_id=candidate_id,
            section=section,
            topic_id=topic_id,
            question_no=question_no,
            time_spent_seconds=time_spent_seconds,
        )
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update time: {str(e)}")


@router.get("/progress/topic/{section}/{topic_id}")
async def get_topic_progress(
    section: str,
    topic_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Get all progress for a topic"""
    candidate_id = get_candidate_id(request)
    
    try:
        progress = PracticeQuestionProgressService.get_topic_progress(
            db=db,
            candidate_id=candidate_id,
            section=section,
            topic_id=topic_id,
        )
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch topic progress: {str(e)}")


@router.get("/progress/all", response_model=UserPracticeProgressResponse)
async def get_all_progress(
    request: Request,
    db: Session = Depends(get_db),
):
    """Get all practice progress for a candidate"""
    candidate_id = get_candidate_id(request)
    
    try:
        progress = PracticeQuestionProgressService.get_all_progress(
            db=db,
            candidate_id=candidate_id,
        )
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch all progress: {str(e)}")


@router.get("/progress/question/{section}/{topic_id}/{question_no}", response_model=PracticeQuestionProgressResponse)
async def get_question_progress(
    section: str,
    topic_id: str,
    question_no: int,
    request: Request,
    db: Session = Depends(get_db),
):
    """Get progress for a specific question"""
    candidate_id = get_candidate_id(request)
    
    try:
        progress = PracticeQuestionProgressService.get_question_progress(
            db=db,
            candidate_id=candidate_id,
            section=section,
            topic_id=topic_id,
            question_no=question_no,
        )
        if not progress:
            return {"status": "not_started"}  # Return default if not started yet
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch question progress: {str(e)}")
