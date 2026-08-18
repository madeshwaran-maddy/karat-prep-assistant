from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel
from uuid import UUID


class PracticeQuestionProgressBase(BaseModel):
    section: str
    topic_id: str
    question_no: int
    language_selected: Optional[str] = None


class PracticeQuestionProgressCreate(PracticeQuestionProgressBase):
    pass


class PracticeQuestionProgressUpdate(BaseModel):
    status: Optional[str] = None
    time_spent_seconds: Optional[int] = None
    language_selected: Optional[str] = None


class PracticeQuestionProgressResponse(PracticeQuestionProgressBase):
    id: UUID
    candidate_id: UUID
    status: str
    time_spent_seconds: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    last_accessed: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TopicProgressSummary(BaseModel):
    section: str
    topic_id: str
    total_questions: int
    completed_questions: int
    in_progress_questions: int
    average_time_spent: float
    progress_percentage: float


class UserPracticeProgressResponse(BaseModel):
    progress_map: Dict[str, PracticeQuestionProgressResponse]
    summary_by_topic: Dict[str, TopicProgressSummary]
    total_time_spent: int
