from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ConceptProgressBase(BaseModel):
    concept_id: str
    status: str = "not_started"  # not_started, in_progress, completed
    time_spent_seconds: int = 0
    notes: Optional[str] = None


class ConceptProgressCreate(ConceptProgressBase):
    pass


class ConceptProgressUpdate(BaseModel):
    status: Optional[str] = None
    time_spent_seconds: Optional[int] = None
    notes: Optional[str] = None
    last_accessed: Optional[datetime] = None


class ConceptProgress(ConceptProgressBase):
    id: str
    candidate_id: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    last_accessed: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConceptProgressSummary(BaseModel):
    total_concepts: int
    completed_concepts: int
    in_progress_concepts: int
    not_started_concepts: int
    total_time_spent_seconds: int
    completion_percentage: float


class UserProgressResponse(BaseModel):
    """Response containing all concepts with their progress"""
    progress_map: dict[str, ConceptProgress]
    summary: ConceptProgressSummary
